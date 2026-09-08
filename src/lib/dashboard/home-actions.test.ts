import { describe, expect, it } from "vitest";
import {
	deriveHomeActions,
	type HomeActionWishlistInput,
} from "@/lib/dashboard/home-actions";
import type { PublishReadinessResult } from "@/lib/wishlist/publish-readiness";

const READY: PublishReadinessResult = {
	ready: true,
	checks: {
		title: true,
		eventType: true,
		slug: true,
		language: true,
		currency: true,
		visibleGift: true,
		images: true,
	},
};

const NOT_READY: PublishReadinessResult = {
	ready: false,
	checks: {
		title: true,
		eventType: true,
		slug: true,
		language: true,
		currency: false,
		visibleGift: false,
		images: true,
	},
};

const NOW = new Date("2026-09-08T12:00:00.000Z");

function makeWishlist(
	overrides: Partial<HomeActionWishlistInput> = {},
): HomeActionWishlistInput {
	return {
		id: "wl_1",
		title: "Baby shower de Emilia",
		status: "draft",
		isOwner: true,
		ownerName: null,
		eventDate: null,
		rsvpDeadline: null,
		createdAt: "2026-06-01T00:00:00.000Z",
		pendingInvites: 0,
		totalInvites: 0,
		readiness: READY,
		...overrides,
	};
}

