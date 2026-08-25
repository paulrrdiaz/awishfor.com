"use client";

import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useMemo,
	useRef,
} from "react";

import {
	capturePublicWishlistEvent,
	getCampaignProperties,
	getReferrerHostname,
	initializeMinimalAnalytics,
} from "@/lib/analytics";

type PublicAnalyticsContextValue = {
	captureGiftEvent: (
		event:
			| "gift_marked_purchased"
			| "gift_purchase_started"
			| "gift_purchase_undone"
			| "gift_store_opened",
		giftId: string,
	) => void;
	capturePurchaseFailure: (giftId: string, error: unknown) => void;
	captureRsvp: (status: "confirmed" | "declined", partySize: number) => void;
	captureCalendarSave: (provider: "google" | "icalendar") => void;
};

const PublicAnalyticsContext =
	createContext<PublicAnalyticsContextValue | null>(null);

type Props = {
	children: ReactNode;
	enabled: boolean;
	eventType: string;
	giftCount: number;
	layoutId: string;
	routeVariant: "public" | "personalized";
	themeId: string;
	wishlistId: string;
	wishlistSlug: string;
};

function normalizePurchaseFailure(error: unknown) {
	const message =
		typeof error === "object" && error && "message" in error
			? String(error.message).toLowerCase()
			: "";
	if (message.includes("already") || message.includes("comprado"))
		return "already_purchased" as const;
	if (message.includes("not found") || message.includes("no encontrado"))
		return "not_found" as const;
	if (message.includes("invalid") || message.includes("inválid"))
		return "invalid" as const;
	return "unknown" as const;
}

export function PublicWishlistAnalyticsProvider({
	children,
	enabled,
	eventType,
	giftCount,
	layoutId,
	routeVariant,
	themeId,
	wishlistId,
	wishlistSlug,
}: Props) {
	const capturedView = useRef(false);

	useEffect(() => {
		if (!enabled || capturedView.current) return;
		capturedView.current = true;
		initializeMinimalAnalytics();
		capturePublicWishlistEvent("public_wishlist_viewed", {
			event_type: eventType,
			gift_count: giftCount,
			layout_id: layoutId,
			referrer_hostname: getReferrerHostname(document.referrer),
			route_variant: routeVariant,
			theme_id: themeId,
			wishlist_id: wishlistId,
			wishlist_slug: wishlistSlug,
			...getCampaignProperties(new URLSearchParams(window.location.search)),
		});
	}, [
		enabled,
		eventType,
		giftCount,
		layoutId,
		routeVariant,
		themeId,
		wishlistId,
		wishlistSlug,
	]);

	const value = useMemo<PublicAnalyticsContextValue>(
		() => ({
			captureGiftEvent: (event, giftId) => {
				if (!enabled) return;
				capturePublicWishlistEvent(event, {
					gift_id: giftId,
					wishlist_id: wishlistId,
				});
			},
			capturePurchaseFailure: (giftId, error) => {
				if (!enabled) return;
				capturePublicWishlistEvent("gift_purchase_failed", {
					error_code: normalizePurchaseFailure(error),
					gift_id: giftId,
					wishlist_id: wishlistId,
				});
			},
			captureRsvp: (status, partySize) => {
				if (!enabled) return;
				capturePublicWishlistEvent("rsvp_submitted", {
					party_size: partySize,
					response_status: status,
					wishlist_id: wishlistId,
				});
			},
			captureCalendarSave: (provider) => {
				if (!enabled) return;
				capturePublicWishlistEvent("calendar_save_action_selected", {
					calendar_provider: provider,
					wishlist_id: wishlistId,
				});
			},
		}),
		[enabled, wishlistId],
	);

	return (
		<PublicAnalyticsContext.Provider value={value}>
			{children}
		</PublicAnalyticsContext.Provider>
	);
}

export function usePublicWishlistAnalytics() {
	return useContext(PublicAnalyticsContext);
}
