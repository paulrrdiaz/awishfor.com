"use server";

import { auth } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { revalidatePath } from "next/cache";
import type {
	GiftPriority,
	GiftVisibilityStatus,
} from "@/generated/prisma/enums";
import { db } from "@/server/db";
import { assertWishlistAccess } from "@/server/services/collaboration.service";
import {
	createGift,
	type DashboardGiftDatabase,
	type DuplicateGiftDatabase,
	duplicateGift,
	type GiftDatabase,
	getOwnedGift,
	type ReorderGiftDatabase,
	reorderGifts,
	softDeleteGift,
	updateGift,
} from "@/server/services/gift.service";
import { getOrCreateLocalUserId } from "@/server/services/local-user.service";
import {
	invalidatePublicWishlistById,
	type PublicWishlistInvalidationDatabase,
} from "@/server/services/public-wishlist-cache";
import {
	type CreateGiftInput,
	createGiftSchema,
	type ReorderGiftsInput,
	reorderGiftsSchema,
	type UpdateGiftInput,
	updateGiftSchema,
} from "@/server/validators/gift.schema";

async function getLocalUserId(): Promise<number> {
	const { userId } = await auth();
	if (!userId) {
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}
	return getOrCreateLocalUserId({ db, userId });
}

function revalidateGiftsRoute(wishlistId: string): void {
	revalidatePath(`/dashboard/wishlists/${wishlistId}/gifts`);
}

async function invalidateWishlist(wishlistId: string): Promise<void> {
	await invalidatePublicWishlistById(
		db as unknown as PublicWishlistInvalidationDatabase,
		wishlistId,
	);
}

function assertGiftWishlist(
	actualWishlistId: string,
	wishlistId: string,
): void {
	if (actualWishlistId !== wishlistId) {
		throw new TRPCError({ code: "NOT_FOUND", message: "Gift not found" });
	}
}

export async function createGiftAction(input: CreateGiftInput): Promise<void> {
	const parsed = createGiftSchema.parse(input);
	const localUserId = await getLocalUserId();
	await assertWishlistAccess(db as unknown as DashboardGiftDatabase, {
		localUserId,
		wishlistId: parsed.wishlistId,
	});
	await createGift(db as unknown as GiftDatabase, parsed);
	await invalidateWishlist(parsed.wishlistId);
	revalidateGiftsRoute(parsed.wishlistId);
}

export async function updateGiftAction(
	wishlistId: string,
	input: UpdateGiftInput,
): Promise<void> {
	const parsed = updateGiftSchema.parse(input);
	const localUserId = await getLocalUserId();
	const existing = await getOwnedGift(db as unknown as DashboardGiftDatabase, {
		localUserId,
		giftId: parsed.giftId,
	});
	assertGiftWishlist(existing.wishlistId, wishlistId);
	await updateGift(db as unknown as GiftDatabase, parsed);
	await invalidateWishlist(existing.wishlistId);
	revalidateGiftsRoute(existing.wishlistId);
}

export async function duplicateGiftAction(
	wishlistId: string,
	giftId: string,
): Promise<{ id: string }> {
	const localUserId = await getLocalUserId();
	const existing = await getOwnedGift(db as unknown as DashboardGiftDatabase, {
		localUserId,
		giftId,
	});
	assertGiftWishlist(existing.wishlistId, wishlistId);
	const gift = await duplicateGift(db as unknown as DuplicateGiftDatabase, {
		localUserId,
		giftId,
	});
	await invalidateWishlist(gift.wishlistId);
	revalidateGiftsRoute(gift.wishlistId);
	return { id: gift.id };
}

export async function setGiftVisibilityAction(
	wishlistId: string,
	giftId: string,
	visibilityStatus: GiftVisibilityStatus,
): Promise<void> {
	const localUserId = await getLocalUserId();
	const existing = await getOwnedGift(db as unknown as DashboardGiftDatabase, {
		localUserId,
		giftId,
	});
	assertGiftWishlist(existing.wishlistId, wishlistId);
	await updateGift(db as unknown as GiftDatabase, {
		giftId,
		visibilityStatus,
	});
	await invalidateWishlist(existing.wishlistId);
	revalidateGiftsRoute(existing.wishlistId);
}

export async function setGiftPriorityAction(
	wishlistId: string,
	giftId: string,
	priority: GiftPriority,
): Promise<void> {
	const localUserId = await getLocalUserId();
	const existing = await getOwnedGift(db as unknown as DashboardGiftDatabase, {
		localUserId,
		giftId,
	});
	assertGiftWishlist(existing.wishlistId, wishlistId);
	await updateGift(db as unknown as GiftDatabase, {
		giftId,
		priority,
	});
	await invalidateWishlist(existing.wishlistId);
	revalidateGiftsRoute(existing.wishlistId);
}

export async function deleteGiftAction(wishlistId: string, giftId: string) {
	const localUserId = await getLocalUserId();
	const existing = await getOwnedGift(db as unknown as DashboardGiftDatabase, {
		localUserId,
		giftId,
	});
	assertGiftWishlist(existing.wishlistId, wishlistId);
	await softDeleteGift(db as unknown as GiftDatabase, { giftId });
	await invalidateWishlist(existing.wishlistId);
	revalidateGiftsRoute(existing.wishlistId);
}

export async function reorderGiftsAction(input: ReorderGiftsInput) {
	const parsed = reorderGiftsSchema.parse(input);
	const localUserId = await getLocalUserId();
	await reorderGifts(db as unknown as ReorderGiftDatabase, {
		localUserId,
		...parsed,
	});
	await invalidateWishlist(parsed.wishlistId);
	revalidateGiftsRoute(parsed.wishlistId);
}
