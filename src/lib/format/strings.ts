export function formatStoreDomain(url: string | null | undefined): string {
	if (!url) return "";
	try {
		const hostname = new URL(url).hostname.toLowerCase();
		return hostname.replace(/^www\./, "");
	} catch {
		return "";
	}
}
