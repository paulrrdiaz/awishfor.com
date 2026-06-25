import { z } from "zod";
import {
	Currency,
	EventType,
	GiftPriority,
	GiftVisibilityStatus,
	Locale,
	WishlistStatus,
} from "@/generated/prisma/client";

export const wishlistIdSchema = z.string().min(1, "Wishlist id is required");

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

export const createWishlistSchema = z.object({});

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

export type CreateWishlistInput = z.infer<typeof createWishlistSchema>;
export type PublishWishlistInput = z.infer<typeof publishWishlistSchema>;
export type ArchiveWishlistInput = z.infer<typeof archiveWishlistSchema>;
export type RestoreWishlistInput = z.infer<typeof restoreWishlistSchema>;
export type WishlistRestoreTargetStatus = z.infer<
	typeof wishlistRestoreTargetStatusSchema
>;
