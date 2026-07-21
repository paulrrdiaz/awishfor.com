import { z } from "zod";
import {
	Currency,
	EventType,
	GiftPriority,
	GiftVisibilityStatus,
	Locale,
	WishlistStatus,
} from "@/generated/prisma/enums";

export const wishlistIdSchema = z.string().min(1, "Wishlist id is required");
export const wishlistOwnerIdSchema = z
	.number()
	.int()
	.positive("Wishlist owner is required");

export const wishlistStatusSchema = z.enum(WishlistStatus);
export const eventTypeSchema = z.enum(EventType);
export const localeSchema = z.enum(Locale);
export const currencySchema = z.enum(Currency);
export const giftPrioritySchema = z.enum(GiftPriority);
export const giftVisibilityStatusSchema = z.enum(GiftVisibilityStatus);

export const wishlistRestoreTargetStatusSchema = z.enum([
	WishlistStatus.draft,
	WishlistStatus.published,
]);

export const wishlistSlugPattern = /^(?!-)[a-z0-9-]{3,60}(?<!-)$/;
const eventTimePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

const requiredTrimmedString = (
	fieldName: string,
	maxLength: number,
	minimumMessage = `${fieldName} is required`,
) =>
	z
		.string()
		.trim()
		.min(1, minimumMessage)
		.max(maxLength, `${fieldName} must be at most ${maxLength} characters`);

const optionalNullableTrimmedString = (fieldName: string, maxLength: number) =>
	z.preprocess((value) => {
		if (value === undefined) {
			return undefined;
		}

		if (value === null) {
			return null;
		}

		if (typeof value === "string") {
			const trimmed = value.trim();
			return trimmed === "" ? null : trimmed;
		}

		return value;
	}, z
		.string()
		.max(maxLength, `${fieldName} must be at most ${maxLength} characters`)
		.nullable()
		.optional());

const optionalNullableDate = z.preprocess((value) => {
	if (value === undefined) {
		return undefined;
	}

	if (value === null || value === "") {
		return null;
	}

	return value;
}, z.coerce.date().nullable().optional());

export const wishlistTitleSchema = requiredTrimmedString("Title", 120);
export const wishlistSlugSchema = z
	.string()
	.trim()
	.min(1, "Slug is required")
	.regex(
		wishlistSlugPattern,
		"Slug must be 3-60 characters of lowercase letters, numbers, or hyphens, and cannot start or end with a hyphen",
	);
export const wishlistHeroTitleSchema = optionalNullableTrimmedString(
	"Hero title",
	160,
);
export const wishlistWelcomeMessageSchema = optionalNullableTrimmedString(
	"Welcome message",
	2_000,
);
export const wishlistThankYouMessageSchema = optionalNullableTrimmedString(
	"Thank-you message",
	2_000,
);
export const wishlistDisplayNameSchema = optionalNullableTrimmedString(
	"Display name",
	120,
);
export const wishlistEventTimeSchema = z.preprocess((value) => {
	if (value === undefined) {
		return undefined;
	}

	if (value === null) {
		return null;
	}

	if (typeof value === "string") {
		const trimmed = value.trim();
		return trimmed === "" ? null : trimmed;
	}

	return value;
}, z
	.string()
	.regex(eventTimePattern, "Event time must use 24-hour HH:mm format")
	.nullable()
	.optional());
export const wishlistEventLocationSchema = optionalNullableTrimmedString(
	"Event location",
	240,
);
export const wishlistDressCodeSchema = optionalNullableTrimmedString(
	"Dress code",
	240,
);
export const wishlistCoverImageUrlSchema = z.preprocess((value) => {
	if (value === undefined) {
		return undefined;
	}

	if (value === null) {
		return null;
	}

	if (typeof value === "string") {
		const trimmed = value.trim();
		return trimmed === "" ? null : trimmed;
	}

	return value;
}, z.url("Cover image URL must be a valid URL").nullable().optional());
export const WISHLIST_MAX_COVER_IMAGES = 6;
export const wishlistCoverImageUrlsSchema = z
	.array(z.url("Cover image URL must be a valid URL"))
	.max(
		WISHLIST_MAX_COVER_IMAGES,
		`You can add at most ${WISHLIST_MAX_COVER_IMAGES} cover images`,
	);
export const wishlistThemeIdSchema = optionalNullableTrimmedString(
	"Theme id",
	64,
);
export const wishlistLayoutIdSchema = optionalNullableTrimmedString(
	"Layout id",
	64,
);
export const wishlistButtonStyleSchema = optionalNullableTrimmedString(
	"Button style",
	64,
);
export const wishlistFontPairingSchema = optionalNullableTrimmedString(
	"Font pairing",
	64,
);
export const wishlistHeadingFontSchema = optionalNullableTrimmedString(
	"Heading font",
	64,
);
export const wishlistBodyFontSchema = optionalNullableTrimmedString(
	"Body font",
	64,
);

const wishlistCreateUpdateShape = {
	title: wishlistTitleSchema,
	slug: wishlistSlugSchema,
	eventType: eventTypeSchema,
	language: localeSchema.default(Locale.es),
	currency: currencySchema.default(Currency.PEN),
	heroTitle: wishlistHeroTitleSchema,
	welcomeMessage: wishlistWelcomeMessageSchema,
	thankYouMessage: wishlistThankYouMessageSchema,
	displayName: wishlistDisplayNameSchema,
	eventDate: optionalNullableDate,
	eventTime: wishlistEventTimeSchema,
	eventLocation: wishlistEventLocationSchema,
	dressCode: wishlistDressCodeSchema,
	coverImageUrl: wishlistCoverImageUrlSchema,
	coverImageUrls: wishlistCoverImageUrlsSchema.default([]),
	themeId: wishlistThemeIdSchema,
	layoutId: wishlistLayoutIdSchema,
	buttonStyle: wishlistButtonStyleSchema,
	fontPairing: wishlistFontPairingSchema,
	headingFont: wishlistHeadingFontSchema,
	bodyFont: wishlistBodyFontSchema,
	showHowItWorks: z.boolean().default(true),
} satisfies z.ZodRawShape;

