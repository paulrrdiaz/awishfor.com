import { describe, expect, it } from "vitest";

import {
	captureMarketingEvent,
	capturePublicWishlistEvent,
	createAnalyticsCapturePayload,
	getCampaignProperties,
	getMinimalAnalyticsDistinctId,
	getReferrerHostname,
	isAnalyticsCaptureEnabled,
	marketingEventNames,
	publicWishlistEventNames,
	sanitizePublicEventPayload,
} from "./index";

describe("analytics contract", () => {
	it("registers the marketing and public-wishlist event vocabulary", () => {
		expect(marketingEventNames).toEqual([
			"$pageview",
			"occasion_selected",
			"section_viewed",
			"theme_preview_opened",
			"faq_opened",
			"guest_finder_used",
			"cta_clicked",
		]);
		expect(publicWishlistEventNames).toHaveLength(8);
	});
});

describe("analytics environment isolation", () => {
	it("only enables capture for configured production clients", () => {
		expect(
			isAnalyticsCaptureEnabled({
				host: "https://us.i.posthog.com",
				key: "phc_test",
				nodeEnv: "production",
			}),
		).toBe(true);
		expect(
			isAnalyticsCaptureEnabled({
				host: "https://us.i.posthog.com",
				key: "phc_test",
				nodeEnv: "test",
			}),
		).toBe(false);
		expect(
			isAnalyticsCaptureEnabled({
				host: undefined,
				key: undefined,
				nodeEnv: "production",
			}),
		).toBe(false);
	});

	it("makes capture a no-op before initialization", () => {
		expect(() =>
			captureMarketingEvent("occasion_selected", {
				occasion: "wedding",
				visitor_intent: "creator",
			}),
		).not.toThrow();
		expect(() =>
			capturePublicWishlistEvent("gift_store_opened", {
				gift_id: "gift_1",
				wishlist_id: "wishlist_1",
			}),
		).not.toThrow();
		expect(getMinimalAnalyticsDistinctId()).toBeUndefined();
	});
});

describe("analytics attribution", () => {
	it("keeps only allowlisted campaign values and referrer hostnames", () => {
		expect(
			getCampaignProperties(
				new URLSearchParams(
					"utm_source=instagram&utm_campaign=launch&guest=marina&utm_term=",
				),
			),
		).toEqual({ utm_campaign: "launch", utm_source: "instagram" });
		expect(getReferrerHostname("https://example.com/a-private-path")).toBe(
			"example.com",
		);
		expect(getReferrerHostname("not-a-url")).toBeUndefined();
	});
});

describe("public payload sanitization", () => {
	it("allows only documented public properties at the transport boundary", () => {
		expect(
			sanitizePublicEventPayload("public_wishlist_viewed", {
				$current_url: "https://awishfor.com/w/private-slug/guest-slug",
				$pathname: "/w/private-slug/guest-slug",
				event_type: "wedding",
				gift_count: 3,
				guest_name: "Marina",
				layout_id: "layout_1",
				referrer_hostname: "example.com",
				route_variant: "personalized",
				theme_id: "theme_1",
				wishlist_id: "wishlist_1",
				wishlist_slug: "private-slug",
			}),
		).toEqual({
			event_type: "wedding",
			gift_count: 3,
			layout_id: "layout_1",
			referrer_hostname: "example.com",
			route_variant: "personalized",
			theme_id: "theme_1",
			wishlist_id: "wishlist_1",
		});
	});

	it("drops unregistered event payloads", () => {
		expect(
			sanitizePublicEventPayload("generic_click", {
				wishlist_id: "wishlist_1",
			}),
		).toEqual({});
	});

	it("builds a public beacon payload from only sanitized event properties", () => {
		const payload = createAnalyticsCapturePayload(
			"public_wishlist_viewed",
			{
				$current_url: "https://awishfor.com/w/private-slug/guest-slug",
				gift_count: 3,
				guest_name: "Marina",
				route_variant: "personalized",
				wishlist_id: "wishlist_1",
			},
			{
				anonymousId: "anonymous_1",
				key: "phc_test",
				sentAt: "2026-08-23T00:00:00.000Z",
			},
		);

		expect(payload).toEqual({
			api_key: "phc_test",
			batch: [
				{
					event: "public_wishlist_viewed",
					properties: {
						$lib: "awishfor-beacon",
						$lib_version: "1",
						$process_person_profile: false,
						distinct_id: "anonymous_1",
						gift_count: 3,
						route_variant: "personalized",
						wishlist_id: "wishlist_1",
					},
				},
			],
			sent_at: "2026-08-23T00:00:00.000Z",
		});
	});
});
