import { describe, expect, it } from "vitest";
import type {
	Gift,
	InviteExtraGuest,
	Purchase,
	Wishlist,
} from "@/generated/prisma/client";
import {
	mapDashboardWishlist,
	mapDashboardWishlistOverview,
	mapDashboardWishlistSummary,
} from "@/server/mappers/dashboard-wishlist.mapper";
import type { InviteWithExtras } from "@/server/services/invite.service";
import { OWNER_MANUAL_PURCHASE_DEFAULT_NAME } from "@/server/services/purchase.service";

const now = new Date("2026-06-26T12:00:00Z");

function makeWishlist(overrides: Partial<Wishlist> = {}): Wishlist {
	return {
		id: "wl-1",
		ownerId: 1,
		title: "My Wishlist",
		slug: "my-wishlist",
		eventType: "birthday",
		language: "es",
		currency: "PEN",
		welcomeMessage: "Welcome!",
		welcomeMessageAttribution: null,
		thankYouMessage: null,
		giftListMessage: null,
		eventDate: null,
		eventTime: null,
		endTime: null,
		rsvpDeadline: null,
		eventLocation: null,
		dressCode: null,
		deliveryRecipientName: null,
		deliveryDocumentId: null,
		deliveryAddress: null,
		deliveryPhone: null,
		themeId: null,
		layoutId: null,
		buttonStyle: null,
		headingFont: null,
		bodyFont: null,
		countdownVariant: null,
		welcomeMessageVariant: null,
		thankYouMessageVariant: null,
		motifId: null,
		motifTreatment: null,
		motifPalette: null,
		showHowItWorks: true,
		status: "draft",
		publishedAt: null,
		archivedAt: null,
		createdAt: now,
		updatedAt: now,
		...overrides,
		subtitle: overrides.subtitle === undefined ? null : overrides.subtitle,
	};
}

function makeGift(overrides: Partial<Gift> = {}): Gift {
	return {
		id: "gift-1",
		wishlistId: "wl-1",
		categoryId: null,
		name: "Test Gift",
		productUrl: null,
		imageUrl: null,
		storeName: null,
		size: null,
		priceAmount: null,
		priceCurrency: null,
		quantityNeeded: 1,
		priority: "medium",
		visibilityStatus: "available",
		publicNote: null,
		internalNote: null,
		sortOrder: 0,
		deletedAt: null,
		createdAt: now,
		updatedAt: now,
		...overrides,
	};
}

function makePurchase(overrides: Partial<Purchase> = {}): Purchase {
	return {
		id: "purchase-1",
		giftId: "gift-1",
		guestName: "Guest",
		guestEmail: null,
		guestPhone: null,
		message: null,
		quantity: 1,
		undoTokenHash: null,
		undoExpiresAt: null,
		createdAt: now,
		updatedAt: now,
		...overrides,
	};
}

function makeInvite(
	overrides: Partial<InviteWithExtras> = {},
): InviteWithExtras {
	return {
		id: "invite-1",
		wishlistId: "wl-1",
		primaryName: "Guest",
		primaryEmail: null,
		primaryPhone: null,
		slug: "guest",
		status: "pending",
		openedAt: null,
		viewCount: 0,
		lastViewedAt: null,
		respondedAt: null,
		responseSource: null,
		responseLockedAt: null,
		createdAt: now,
		updatedAt: now,
		extraGuests: [],
		...overrides,
	};
}

function makeExtraGuest(
	overrides: Partial<InviteExtraGuest> = {},
): InviteExtraGuest {
	return {
		id: "extra-1",
		inviteId: "invite-1",
		name: null,
		status: "pending",
		sortOrder: 0,
		...overrides,
	};
}

