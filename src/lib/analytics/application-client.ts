import { getAnonymousAnalyticsId } from "./identity";
import { isAnalyticsCaptureEnabled } from "./minimal-client";

type PostHogClient = typeof import("posthog-js")["default"];

let client: PostHogClient | undefined;
let initialization: Promise<PostHogClient | undefined> | undefined;

function getClientAnalyticsConfig() {
	return {
		host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
		key: process.env.NEXT_PUBLIC_POSTHOG_KEY,
		nodeEnv: process.env.NODE_ENV,
	};
}

export function getApplicationAnalyticsOptions(
	anonymousId: string | undefined,
) {
	return {
		advanced_disable_feature_flags: true,
		autocapture: false,
		bootstrap: { distinctID: anonymousId },
		capture_pageview: false,
		disable_session_recording: true,
		disable_surveys: true,
		person_profiles: "identified_only" as const,
		api_host: "/ingest",
	};
}

export function initializeApplicationAnalytics(): Promise<
	PostHogClient | undefined
> {
	if (client) return Promise.resolve(client);
	if (initialization) return initialization;
	const { host, key, nodeEnv } = getClientAnalyticsConfig();
	if (
		!isAnalyticsCaptureEnabled({
			host,
			key,
			nodeEnv,
		})
	)
		return Promise.resolve(undefined);

	initialization = import("posthog-js").then(({ default: posthog }) => {
		posthog.init(
			key as string,
			getApplicationAnalyticsOptions(getAnonymousAnalyticsId()),
		);
		client = posthog;
		return posthog;
	});

	return initialization;
}

export async function identifyApplicationUser(
	userId: string | null | undefined,
) {
	if (!userId) return;
	const posthog = await initializeApplicationAnalytics();
	posthog?.identify(userId);
}

export function getApplicationAnalyticsDistinctId() {
	return client?.get_distinct_id();
}
