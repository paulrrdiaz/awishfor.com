export function resolveRedirectPath(
	rawValue: string | null | undefined,
	fallback = "/dashboard",
): string {
	if (!rawValue) {
		return fallback;
	}

	if (!rawValue.startsWith("/")) {
		return fallback;
	}

	if (rawValue.startsWith("//") || rawValue.startsWith("/\\")) {
		return fallback;
	}

	if (rawValue.includes("://")) {
		return fallback;
	}

	return rawValue;
}
