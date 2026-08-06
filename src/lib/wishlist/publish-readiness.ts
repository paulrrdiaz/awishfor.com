import { resolveLayout } from "@/config/public-layouts";
import type { Currency, EventType, Locale } from "@/generated/prisma/enums";
import { wishlistSlugPattern } from "@/server/validators/wishlist.schema";

export type PublishReadinessInput = {
	title: string | null;
	eventType: EventType | null;
	slug: string | null;
	language: Locale | null;
	currency: Currency | null;
	visibleGiftCount: number;
	layoutId: string | null;
	imageCount: number;
};

export type PublishReadinessChecks = {
	title: boolean;
	eventType: boolean;
	slug: boolean;
	language: boolean;
	currency: boolean;
	visibleGift: boolean;
	images: boolean;
};

export type PublishReadinessResult = {
	ready: boolean;
	checks: PublishReadinessChecks;
};

export class PublishReadinessError extends Error {
	constructor(public readonly result: PublishReadinessResult) {
		super("Wishlist is not ready to publish");
		this.name = "PublishReadinessError";
	}
}

export const evaluatePublishReadiness = (
	input: PublishReadinessInput,
): PublishReadinessResult => {
	const requiredImageCount = resolveLayout(input.layoutId).heroImageSlots;

	const checks: PublishReadinessChecks = {
		title: input.title != null && input.title.trim().length > 0,
		eventType: input.eventType != null,
		slug: input.slug != null && wishlistSlugPattern.test(input.slug),
		language: input.language != null,
		currency: input.currency != null,
		visibleGift: input.visibleGiftCount > 0,
		images: input.imageCount >= requiredImageCount,
	};

	return {
		ready: Object.values(checks).every(Boolean),
		checks,
	};
};