describe("mapDashboardWishlist", () => {
	it("preserves present and absent subtitles", () => {
		expect(
			mapDashboardWishlist({
				...makeWishlist({ subtitle: "Celebramos juntos" }),
				gifts: [],
			}).subtitle,
		).toBe("Celebramos juntos");
		expect(
			mapDashboardWishlist({ ...makeWishlist(), gifts: [] }).subtitle,
		).toBeNull();
	});

	it("counts only visible non-deleted gifts", () => {
		const visible = makeGift({ id: "g1", visibilityStatus: "available" });
		const hidden = makeGift({ id: "g2", visibilityStatus: "hidden" });
		const deleted = makeGift({ id: "g3", deletedAt: now });
		const result = mapDashboardWishlist({
			...makeWishlist(),
			gifts: [
				{ ...visible, purchases: [] },
				{ ...hidden, purchases: [] },
				{ ...deleted, purchases: [] },
			],
		});
		expect(result.visibleGiftCount).toBe(1);
	});

	it("includes wishlist status", () => {
		const result = mapDashboardWishlist({
			...makeWishlist({ status: "published" }),
			gifts: [],
		});
		expect(result.status).toBe("published");
	});

	it("serializes eventDate to ISO string", () => {
		const eventDate = new Date("2026-12-25T00:00:00Z");
		const result = mapDashboardWishlist({
			...makeWishlist({ eventDate }),
			gifts: [],
		});
		expect(result.eventDate).toBe("2026-12-25T00:00:00.000Z");
	});

	it("maps null eventDate to null", () => {
		const result = mapDashboardWishlist({
			...makeWishlist({ eventDate: null }),
			gifts: [],
		});
		expect(result.eventDate).toBeNull();
	});

	it("serializes publishedAt and archivedAt", () => {
		const result = mapDashboardWishlist({
			...makeWishlist({ publishedAt: now, archivedAt: null }),
			gifts: [],
		});
		expect(result.publishedAt).toBe("2026-06-26T12:00:00.000Z");
		expect(result.archivedAt).toBeNull();
	});

	it("includes mapped dashboard gift rows", () => {
		const gift = makeGift({ quantityNeeded: 2 });
		const purchase = makePurchase({ quantity: 1 });
		const result = mapDashboardWishlist({
			...makeWishlist(),
			gifts: [{ ...gift, purchases: [purchase] }],
		});
		expect(result.gifts).toHaveLength(1);
		expect(result.gifts[0]?.purchasedQuantity).toBe(1);
		expect(result.gifts[0]?.remainingQuantity).toBe(1);
	});

	it("serializes createdAt and updatedAt", () => {
		const result = mapDashboardWishlist({
			...makeWishlist(),
			gifts: [],
		});
		expect(result.createdAt).toBe("2026-06-26T12:00:00.000Z");
		expect(result.updatedAt).toBe("2026-06-26T12:00:00.000Z");
	});
});

describe("mapDashboardWishlistSummary", () => {
	it("returns zero quantity aggregates when there are no visible gifts", () => {
		const result = mapDashboardWishlistSummary({
			...makeWishlist(),
			gifts: [
				{
					...makeGift({ id: "hidden", visibilityStatus: "hidden" }),
					purchases: [],
				},
				{ ...makeGift({ id: "deleted", deletedAt: now }), purchases: [] },
			],
		});

		expect(result.totalGiftCount).toBe(0);
		expect(result.availableGiftCount).toBe(0);
		expect(result.totalUnits).toBe(0);
		expect(result.purchasedUnits).toBe(0);
	});

	it("computes partial quantity progress from visible non-deleted gifts", () => {
		const result = mapDashboardWishlistSummary({
			...makeWishlist({ status: "published" }),
			gifts: [
				{
					...makeGift({ id: "g1", quantityNeeded: 3 }),
					purchases: [makePurchase({ id: "p1", giftId: "g1", quantity: 1 })],
				},
				{
					...makeGift({ id: "g2", quantityNeeded: 2 }),
					purchases: [makePurchase({ id: "p2", giftId: "g2", quantity: 2 })],
				},
				{
					...makeGift({
						id: "g3",
						quantityNeeded: 5,
						visibilityStatus: "hidden",
					}),
					purchases: [makePurchase({ id: "p3", giftId: "g3", quantity: 5 })],
				},
			],
		});

		expect(result.status).toBe("published");
		expect(result.totalGiftCount).toBe(2);
		expect(result.availableGiftCount).toBe(1);
		expect(result.totalUnits).toBe(5);
		expect(result.purchasedUnits).toBe(3);
	});

	it("caps over-purchased units at quantity needed", () => {
		const result = mapDashboardWishlistSummary({
			...makeWishlist(),
			gifts: [
				{
					...makeGift({ id: "g1", quantityNeeded: 2 }),
					purchases: [makePurchase({ id: "p1", giftId: "g1", quantity: 3 })],
				},
			],
		});

		expect(result.totalGiftCount).toBe(1);
		expect(result.availableGiftCount).toBe(0);
		expect(result.totalUnits).toBe(2);
		expect(result.purchasedUnits).toBe(2);
	});
});

