import { isPublicWishlistEvent, type PublicWishlistEventName } from "./events";

const commonProperties = new Set([
	"wishlist_id",
	"utm_source",
	"utm_medium",
	"utm_campaign",
	"utm_content",
	"utm_term",
]);

const eventProperties: Record<PublicWishlistEventName, ReadonlySet<string>> = {
	public_wishlist_viewed: new Set([
		"event_type",
		"gift_count",
		"layout_id",
		"referrer_hostname",
		"route_variant",
		"theme_id",
	]),
	gift_store_opened: new Set(["gift_id"]),
	gift_purchase_started: new Set(["gift_id"]),
	gift_marked_purchased: new Set(["gift_id"]),
	gift_purchase_failed: new Set(["error_code", "gift_id"]),
	gift_purchase_undone: new Set(["gift_id"]),
	rsvp_submitted: new Set(["party_size", "response_status"]),
};

export function sanitizePublicEventPayload(
	event: string,
	properties: Record<string, unknown>,
): Record<string, unknown> {
	if (!isPublicWishlistEvent(event as never)) return {};
	const allowed = new Set([
		...commonProperties,
		...eventProperties[event as PublicWishlistEventName],
	]);
	return Object.fromEntries(
		Object.entries(properties).filter(([key]) => allowed.has(key)),
	);
}
