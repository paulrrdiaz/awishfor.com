import { STORE_DISPLAY_NAMES } from "@/config/store-display-names";

export function resolveStoreDisplayName(
	url: string | null | undefined,
): string {
	if (!url) return "";
	try {
		const hostname = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
		return STORE_DISPLAY_NAMES[hostname] ?? formatStoreDomain(url);
	} catch {
		return "";
	}
}

export function formatStoreDomain(url: string | null | undefined): string {
	if (!url) return "";
	try {
		const hostname = new URL(url).hostname.toLowerCase();
		return hostname.replace(/^www\./, "");
	} catch {
		return "";
	}
}
