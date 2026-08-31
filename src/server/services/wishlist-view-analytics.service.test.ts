import { describe, expect, it, vi } from "vitest";

vi.mock("@/env", () => ({
	env: {
		VIEW_ANALYTICS_HMAC_SECRET: "a-test-secret-that-is-long-enough-for-hmac",
	},
}));

import {
	createWishlistViewAuthorization,
	getWishlistViewAnalytics,
	getWishlistViewSeries,
	hashWishlistVisitor,
	isViewAnalyticsEnabled,
	recordWishlistView,
	verifyWishlistViewAuthorization,
	type WishlistViewAnalyticsDatabase,
} from "./wishlist-view-analytics.service";

function createDatabase({
	published = true,
	validInvite = true,
}: {
	published?: boolean;
	validInvite?: boolean;
} = {}) {
	const wishlistView = {
		count: vi.fn().mockResolvedValue(3),
		create: vi.fn().mockResolvedValue({}),
		findFirst: vi.fn().mockResolvedValue({ createdAt: new Date("2026-08-25") }),
		findMany: vi.fn().mockResolvedValue([{}, {}]),
	};
	const tx = {
		wishlist: {
			findFirst: vi
				.fn()
				.mockResolvedValue(published ? { id: "wishlist_1" } : null),
		},
		invite: {
			findFirst: vi
				.fn()
				.mockResolvedValue(validInvite ? { id: "invite_1" } : null),
			update: vi.fn().mockResolvedValue({}),
			updateMany: vi.fn().mockResolvedValue({ count: 1 }),
		},
		wishlistView,
	};
	return {
		db: {
			...tx,
			$transaction: vi.fn(async (callback) => callback(tx)),
		} as unknown as WishlistViewAnalyticsDatabase,
		tx,
	};
}

