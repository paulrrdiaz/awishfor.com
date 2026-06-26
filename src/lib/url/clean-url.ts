const TRACKING_PARAMS = new Set([
	"utm_source",
	"utm_medium",
	"utm_campaign",
	"utm_term",
	"utm_content",
	"gclid",
	"fbclid",
	"msclkid",
	"dclid",
	"mc_eid",
	"ttclid",
	"twclid",
	"li_fat_id",
	"igshid",
	"epik",
	"irclickid",
	"wbraid",
	"gbraid",
	"sccid",
]);

export function cleanProductUrl(url: string): string {
	try {
		const parsed = new URL(url);
		if (!parsed.search) return url;

		let modified = false;
		for (const key of [...parsed.searchParams.keys()]) {
			if (TRACKING_PARAMS.has(key.toLowerCase())) {
				parsed.searchParams.delete(key);
				modified = true;
			}
		}

		return modified ? parsed.toString() : url;
	} catch {
		return url;
	}
}