describe("deriveHomeActions", () => {
	describe("complete_draft", () => {
		it("derives a completion action for a draft that is not publish-ready", () => {
			const result = deriveHomeActions({
				wishlists: [makeWishlist({ status: "draft", readiness: NOT_READY })],
				now: NOW,
			});

			expect(result.actions).toHaveLength(1);
			expect(result.actions[0]?.kind).toBe("complete_draft");
		});

		it("does not derive a completion action for a publish-ready draft", () => {
			const result = deriveHomeActions({
				wishlists: [makeWishlist({ status: "draft", readiness: READY })],
				now: NOW,
			});

			expect(result.actions).toHaveLength(0);
		});
	});

	describe("review_rsvps", () => {
		it("derives a single review action carrying the pending count", () => {
			const result = deriveHomeActions({
				wishlists: [
					makeWishlist({
						status: "published",
						readiness: READY,
						pendingInvites: 3,
						totalInvites: 5,
					}),
				],
				now: NOW,
			});

			expect(result.actions).toHaveLength(1);
			expect(result.actions[0]).toMatchObject({
				kind: "review_rsvps",
				pendingCount: 3,
			});
		});

		it("does not derive a review action when there are no pending invites", () => {
			const result = deriveHomeActions({
				wishlists: [
					makeWishlist({
						status: "published",
						readiness: READY,
						pendingInvites: 0,
						totalInvites: 5,
					}),
				],
				now: NOW,
			});

			expect(
				result.actions.some((action) => action.kind === "review_rsvps"),
			).toBe(false);
		});
	});

	describe("invite_guests", () => {
		it("derives an invite action for a published wishlist with no invites", () => {
			const result = deriveHomeActions({
				wishlists: [
					makeWishlist({
						status: "published",
						readiness: READY,
						totalInvites: 0,
					}),
				],
				now: NOW,
			});

			expect(result.actions).toHaveLength(1);
			expect(result.actions[0]?.kind).toBe("invite_guests");
		});

		it("does not derive an invite action once the wishlist has at least one invite", () => {
			const result = deriveHomeActions({
				wishlists: [
					makeWishlist({
						status: "published",
						readiness: READY,
						totalInvites: 1,
					}),
				],
				now: NOW,
			});

			expect(
				result.actions.some((action) => action.kind === "invite_guests"),
			).toBe(false);
		});
	});

	describe("archive", () => {
		it("derives an archive action for an owned wishlist whose event date has passed", () => {
			const result = deriveHomeActions({
				wishlists: [
					makeWishlist({
						status: "published",
						readiness: READY,
						totalInvites: 1,
						eventDate: "2026-01-01T00:00:00.000Z",
						isOwner: true,
					}),
				],
				now: NOW,
			});

			expect(result.actions).toHaveLength(1);
			expect(result.actions[0]?.kind).toBe("archive");
		});

		it("does not derive an archive action for a future event", () => {
			const result = deriveHomeActions({
				wishlists: [
					makeWishlist({
						status: "published",
						readiness: READY,
						eventDate: "2026-12-01T00:00:00.000Z",
						isOwner: true,
					}),
				],
				now: NOW,
			});

			expect(result.actions.some((action) => action.kind === "archive")).toBe(
				false,
			);
		});

		it("does not offer archiving to a collaborator, only to the owner", () => {
			const result = deriveHomeActions({
				wishlists: [
					makeWishlist({
						status: "published",
						readiness: READY,
						totalInvites: 1,
						eventDate: "2026-01-01T00:00:00.000Z",
						isOwner: false,
						ownerName: "Lucía",
					}),
				],
				now: NOW,
			});

			expect(result.actions).toHaveLength(0);
		});
	});

	it("excludes archived wishlists from every kind of action", () => {
		const result = deriveHomeActions({
			wishlists: [
				makeWishlist({
					status: "archived",
					readiness: NOT_READY,
					pendingInvites: 4,
					totalInvites: 4,
					eventDate: "2026-01-01T00:00:00.000Z",
					isOwner: true,
				}),
			],
			now: NOW,
		});

		expect(result.actions).toHaveLength(0);
	});

	it("identifies the wishlist's owner when the user is a member deriving a review_rsvps action", () => {
		const result = deriveHomeActions({
			wishlists: [
				makeWishlist({
					status: "published",
					readiness: READY,
					pendingInvites: 2,
					isOwner: false,
					ownerName: "Lucía",
				}),
			],
			now: NOW,
		});

		expect(result.actions[0]).toMatchObject({
			isOwner: false,
			ownerName: "Lucía",
		});
	});

	describe("ranking", () => {
		it("ranks a complete_draft action ahead of a review_rsvps action even with a nearer deadline", () => {
			const draft = makeWishlist({
				id: "wl_draft",
				status: "draft",
				readiness: NOT_READY,
				eventDate: "2026-09-12T00:00:00.000Z",
			});
			const review = makeWishlist({
				id: "wl_review",
				status: "published",
				readiness: READY,
				pendingInvites: 4,
				rsvpDeadline: "2026-09-11T00:00:00.000Z",
			});

			const result = deriveHomeActions({
				wishlists: [review, draft],
				now: NOW,
			});

			expect(result.nextStep?.kind).toBe("complete_draft");
			expect(result.nextStep?.wishlistId).toBe("wl_draft");
			expect(
				result.subsequentActions.some(
					(action) => action.kind === "review_rsvps",
				),
			).toBe(true);
		});

		it("orders two review_rsvps actions by the nearer RSVP deadline", () => {
			const far = makeWishlist({
				id: "wl_far",
				status: "published",
				readiness: READY,
				pendingInvites: 2,
				totalInvites: 2,
				rsvpDeadline: "2026-09-17T00:00:00.000Z",
			});
			const near = makeWishlist({
				id: "wl_near",
				status: "published",
				readiness: READY,
				pendingInvites: 2,
				totalInvites: 2,
				rsvpDeadline: "2026-09-10T00:00:00.000Z",
			});

			const result = deriveHomeActions({ wishlists: [far, near], now: NOW });

			expect(result.actions.map((action) => action.wishlistId)).toEqual([
				"wl_near",
				"wl_far",
			]);
		});

		it("orders a wishlist with a missing date after one with a date, within the same kind", () => {
			const withDate = makeWishlist({
				id: "wl_with_date",
				status: "published",
				readiness: READY,
				pendingInvites: 2,
				totalInvites: 2,
				rsvpDeadline: "2026-09-20T00:00:00.000Z",
			});
			const withoutDate = makeWishlist({
				id: "wl_without_date",
				status: "published",
				readiness: READY,
				pendingInvites: 2,
				totalInvites: 2,
				rsvpDeadline: null,
			});

			const result = deriveHomeActions({
				wishlists: [withoutDate, withDate],
				now: NOW,
			});

			expect(result.actions.map((action) => action.wishlistId)).toEqual([
				"wl_with_date",
				"wl_without_date",
			]);
		});

		it("breaks ties within a kind by createdAt descending", () => {
			const older = makeWishlist({
				id: "wl_older",
				status: "draft",
				readiness: NOT_READY,
				createdAt: "2026-01-01T00:00:00.000Z",
			});
			const newer = makeWishlist({
				id: "wl_newer",
				status: "draft",
				readiness: NOT_READY,
				createdAt: "2026-06-01T00:00:00.000Z",
			});

			const result = deriveHomeActions({ wishlists: [older, newer], now: NOW });

			expect(result.actions.map((action) => action.wishlistId)).toEqual([
				"wl_newer",
				"wl_older",
			]);
		});
	});

	describe("description copy", () => {
		it("names at most two unsatisfied checks", () => {
			const result = deriveHomeActions({
				wishlists: [
					makeWishlist({
						status: "draft",
						readiness: {
							ready: false,
							checks: {
								title: true,
								eventType: true,
								slug: true,
								language: false,
								currency: false,
								visibleGift: true,
								images: true,
							},
						},
					}),
				],
				now: NOW,
			});

			expect(result.actions[0]?.description).toBe(
				"Faltan el idioma y la moneda.",
			);
		});

		it("summarizes a remainder past two unsatisfied checks as a count", () => {
			const result = deriveHomeActions({
				wishlists: [
					makeWishlist({
						status: "draft",
						readiness: {
							ready: false,
							checks: {
								title: false,
								eventType: false,
								slug: false,
								language: false,
								currency: true,
								visibleGift: true,
								images: true,
							},
						},
					}),
				],
				now: NOW,
			});

			expect(result.actions[0]?.description).toBe(
				"Faltan el título, el tipo de evento y 2 más.",
			);
		});
	});
});
