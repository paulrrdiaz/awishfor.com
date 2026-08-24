import type { CampaignProperties } from "./events";

const campaignParameters = [
	"utm_source",
	"utm_medium",
	"utm_campaign",
	"utm_content",
	"utm_term",
] as const;

export function getCampaignProperties(
	searchParams: URLSearchParams,
): CampaignProperties {
	return Object.fromEntries(
		campaignParameters.flatMap((parameter) => {
			const value = searchParams.get(parameter)?.trim();
			return value ? [[parameter, value]] : [];
		}),
	) as CampaignProperties;
}

export function getReferrerHostname(referrer: string): string | undefined {
	if (!referrer) return undefined;
	try {
		return new URL(referrer).hostname || undefined;
	} catch {
		return undefined;
	}
}
