const anonymousIdentifierKey = "awf_analytics_anonymous_id";

function createIdentifier() {
	return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

export function getAnonymousAnalyticsId() {
	if (typeof window === "undefined") return undefined;
	const existing = window.localStorage.getItem(anonymousIdentifierKey);
	if (existing) return existing;
	const identifier = createIdentifier();
	window.localStorage.setItem(anonymousIdentifierKey, identifier);
	return identifier;
}

export const analyticsIdentityStorageKey = anonymousIdentifierKey;
