import { z } from "zod";
import { Currency, Locale } from "@/generated/prisma/client";
import {
	CATEGORY_NAME_MAX_LENGTH,
	categoryNameSchema,
} from "@/server/validators/category.schema";
import {
	GIFT_NOTE_MAX_LENGTH,
	GIFT_URL_MAX_LENGTH,
	giftNameSchema,
	giftQuantityNeededSchema,
} from "@/server/validators/gift.schema";
import {
	currencySchema,
	eventTypeSchema,
	giftPrioritySchema,
	wishlistButtonStyleSchema,
	wishlistCoverImageUrlSchema,
	wishlistDisplayNameSchema,
	wishlistEventLocationSchema,
	wishlistEventTimeSchema,
	wishlistFontPairingSchema,
	wishlistHeroTitleSchema,
	wishlistIdSchema,
	wishlistLayoutIdSchema,
	wishlistSlugSchema,
	wishlistThankYouMessageSchema,
	wishlistThemeIdSchema,
	wishlistTitleSchema,
	wishlistWelcomeMessageSchema,
} from "@/server/validators/wishlist.schema";

export const SAVE_DRAFT_MAX_CATEGORIES = 50;
export const SAVE_DRAFT_MAX_GIFTS = 200;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const normalizeNullableUrl = (fieldName: string) =>
	z.preprocess((value) => {
		if (value === undefined) return undefined;
		if (value === null) return null;
		if (typeof value === "string") {
			const trimmed = value.trim();
			return trimmed === "" ? null : trimmed;
		}
		return value;
	}, z
		.url(`${fieldName} must be a valid URL`)
		.max(
			GIFT_URL_MAX_LENGTH,
			`${fieldName} must be at most ${GIFT_URL_MAX_LENGTH} characters`,
		)
		.nullable()
		.optional());

const normalizeNullableText = (fieldName: string, maxLength: number) =>
	z.preprocess((value) => {
		if (value === undefined) return undefined;
		if (value === null) return null;
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

const normalizeNullableCategory = z.preprocess((value) => {
	if (value === undefined) return undefined;
	if (value === null) return null;
	if (typeof value === "string") {
		const trimmed = value.trim();
		return trimmed === "" ? null : trimmed;
	}
	return value;
}, z
	.string()
	.max(
		CATEGORY_NAME_MAX_LENGTH,
		`Gift category must be at most ${CATEGORY_NAME_MAX_LENGTH} characters`,
	)
	.nullable()
	.optional());

const saveDraftGiftSchema = z.object({
	name: giftNameSchema,
	productUrl: normalizeNullableUrl("Product URL"),
	imageUrl: normalizeNullableUrl("Image URL"),
	priceAmount: z
		.number({ message: "Price must be a number" })
		.nonnegative("Price must be zero or greater")
		.nullable(),
	category: normalizeNullableCategory,
	quantityNeeded: giftQuantityNeededSchema,
	priority: giftPrioritySchema,
	publicNote: normalizeNullableText("Public note", GIFT_NOTE_MAX_LENGTH),
	internalNote: normalizeNullableText("Internal note", GIFT_NOTE_MAX_LENGTH),
	hidden: z.boolean(),
	sortOrder: z.number().int().min(0, "Gift sort order must be zero or greater"),
});

export const saveDraftDraftContentSchema = z.object({
	title: wishlistTitleSchema,
	slug: wishlistSlugSchema,
	eventType: eventTypeSchema,
	language: z.enum(Locale).default(Locale.es),
	currency: currencySchema.default(Currency.PEN),
	heroTitle: wishlistHeroTitleSchema,
	welcomeMessage: wishlistWelcomeMessageSchema,
	thankYouMessage: wishlistThankYouMessageSchema,
	displayName: wishlistDisplayNameSchema,
	eventDate: z
		.string()
		.regex(ISO_DATE_PATTERN, "Event date must use YYYY-MM-DD format")
		.nullable()
		.optional(),
	eventTime: wishlistEventTimeSchema,
	eventLocation: wishlistEventLocationSchema,
	coverImageUrl: wishlistCoverImageUrlSchema,
	themeId: wishlistThemeIdSchema,
	layoutId: wishlistLayoutIdSchema,
	buttonStyle: wishlistButtonStyleSchema,
	fontPairing: wishlistFontPairingSchema,
	showHowItWorks: z.boolean().default(true),
	categories: z
		.array(categoryNameSchema)
		.max(
			SAVE_DRAFT_MAX_CATEGORIES,
			`Categories must contain at most ${SAVE_DRAFT_MAX_CATEGORIES} items`,
		),
	gifts: z
		.array(saveDraftGiftSchema)
		.max(
			SAVE_DRAFT_MAX_GIFTS,
			`Gifts must contain at most ${SAVE_DRAFT_MAX_GIFTS} items`,
		),
});

export const saveDraftWishlistSchema = saveDraftDraftContentSchema
	.extend({
		savedWishlistId: wishlistIdSchema.nullable().optional(),
		lastSavedAt: z
			.number()
			.int("Revision must be a whole number")
			.nonnegative("Revision must be zero or greater")
			.nullable()
			.optional(),
		force: z.boolean().default(false),
	})
	.superRefine((value, ctx) => {
		const normalizedCategories = new Map<string, number>();

		for (const [index, category] of value.categories.entries()) {
			const normalized = category.trim().toLocaleLowerCase();
			const existingIndex = normalizedCategories.get(normalized);

			if (existingIndex !== undefined) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message:
						"Category names must be unique after trimming and case-folding",
					path: ["categories", index],
				});
			} else {
				normalizedCategories.set(normalized, index);
			}
		}

		const seenSortOrders = new Set<number>();

		for (const [index, gift] of value.gifts.entries()) {
			if (seenSortOrders.has(gift.sortOrder)) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Gift sort orders must be unique",
					path: ["gifts", index, "sortOrder"],
				});
			}

			seenSortOrders.add(gift.sortOrder);

			const category = gift.category ?? null;
			if (category !== null) {
				const normalizedCategory = category.trim().toLocaleLowerCase();
				if (!normalizedCategories.has(normalizedCategory)) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message:
							"Gift category must reference a submitted category or be empty",
						path: ["gifts", index, "category"],
					});
				}
			}
		}

		if (value.savedWishlistId && value.lastSavedAt === null && !value.force) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message:
					"Revision is required when updating an existing draft without overwrite confirmation",
				path: ["lastSavedAt"],
			});
		}
	});

export type SaveDraftGiftInput = z.infer<typeof saveDraftGiftSchema>;
export type SaveDraftDraftContent = z.infer<typeof saveDraftDraftContentSchema>;
export type SaveDraftWishlistInput = z.infer<typeof saveDraftWishlistSchema>;
export type SaveDraftServerDraft = SaveDraftDraftContent & {
	savedWishlistId: string;
	lastSavedAt: number;
};
