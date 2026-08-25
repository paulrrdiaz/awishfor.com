export const marketingEventNames = [
	"$pageview",
	"occasion_selected",
	"section_viewed",
	"theme_preview_opened",
	"faq_opened",
	"guest_finder_used",
	"cta_clicked",
] as const;

export const publicWishlistEventNames = [
	"public_wishlist_viewed",
	"gift_store_opened",
	"gift_purchase_started",
	"gift_marked_purchased",
	"gift_purchase_failed",
	"gift_purchase_undone",
	"rsvp_submitted",
	"calendar_save_action_selected",
] as const;

export type VisitorIntent = "creator" | "guest";

export type CampaignProperties = Partial<{
	utm_source: string;
	utm_medium: string;
	utm_campaign: string;
	utm_content: string;
	utm_term: string;
}>;

type MarketingProperties = {
	visitor_intent: VisitorIntent;
};

type PublicWishlistProperties = CampaignProperties & {
	wishlist_id: string;
};

export type AnalyticsEventProperties = {
	$pageview: MarketingProperties &
		CampaignProperties & {
			path: string;
			referrer?: string;
		};
	occasion_selected: MarketingProperties & { occasion: string };
	section_viewed: MarketingProperties & { section: string };
	theme_preview_opened: MarketingProperties & { theme: string };
	faq_opened: MarketingProperties & { question: string };
	guest_finder_used: MarketingProperties;
	cta_clicked: MarketingProperties & {
		placement: "desktop_nav" | "final" | "hero" | "mobile_nav" | "occasion";
	};
	public_wishlist_viewed: PublicWishlistProperties & {
		event_type: string;
		gift_count: number;
		layout_id: string;
		referrer_hostname?: string;
		route_variant: "public" | "personalized";
		theme_id: string;
	};
	gift_store_opened: PublicWishlistProperties & { gift_id: string };
	gift_purchase_started: PublicWishlistProperties & { gift_id: string };
	gift_marked_purchased: PublicWishlistProperties & { gift_id: string };
	gift_purchase_failed: PublicWishlistProperties & {
		error_code: "already_purchased" | "invalid" | "not_found" | "unknown";
		gift_id: string;
	};
	gift_purchase_undone: PublicWishlistProperties & { gift_id: string };
	rsvp_submitted: PublicWishlistProperties & {
		party_size: number;
		response_status: "confirmed" | "declined";
	};
	calendar_save_action_selected: PublicWishlistProperties & {
		calendar_provider: "google" | "icalendar";
	};
};

export type AnalyticsEventName = keyof AnalyticsEventProperties;
export type MarketingEventName = (typeof marketingEventNames)[number];
export type PublicWishlistEventName = (typeof publicWishlistEventNames)[number];

export const isPublicWishlistEvent = (
	event: AnalyticsEventName,
): event is PublicWishlistEventName =>
	(publicWishlistEventNames as readonly string[]).includes(event);
