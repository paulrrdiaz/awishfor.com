// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { capturePublicWishlistEvent, initializeMinimalAnalytics } = vi.hoisted(
	() => ({
		capturePublicWishlistEvent: vi.fn(),
		initializeMinimalAnalytics: vi.fn(),
	}),
);

vi.mock("@/lib/analytics", () => ({
	capturePublicWishlistEvent,
	getCampaignProperties: () => ({ utm_source: "instagram" }),
	getReferrerHostname: () => "example.com",
	initializeMinimalAnalytics,
}));

import {
	PublicWishlistAnalyticsProvider,
	usePublicWishlistAnalytics,
} from "./public-wishlist-analytics";

function AnalyticsTriggers() {
	const analytics = usePublicWishlistAnalytics();
	if (!analytics) throw new Error("Public analytics provider missing");
	return (
		<>
			<button
				onClick={() =>
					analytics.captureGiftEvent("gift_store_opened", "gift_1")
				}
				type="button"
			>
				Store
			</button>
			<button
				onClick={() =>
					analytics.captureGiftEvent("gift_purchase_started", "gift_1")
				}
				type="button"
			>
				Purchase
			</button>
			<button
				onClick={() =>
					analytics.captureGiftEvent("gift_marked_purchased", "gift_1")
				}
				type="button"
			>
				Success
			</button>
			<button
				onClick={() =>
					analytics.capturePurchaseFailure("gift_1", {
						message: "No encontrado",
					})
				}
				type="button"
			>
				Failure
			</button>
			<button
				onClick={() =>
					analytics.captureGiftEvent("gift_purchase_undone", "gift_1")
				}
				type="button"
			>
				Undo
			</button>
			<button
				onClick={() => analytics.captureRsvp("confirmed", 3)}
				type="button"
			>
				RSVP
			</button>
			<button
				onClick={() => analytics.captureCalendarSave("google")}
				type="button"
			>
				Calendar
			</button>
		</>
	);
}

const props = {
	enabled: true,
	eventType: "wedding",
	giftCount: 3,
	layoutId: "split-image-right",
	routeVariant: "public" as const,
	themeId: "sage-garden",
	wishlistId: "wishlist_1",
	wishlistSlug: "lista-de-boda",
};

describe("Public wishlist analytics", () => {
	beforeEach(() => {
		capturePublicWishlistEvent.mockClear();
		initializeMinimalAnalytics.mockClear();
	});

	it("captures every allowed public event with minimized properties", () => {
		render(
			<PublicWishlistAnalyticsProvider {...props}>
				<AnalyticsTriggers />
			</PublicWishlistAnalyticsProvider>,
		);

		for (const name of [
			"Store",
			"Purchase",
			"Success",
			"Failure",
			"Undo",
			"RSVP",
			"Calendar",
		])
			fireEvent.click(screen.getByRole("button", { name }));

		expect(capturePublicWishlistEvent).toHaveBeenCalledWith(
			"public_wishlist_viewed",
			expect.objectContaining({
				event_type: "wedding",
				route_variant: "public",
				wishlist_id: "wishlist_1",
				wishlist_slug: "lista-de-boda",
			}),
		);
		expect(capturePublicWishlistEvent).toHaveBeenCalledWith(
			"gift_store_opened",
			{
				gift_id: "gift_1",
				wishlist_id: "wishlist_1",
			},
		);
		expect(capturePublicWishlistEvent).toHaveBeenCalledWith(
			"gift_purchase_started",
			{ gift_id: "gift_1", wishlist_id: "wishlist_1" },
		);
		expect(capturePublicWishlistEvent).toHaveBeenCalledWith(
			"gift_marked_purchased",
			{ gift_id: "gift_1", wishlist_id: "wishlist_1" },
		);
		expect(capturePublicWishlistEvent).toHaveBeenCalledWith(
			"gift_purchase_failed",
			{
				error_code: "not_found",
				gift_id: "gift_1",
				wishlist_id: "wishlist_1",
			},
		);
		expect(capturePublicWishlistEvent).toHaveBeenCalledWith(
			"gift_purchase_undone",
			{ gift_id: "gift_1", wishlist_id: "wishlist_1" },
		);
		expect(capturePublicWishlistEvent).toHaveBeenCalledWith("rsvp_submitted", {
			party_size: 3,
			response_status: "confirmed",
			wishlist_id: "wishlist_1",
		});
		expect(capturePublicWishlistEvent).toHaveBeenCalledWith(
			"calendar_save_action_selected",
			{
				calendar_provider: "google",
				wishlist_id: "wishlist_1",
			},
		);
		for (const [, eventProps] of capturePublicWishlistEvent.mock.calls)
			expect(eventProps).not.toEqual(
				expect.objectContaining({ guest_name: expect.anything() }),
			);
	});

	it("captures one published view per mount and excludes draft previews", () => {
		const { rerender } = render(
			<PublicWishlistAnalyticsProvider {...props}>
				<div />
			</PublicWishlistAnalyticsProvider>,
		);
		rerender(
			<PublicWishlistAnalyticsProvider {...props} routeVariant="personalized">
				<div />
			</PublicWishlistAnalyticsProvider>,
		);
		expect(
			capturePublicWishlistEvent.mock.calls.filter(
				([event]) => event === "public_wishlist_viewed",
			),
		).toHaveLength(1);

		render(
			<PublicWishlistAnalyticsProvider {...props} routeVariant="personalized">
				<div />
			</PublicWishlistAnalyticsProvider>,
		);
		expect(capturePublicWishlistEvent).toHaveBeenLastCalledWith(
			"public_wishlist_viewed",
			expect.objectContaining({ route_variant: "personalized" }),
		);

		render(
			<PublicWishlistAnalyticsProvider {...props} enabled={false}>
				<div />
			</PublicWishlistAnalyticsProvider>,
		);
		expect(
			capturePublicWishlistEvent.mock.calls.filter(
				([event]) => event === "public_wishlist_viewed",
			),
		).toHaveLength(2);
	});
});