export const createWishlistSchema = z.object({
	ownerId: wishlistOwnerIdSchema,
	...wishlistCreateUpdateShape,
});

export const updateWishlistSchema = z.object({
	wishlistId: wishlistIdSchema,
	ownerId: wishlistOwnerIdSchema.optional(),
	title: wishlistTitleSchema.optional(),
	slug: wishlistSlugSchema.optional(),
	eventType: eventTypeSchema.optional(),
	language: localeSchema.optional(),
	currency: currencySchema.optional(),
	heroTitle: wishlistHeroTitleSchema,
	welcomeMessage: wishlistWelcomeMessageSchema,
	thankYouMessage: wishlistThankYouMessageSchema,
	displayName: wishlistDisplayNameSchema,
	eventDate: optionalNullableDate,
	eventTime: wishlistEventTimeSchema,
	eventLocation: wishlistEventLocationSchema,
	dressCode: wishlistDressCodeSchema,
	coverImageUrl: wishlistCoverImageUrlSchema,
	coverImageUrls: wishlistCoverImageUrlsSchema.optional(),
	themeId: wishlistThemeIdSchema,
	layoutId: wishlistLayoutIdSchema,
	buttonStyle: wishlistButtonStyleSchema,
	fontPairing: wishlistFontPairingSchema,
	headingFont: wishlistHeadingFontSchema,
	bodyFont: wishlistBodyFontSchema,
	showHowItWorks: z.boolean().optional(),
});

export const publishWishlistSchema = z.object({
	wishlistId: wishlistIdSchema,
});

export const archiveWishlistSchema = z.object({
	wishlistId: wishlistIdSchema,
});

export const restoreWishlistSchema = z.object({
	wishlistId: wishlistIdSchema,
	targetStatus: wishlistRestoreTargetStatusSchema,
});

export type CreateWishlistInput = {
	ownerId: number;
	title: string;
	slug: string;
	eventType: EventType;
	language?: Locale;
	currency?: Currency;
	heroTitle?: string | null;
	welcomeMessage?: string | null;
	thankYouMessage?: string | null;
	displayName?: string | null;
	eventDate?: Date | string | null;
	eventTime?: string | null;
	eventLocation?: string | null;
	dressCode?: string | null;
	coverImageUrl?: string | null;
	coverImageUrls?: string[];
	themeId?: string | null;
	layoutId?: string | null;
	buttonStyle?: string | null;
	fontPairing?: string | null;
	headingFont?: string | null;
	bodyFont?: string | null;
	showHowItWorks?: boolean;
};
export type UpdateWishlistInput = {
	wishlistId: string;
	ownerId?: number;
	title?: string;
	slug?: string;
	eventType?: EventType;
	language?: Locale;
	currency?: Currency;
	heroTitle?: string | null;
	welcomeMessage?: string | null;
	thankYouMessage?: string | null;
	displayName?: string | null;
	eventDate?: Date | string | null;
	eventTime?: string | null;
	eventLocation?: string | null;
	dressCode?: string | null;
	coverImageUrl?: string | null;
	coverImageUrls?: string[];
	themeId?: string | null;
	layoutId?: string | null;
	buttonStyle?: string | null;
	fontPairing?: string | null;
	headingFont?: string | null;
	bodyFont?: string | null;
	showHowItWorks?: boolean;
};
export const checkSlugAvailabilitySchema = z.object({
	slug: wishlistSlugSchema,
	excludeWishlistId: wishlistIdSchema.optional(),
});

export const updateWishlistSettingsSchema = z.object({
	id: wishlistIdSchema,
	title: wishlistTitleSchema,
	slug: wishlistSlugSchema,
	displayName: wishlistDisplayNameSchema,
	eventDate: optionalNullableDate,
	eventTime: wishlistEventTimeSchema,
	eventLocation: wishlistEventLocationSchema,
	dressCode: wishlistDressCodeSchema,
	heroTitle: wishlistHeroTitleSchema,
	welcomeMessage: wishlistWelcomeMessageSchema,
	thankYouMessage: wishlistThankYouMessageSchema,
	language: localeSchema,
	currency: currencySchema,
	showHowItWorks: z.boolean(),
});

export const updateWishlistDesignSchema = z.object({
	id: wishlistIdSchema,
	themeId: wishlistThemeIdSchema,
	layoutId: wishlistLayoutIdSchema,
	fontPairing: wishlistFontPairingSchema,
	headingFont: wishlistHeadingFontSchema,
	bodyFont: wishlistBodyFontSchema,
	buttonStyle: wishlistButtonStyleSchema,
	coverImageUrl: wishlistCoverImageUrlSchema,
	coverImageUrls: wishlistCoverImageUrlsSchema.default([]),
});

export type PublishWishlistInput = z.infer<typeof publishWishlistSchema>;
export type ArchiveWishlistInput = z.infer<typeof archiveWishlistSchema>;
export type RestoreWishlistInput = z.infer<typeof restoreWishlistSchema>;
export type WishlistRestoreTargetStatus = z.infer<
	typeof wishlistRestoreTargetStatusSchema
>;
export type CheckSlugAvailabilityInput = z.infer<
	typeof checkSlugAvailabilitySchema
>;
export type UpdateWishlistSettingsInput = z.infer<
	typeof updateWishlistSettingsSchema
>;
export type UpdateWishlistDesignInput = z.infer<
	typeof updateWishlistDesignSchema
>;