describe("wishlist view analytics", () => {
	it("signs short-lived authorizations and rejects tampering or expiry", () => {
		const authorization = createWishlistViewAuthorization(
			{ inviteId: "invite_1", wishlistId: "wishlist_1" },
			100,
		);
		expect(authorization).toBeDefined();
		expect(
			verifyWishlistViewAuthorization(authorization ?? "", 101),
		).toMatchObject({
			inviteId: "invite_1",
			wishlistId: "wishlist_1",
		});
		expect(
			verifyWishlistViewAuthorization(`${authorization}x`, 101),
		).toBeNull();
		expect(
			verifyWishlistViewAuthorization(authorization ?? "", 300_101),
		).toBeNull();
	});

	it("hashes visitors deterministically but scopes them to a wishlist", () => {
		expect(
			hashWishlistVisitor({
				anonymousId: "visitor_1",
				wishlistId: "wishlist_1",
			}),
		).toBe(
			hashWishlistVisitor({
				anonymousId: "visitor_1",
				wishlistId: "wishlist_1",
			}),
		);
		expect(
			hashWishlistVisitor({
				anonymousId: "visitor_1",
				wishlistId: "wishlist_1",
			}),
		).not.toBe(
			hashWishlistVisitor({
				anonymousId: "visitor_1",
				wishlistId: "wishlist_2",
			}),
		);
	});

	it("records general views without invitation attribution", async () => {
		const { db, tx } = createDatabase();
		const authorization = createWishlistViewAuthorization({
			wishlistId: "wishlist_1",
		});

		expect(
			await recordWishlistView(db, {
				authorization: authorization ?? "",
				anonymousId: "visitor_1",
			}),
		).toBe("recorded");
		expect(tx.wishlistView.create).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({
					inviteId: null,
					wishlistId: "wishlist_1",
				}),
			}),
		);
		expect(tx.invite.update).not.toHaveBeenCalled();
	});

	it("attributes repeated personalized views and preserves the first-open write", async () => {
		const { db, tx } = createDatabase();
		const authorization = createWishlistViewAuthorization({
			inviteId: "invite_1",
			wishlistId: "wishlist_1",
		});

		await recordWishlistView(db, {
			authorization: authorization ?? "",
			anonymousId: "visitor_1",
		});
		await recordWishlistView(db, {
			authorization: authorization ?? "",
			anonymousId: "visitor_1",
		});

		expect(tx.wishlistView.create).toHaveBeenCalledTimes(2);
		expect(tx.invite.updateMany).toHaveBeenCalledWith(
			expect.objectContaining({ where: { id: "invite_1", openedAt: null } }),
		);
		expect(tx.invite.update).toHaveBeenCalledTimes(2);
		expect(tx.invite.update).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({ viewCount: { increment: 1 } }),
			}),
		);
	});

	it("rejects unpublished wishlists and invite relationships that no longer match", async () => {
		const authorization = createWishlistViewAuthorization({
			inviteId: "invite_1",
			wishlistId: "wishlist_1",
		});
		const unpublished = createDatabase({ published: false });
		const mismatchedInvite = createDatabase({ validInvite: false });

		expect(
			await recordWishlistView(unpublished.db, {
				authorization: authorization ?? "",
				anonymousId: "visitor_1",
			}),
		).toBe("rejected");
		expect(unpublished.tx.wishlistView.create).not.toHaveBeenCalled();
		expect(
			await recordWishlistView(mismatchedInvite.db, {
				authorization: authorization ?? "",
				anonymousId: "visitor_1",
			}),
		).toBe("rejected");
		expect(mismatchedInvite.tx.wishlistView.create).not.toHaveBeenCalled();
	});

	it("returns owner aggregate metrics scoped to one wishlist", async () => {
		const { db, tx } = createDatabase();
		expect(await getWishlistViewAnalytics(db, "wishlist_1")).toEqual({
			latestViewAt: new Date("2026-08-25"),
			totalViews: 3,
			uniqueVisitors: 2,
		});
		expect(tx.wishlistView.count).toHaveBeenCalledWith({
			where: { wishlistId: "wishlist_1" },
		});
	});

	it("reports view analytics as enabled when the secret is configured", () => {
		expect(isViewAnalyticsEnabled()).toBe(true);
	});

	describe("getWishlistViewSeries", () => {
		const now = new Date("2026-08-27T10:00:00.000Z");

		it("fills a zero-value bucket for every day, oldest first, with gaps between recorded days", async () => {
			const wishlistView = {
				findMany: vi
					.fn()
					.mockResolvedValue([
						{ createdAt: new Date("2026-08-23T09:00:00.000Z") },
						{ createdAt: new Date("2026-08-23T20:00:00.000Z") },
						{ createdAt: new Date("2026-08-27T01:00:00.000Z") },
					]),
			};

			const series = await getWishlistViewSeries(
				{ wishlistView } as unknown as Pick<
					WishlistViewAnalyticsDatabase,
					"wishlistView"
				>,
				"wishlist_1",
				{ days: 5, now },
			);

			expect(series).toEqual([
				{ date: "2026-08-23", views: 2 },
				{ date: "2026-08-24", views: 0 },
				{ date: "2026-08-25", views: 0 },
				{ date: "2026-08-26", views: 0 },
				{ date: "2026-08-27", views: 1 },
			]);
		});

		it("returns an all-zero window when the wishlist has no recorded views", async () => {
			const wishlistView = { findMany: vi.fn().mockResolvedValue([]) };

			const series = await getWishlistViewSeries(
				{ wishlistView } as unknown as Pick<
					WishlistViewAnalyticsDatabase,
					"wishlistView"
				>,
				"wishlist_1",
				{ days: 7, now },
			);

			expect(series).toHaveLength(7);
			expect(series.every((point) => point.views === 0)).toBe(true);
		});

		it("returns an all-zero window when analytics is disabled, since no rows are ever recorded", async () => {
			const wishlistView = { findMany: vi.fn().mockResolvedValue([]) };

			const series = await getWishlistViewSeries(
				{ wishlistView } as unknown as Pick<
					WishlistViewAnalyticsDatabase,
					"wishlistView"
				>,
				"wishlist_1",
				{ days: 30, now },
			);

			expect(series).toHaveLength(30);
			expect(series.every((point) => point.views === 0)).toBe(true);
		});
	});
});

describe("wishlist view analytics when disabled", () => {
	it("reports view analytics as disabled when the secret is unset", async () => {
		vi.resetModules();
		vi.doMock("@/env", () => ({
			env: { VIEW_ANALYTICS_HMAC_SECRET: undefined },
		}));

		const { isViewAnalyticsEnabled: isViewAnalyticsEnabledDisabled } =
			await import("./wishlist-view-analytics.service");

		expect(isViewAnalyticsEnabledDisabled()).toBe(false);

		vi.doUnmock("@/env");
		vi.resetModules();
	});
});
