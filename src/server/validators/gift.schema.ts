import { z } from "zod";
import {
	Currency,
	GiftPriority,
	GiftVisibilityStatus,
} from "@/generated/prisma/enums";
import { wishlistIdSchema } from "@/server/validators/wishlist.schema";

export const GIFT_NAME_MAX_LENGTH = 200;
export const GIFT_NOTE_MAX_LENGTH = 2_000;
export const GIFT_URL_MAX_LENGTH = 2_000;
export const GIFT_STORE_NAME_MAX_LENGTH = 120;
export const GIFT_SIZE_MAX_LENGTH = 60;

export const giftIdSchema = z.string().min(1, "Gift id is required");

export const giftNameSchema = z
	.string()
	.trim()
	.min(1, "Gift name is required")
	.max(
		GIFT_NAME_MAX_LENGTH,
		`Gift name must be at most ${GIFT_NAME_MAX_LENGTH} characters`,
	);

export const giftQuantityNeededSchema = z
	.number()
	.int("Quantity must be a whole number")
	.min(1, "Quantity must be at least 1");

export const giftPriceAmountSchema = z.preprocess((value) => {
	if (value === undefined || value === null || value === "") return undefined;
	const n = typeof value === "string" ? Number(value) : value;
	return Number.isNaN(n) ? value : n;
}, z
	.number({ message: "Price must be a number" })
	.nonnegative("Price must be zero or greater")
	.optional());

export const giftPriceCurrencySchema = z
	.enum(Object.values(Currency) as [string, ...string[]])
	.optional();

const optionalUrl = (fieldName: string) =>
	z.preprocess(
		(v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
		z
			.url(`${fieldName} must be a valid URL`)
			.max(
				GIFT_URL_MAX_LENGTH,
				`${fieldName} must be at most ${GIFT_URL_MAX_LENGTH} characters`,
			)
			.refine(
				(url) => {
					try {
						const { protocol } = new URL(url);
						return protocol === "http:" || protocol === "https:";
					} catch {
						return false;
					}
				},
				{ message: `${fieldName} must use http or https scheme` },
			)
			.optional(),
	);

const optionalTrimmedString = (fieldName: string, maxLength: number) =>
	z.preprocess(
		(v) =>
			typeof v === "string" && v.trim() === ""
				? undefined
				: typeof v === "string"
					? v.trim()
					: v,
		z
			.string()
			.max(maxLength, `${fieldName} must be at most ${maxLength} characters`)
			.optional(),
	);

export const createGiftSchema = z.object({
	wishlistId: wishlistIdSchema,
	categoryId: z.string().optional(),
	name: giftNameSchema,
	productUrl: optionalUrl("Product URL"),
	imageUrl: optionalUrl("Image URL"),
	storeName: optionalTrimmedString("Store name", GIFT_STORE_NAME_MAX_LENGTH),
	size: optionalTrimmedString("Size", GIFT_SIZE_MAX_LENGTH),
	priceAmount: giftPriceAmountSchema,
	priceCurrency: giftPriceCurrencySchema,
	quantityNeeded: giftQuantityNeededSchema.default(1),
	priority: z
		.enum(Object.values(GiftPriority) as [string, ...string[]])
		.default(GiftPriority.medium),
	visibilityStatus: z
		.enum(Object.values(GiftVisibilityStatus) as [string, ...string[]])
		.default(GiftVisibilityStatus.available),
	publicNote: optionalTrimmedString("Public note", GIFT_NOTE_MAX_LENGTH),
	internalNote: optionalTrimmedString("Internal note", GIFT_NOTE_MAX_LENGTH),
	sortOrder: z.number().int().default(0),
});

export const updateGiftSchema = z.object({
	giftId: giftIdSchema,
	categoryId: z.string().nullable().optional(),
	name: giftNameSchema.optional(),
	productUrl: optionalUrl("Product URL"),
	imageUrl: optionalUrl("Image URL"),
	storeName: optionalTrimmedString("Store name", GIFT_STORE_NAME_MAX_LENGTH),
	size: optionalTrimmedString("Size", GIFT_SIZE_MAX_LENGTH),
	priceAmount: giftPriceAmountSchema,
	priceCurrency: giftPriceCurrencySchema,
	quantityNeeded: giftQuantityNeededSchema.optional(),
	priority: z
		.enum(Object.values(GiftPriority) as [string, ...string[]])
		.optional(),
	visibilityStatus: z
		.enum(Object.values(GiftVisibilityStatus) as [string, ...string[]])
		.optional(),
	publicNote: optionalTrimmedString("Public note", GIFT_NOTE_MAX_LENGTH),
	internalNote: optionalTrimmedString("Internal note", GIFT_NOTE_MAX_LENGTH),
	sortOrder: z.number().int().optional(),
});

export const deleteGiftSchema = z.object({
	giftId: giftIdSchema,
});

export const reorderGiftsSchema = z.object({
	wishlistId: wishlistIdSchema,
	orderedGiftIds: z.array(z.string().min(1)).min(1),
});

export type CreateGiftInput = z.infer<typeof createGiftSchema>;
export type UpdateGiftInput = z.infer<typeof updateGiftSchema>;
export type DeleteGiftInput = z.infer<typeof deleteGiftSchema>;
export type ReorderGiftsInput = z.infer<typeof reorderGiftsSchema>;
