// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from "vitest";

import { getApplicationAnalyticsOptions } from "./application-client";
import { getAnonymousAnalyticsId } from "./identity";
import { createAnalyticsCapturePayload } from "./minimal-client";

describe("analytics identity continuity", () => {
	beforeEach(() => window.localStorage.clear());

	it("uses one anonymous identifier from marketing through the application shell", () => {
		const marketingId = getAnonymousAnalyticsId();
		if (!marketingId)
			throw new Error("Expected a browser analytics identifier");
		const marketingPayload = createAnalyticsCapturePayload(
			"guest_finder_used",
			{ visitor_intent: "guest" },
			{ anonymousId: marketingId, key: "phc_test" },
		);

		expect(marketingPayload.batch[0]?.properties.distinct_id).toBe(marketingId);
		expect(
			getApplicationAnalyticsOptions(getAnonymousAnalyticsId()),
		).toMatchObject({
			bootstrap: { distinctID: marketingId },
		});
	});

	it("keeps guest finder and public wishlist events anonymous under one identifier", () => {
		const visitorId = getAnonymousAnalyticsId();
		if (!visitorId) throw new Error("Expected a browser analytics identifier");
		const finderPayload = createAnalyticsCapturePayload(
			"guest_finder_used",
			{ visitor_intent: "guest" },
			{ anonymousId: visitorId, key: "phc_test" },
		);
		const publicPayload = createAnalyticsCapturePayload(
			"public_wishlist_viewed",
			{
				event_type: "wedding",
				gift_count: 2,
				layout_id: "split-image-right",
				route_variant: "public",
				theme_id: "sage-garden",
				wishlist_id: "wishlist_1",
			},
			{ anonymousId: getAnonymousAnalyticsId() ?? "", key: "phc_test" },
		);

		expect(publicPayload.batch[0]?.properties.distinct_id).toBe(
			finderPayload.batch[0]?.properties.distinct_id,
		);
		expect(publicPayload.batch[0]?.properties.$process_person_profile).toBe(
			false,
		);
	});

	it("disables automatic collection and creates profiles only after identify", () => {
		expect(getApplicationAnalyticsOptions("anonymous_1")).toMatchObject({
			autocapture: false,
			capture_pageview: false,
			disable_session_recording: true,
			disable_surveys: true,
			person_profiles: "identified_only",
		});
	});
});