describe("mapDashboardWishlistOverview", () => {
	const readiness = {
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

	it("maps overview metrics", () => {
		const result = mapDashboardWishlistOverview(
			{
				...makeWishlist({ status: "published" }),
				gifts: [
					{
						...makeGift({ id: "g1", quantityNeeded: 2 }),
						purchases: [makePurchase({ id: "p1", giftId: "g1", quantity: 2 })],
					},
					{
						...makeGift({ id: "g2", quantityNeeded: 4 }),
						purchases: [makePurchase({ id: "p2", giftId: "g2", quantity: 1 })],
					},
				],
			},
			{
				isOwner: true,
				publicUrlPath: "/w/my-wishlist",
				publicUrl: "https://awishfor.com/w/my-wishlist",
				whatsAppUrl: "https://wa.me/?text=hello",
				readiness,
				recentPurchases: [],
				invites: [],
				pendingInvitations: 0,
				totalInvitations: 3,
				totalGuests: 5,
				seating: { tableCount: 0, assignments: [] },
			},
		);

		expect(result.metrics).toEqual({
			totalGifts: 2,
			availableGifts: 1,
			purchasedGifts: 1,
			totalUnits: 6,
			purchasedUnits: 3,
			pendingInvitations: 0,
			totalInvitations: 3,
			totalGuests: 5,
			confirmedGuests: 0,
			declinedGuests: 0,
			pendingGuests: 0,
			openedInvitations: 0,
			unopenedInvitations: 0,
			seatingTables: 0,
			unseatedGuests: 0,
		});
	});

	it("includes serialized analytics and conversion rate only for the owner", () => {
		const wishlist = {
			...makeWishlist(),
			gifts: [
				{
					...makeGift({ id: "g1" }),
					purchases: [makePurchase({ id: "p1", guestEmail: "a@example.com" })],
				},
			],
		};
		const options = {
			publicUrlPath: "/w/my-wishlist",
			publicUrl: "https://awishfor.com/w/my-wishlist",
			whatsAppUrl: "https://wa.me/?text=hello",
			readiness,
			recentPurchases: [],
			invites: [],
			pendingInvitations: 0,
			totalInvitations: 0,
			totalGuests: 0,
			seating: { tableCount: 0, assignments: [] },
			analytics: {
				totalViews: 4,
				uniqueVisitors: 2,
				latestViewAt: new Date("2026-08-25T14:00:00.000Z"),
			},
		};

		expect(
			mapDashboardWishlistOverview(wishlist, { ...options, isOwner: true })
				.metrics,
		).toMatchObject({
			latestViewAt: "2026-08-25T14:00:00.000Z",
			totalViews: 4,
			uniqueVisitors: 2,
			conversionRate: 0.5,
		});
		expect(
			mapDashboardWishlistOverview(wishlist, { ...options, isOwner: false })
				.metrics,
		).not.toHaveProperty("totalViews");
	});

	it("omits the conversion rate when there are no unique visitors", () => {
		const wishlist = { ...makeWishlist(), gifts: [] };

		const result = mapDashboardWishlistOverview(wishlist, {
			isOwner: true,
			publicUrlPath: "/w/my-wishlist",
			publicUrl: "https://awishfor.com/w/my-wishlist",
			whatsAppUrl: "https://wa.me/?text=hello",
			readiness,
			recentPurchases: [],
			invites: [],
			pendingInvitations: 0,
			totalInvitations: 0,
			totalGuests: 0,
			seating: { tableCount: 0, assignments: [] },
			analytics: { totalViews: 0, uniqueVisitors: 0, latestViewAt: null },
		});

		expect(result.metrics).not.toHaveProperty("conversionRate");
	});

	it("excludes owner-recorded manual purchases from the conversion numerator", () => {
		const wishlist = {
			...makeWishlist(),
			gifts: [
				{
					...makeGift({ id: "g1" }),
					purchases: [
						makePurchase({
							id: "p1",
							guestName: OWNER_MANUAL_PURCHASE_DEFAULT_NAME,
							guestEmail: null,
						}),
					],
				},
			],
		};

		const result = mapDashboardWishlistOverview(wishlist, {
			isOwner: true,
			publicUrlPath: "/w/my-wishlist",
			publicUrl: "https://awishfor.com/w/my-wishlist",
			whatsAppUrl: "https://wa.me/?text=hello",
			readiness,
			recentPurchases: [],
			invites: [],
			pendingInvitations: 0,
			totalInvitations: 0,
			totalGuests: 0,
			seating: { tableCount: 0, assignments: [] },
			analytics: { totalViews: 4, uniqueVisitors: 2, latestViewAt: null },
		});

		expect(result.metrics.conversionRate).toBe(0);
	});

	it("clamps the conversion rate at one hundred percent", () => {
		const wishlist = {
			...makeWishlist(),
			gifts: [
				{
					...makeGift({ id: "g1" }),
					purchases: [
						makePurchase({ id: "p1", guestEmail: "a@example.com" }),
						makePurchase({ id: "p2", guestEmail: "b@example.com" }),
						makePurchase({ id: "p3", guestEmail: "c@example.com" }),
					],
				},
			],
		};

		const result = mapDashboardWishlistOverview(wishlist, {
			isOwner: true,
			publicUrlPath: "/w/my-wishlist",
			publicUrl: "https://awishfor.com/w/my-wishlist",
			whatsAppUrl: "https://wa.me/?text=hello",
			readiness,
			recentPurchases: [],
			invites: [],
			pendingInvitations: 0,
			totalInvitations: 0,
			totalGuests: 0,
			seating: { tableCount: 0, assignments: [] },
			analytics: { totalViews: 1, uniqueVisitors: 1, latestViewAt: null },
		});

		expect(result.metrics.conversionRate).toBe(1);
	});

	it("reports the confirmed attendee count across primary and extra guests", () => {
		const wishlist = { ...makeWishlist(), gifts: [] };

		const result = mapDashboardWishlistOverview(wishlist, {
			isOwner: true,
			publicUrlPath: "/w/my-wishlist",
			publicUrl: "https://awishfor.com/w/my-wishlist",
			whatsAppUrl: "https://wa.me/?text=hello",
			readiness,
			recentPurchases: [],
			invites: [
				makeInvite({
					id: "i1",
					status: "confirmed",
					extraGuests: [makeExtraGuest({ status: "declined" })],
				}),
			],
			pendingInvitations: 0,
			totalInvitations: 1,
			totalGuests: 2,
			seating: { tableCount: 0, assignments: [] },
		});

		expect(result.metrics.confirmedGuests).toBe(1);
		expect(result.metrics.declinedGuests).toBe(1);
	});

	it("counts unseated eligible people and reports the table count", () => {
		const wishlist = { ...makeWishlist(), gifts: [] };
		const base = {
			isOwner: true,
			publicUrlPath: "/w/my-wishlist",
			publicUrl: "https://awishfor.com/w/my-wishlist",
			whatsAppUrl: "https://wa.me/?text=hello",
			readiness,
			recentPurchases: [],
			invites: [
				makeInvite({
					id: "i1",
					status: "confirmed",
					extraGuests: [
						makeExtraGuest({ id: "e1", status: "confirmed" }),
						// Declined people leave the pool, so they are never "unseated".
						makeExtraGuest({ id: "e2", status: "declined" }),
					],
				}),
				makeInvite({ id: "i2", status: "declined" }),
			],
			pendingInvitations: 0,
			totalInvitations: 2,
			totalGuests: 4,
		};

		const none = mapDashboardWishlistOverview(wishlist, {
			...base,
			seating: { tableCount: 0, assignments: [] },
		});
		expect(none.metrics.seatingTables).toBe(0);
		expect(none.metrics.unseatedGuests).toBe(2);

		const partly = mapDashboardWishlistOverview(wishlist, {
			...base,
			seating: {
				tableCount: 2,
				assignments: [
					{ inviteId: "i1", extraGuestId: null },
					// A row for somebody who has since declined does not seat anyone.
					{ inviteId: "i2", extraGuestId: null },
				],
			},
		});
		expect(partly.metrics.seatingTables).toBe(2);
		expect(partly.metrics.unseatedGuests).toBe(1);
	});

	it("reports opened and unopened invitation counts", () => {
		const wishlist = { ...makeWishlist(), gifts: [] };

		const result = mapDashboardWishlistOverview(wishlist, {
			isOwner: true,
			publicUrlPath: "/w/my-wishlist",
			publicUrl: "https://awishfor.com/w/my-wishlist",
			whatsAppUrl: "https://wa.me/?text=hello",
			readiness,
			recentPurchases: [],
			invites: [
				makeInvite({ id: "i1", openedAt: now }),
				makeInvite({ id: "i2", openedAt: null }),
				makeInvite({ id: "i3", openedAt: null }),
				makeInvite({ id: "i4", openedAt: null }),
			],
			pendingInvitations: 4,
			totalInvitations: 4,
			totalGuests: 4,
			seating: { tableCount: 0, assignments: [] },
		});

		expect(result.metrics.openedInvitations).toBe(1);
		expect(result.metrics.unopenedInvitations).toBe(3);
	});

	describe("activity feed", () => {
		const baseOptions = {
			isOwner: true,
			publicUrlPath: "/w/my-wishlist",
			publicUrl: "https://awishfor.com/w/my-wishlist",
			whatsAppUrl: "https://wa.me/?text=hello",
			readiness,
			pendingInvitations: 0,
			totalInvitations: 1,
			totalGuests: 1,
			seating: { tableCount: 0, assignments: [] },
		};

		it("merges RSVP responses, purchases, and invitation opens ordered by recency", () => {
			const wishlist = {
				...makeWishlist(),
				gifts: [
					{
						...makeGift({ id: "g1", name: "Cafetera" }),
						purchases: [
							makePurchase({
								id: "p1",
								guestName: "Ana",
								createdAt: new Date("2026-08-20T00:00:00Z"),
							}),
						],
					},
				],
			};

			const result = mapDashboardWishlistOverview(wishlist, {
				...baseOptions,
				recentPurchases: [
					{
						...makePurchase({
							id: "p1",
							guestName: "Ana",
							createdAt: new Date("2026-08-20T00:00:00Z"),
						}),
						gift: { id: "g1", name: "Cafetera" },
					},
				],
				invites: [
					makeInvite({
						id: "i1",
						primaryName: "Luis",
						status: "confirmed",
						respondedAt: new Date("2026-08-26T00:00:00Z"),
					}),
					makeInvite({
						id: "i2",
						primaryName: "Renee",
						openedAt: new Date("2026-08-15T00:00:00Z"),
					}),
				],
			});

			expect(result.activity.map((entry) => entry.kind)).toEqual([
				"rsvp",
				"purchase",
				"invite_opened",
			]);
			expect(result.activity[0]).toMatchObject({
				kind: "rsvp",
				label: "Luis confirmó su asistencia",
			});
		});

		it("attributes an owner-recorded purchase with no guest name to Alguien", () => {
			const wishlist = { ...makeWishlist(), gifts: [] };

			const result = mapDashboardWishlistOverview(wishlist, {
				...baseOptions,
				recentPurchases: [
					{
						...makePurchase({
							id: "p1",
							guestName: OWNER_MANUAL_PURCHASE_DEFAULT_NAME,
						}),
						gift: { id: "g1", name: "Silla Gamer GX2000" },
					},
				],
				invites: [],
			});

			expect(result.activity[0]?.label).toBe(
				"Alguien marcó «Silla Gamer GX2000» como comprado",
			);
		});

		it("caps the feed at the ten most recent entries", () => {
			const wishlist = { ...makeWishlist(), gifts: [] };
			const invites = Array.from({ length: 12 }, (_, i) =>
				makeInvite({
					id: `i${i}`,
					openedAt: new Date(now.getTime() - i * 1000),
				}),
			);

			const result = mapDashboardWishlistOverview(wishlist, {
				...baseOptions,
				recentPurchases: [],
				invites,
			});

			expect(result.activity).toHaveLength(10);
		});

		it("renders no entries when nothing has happened", () => {
			const wishlist = { ...makeWishlist(), gifts: [] };

			const result = mapDashboardWishlistOverview(wishlist, {
				...baseOptions,
				recentPurchases: [],
				invites: [],
			});

			expect(result.activity).toEqual([]);
		});
	});
});
