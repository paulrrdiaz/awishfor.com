import type {
	AnalyticsEventName,
	AnalyticsEventProperties,
	MarketingEventName,
	PublicWishlistEventName,
} from "./events";
import { isPublicWishlistEvent } from "./events";
import { getAnonymousAnalyticsId } from "./identity";
import { sanitizePublicEventPayload } from "./public-payload";

const transportVersion = "1";

type CapturePayload = {
	api_key: string;
	batch: Array<{
		event: string;
		properties: Record<string, unknown>;
	}>;
	sent_at: string;
};

let initialized = false;

function getClientAnalyticsConfig() {
	return {
		host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
		key: process.env.NEXT_PUBLIC_POSTHOG_KEY,
		nodeEnv: process.env.NODE_ENV,
	};
}

export function isAnalyticsCaptureEnabled({
	host,
	key,
	nodeEnv,
}: {
	host?: string;
	key?: string;
	nodeEnv: string;
}) {
	return nodeEnv === "production" && Boolean(host && key);
}

export function initializeMinimalAnalytics() {
	const { host, key, nodeEnv } = getClientAnalyticsConfig();
	initialized = isAnalyticsCaptureEnabled({
		host,
		key,
		nodeEnv,
	});
}

export function createAnalyticsCapturePayload(
	event: AnalyticsEventName,
	properties: Record<string, unknown>,
	{
		anonymousId,
		key,
		sentAt = new Date().toISOString(),
	}: { anonymousId: string; key: string; sentAt?: string },
): CapturePayload {
	const finalProperties = isPublicWishlistEvent(event)
		? sanitizePublicEventPayload(event, properties)
		: properties;

	return {
		api_key: key,
		batch: [
			{
				event,
				properties: {
					$lib: "awishfor-beacon",
					$lib_version: transportVersion,
					$process_person_profile: false,
					distinct_id: anonymousId,
					...finalProperties,
				},
			},
		],
		sent_at: sentAt,
	};
}

function dispatch(payload: CapturePayload) {
	if (typeof window === "undefined") return;
	const body = JSON.stringify(payload);
	const beaconBody = new Blob([body], { type: "application/json" });

	if (navigator.sendBeacon?.("/ingest/batch/", beaconBody)) return;

	void fetch("/ingest/batch/", {
		body,
		headers: { "content-type": "application/json" },
		keepalive: true,
		method: "POST",
	}).catch(() => undefined);
}

function capture<E extends AnalyticsEventName>(
	event: E,
	properties: AnalyticsEventProperties[E],
) {
	const { key } = getClientAnalyticsConfig();
	if (!initialized || !key) return;
	const anonymousId = getAnonymousAnalyticsId();
	if (!anonymousId) return;
	dispatch(
		createAnalyticsCapturePayload(event, properties, {
			anonymousId,
			key,
		}),
	);
}

export function captureMarketingEvent<E extends MarketingEventName>(
	event: E,
	properties: AnalyticsEventProperties[E],
) {
	capture(event, properties);
}

export function capturePublicWishlistEvent<E extends PublicWishlistEventName>(
	event: E,
	properties: AnalyticsEventProperties[E],
) {
	capture(event, properties);
}

export function getMinimalAnalyticsDistinctId() {
	return initialized ? getAnonymousAnalyticsId() : undefined;
}
