"use server";

import { auth } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { revalidatePath } from "next/cache";
import type {
	GiftPriority,
	GiftVisibilityStatus,
} from "@/generated/prisma/enums";
import { db } from "@/server/db";
import {
	assertOwnedWishlist,
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
	type CreateGiftInput,
	createGiftSchema,
	type ReorderGiftsInput,
	reorderGiftsSchema,
	type UpdateGiftInput,
	updateGiftSchema,
} from "@/server/validators/gift.schema";

async function getLocalOwnerId(): Promise<number> {
	const { userId } = await auth();
	if (!userId) {
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}
	return getOrCreateLocalUserId({ db, userId });
}

function revalidateGiftsRoute(wishlistId: string): void {
	revalidatePath(`/dashboard/wishlists/${wishlistId}/gifts`);
}

export async function createGiftAction(input: CreateGiftInput): Promise<void> {
	const parsed = createGiftSchema.parse(input);
	const ownerId = await getLocalOwnerId();
	await assertOwnedWishlist(db as unknown as DashboardGiftDatabase, {
		ownerId,
		wishlistId: parsed.wishlistId,
	});
	await createGift(db as unknown as GiftDatabase, parsed);
	revalidateGiftsRoute(parsed.wishlistId);
}

export async function updateGiftAction(
	wishlistId: string,
	input: UpdateGiftInput,
): Promise<void> {
	const parsed = updateGiftSchema.parse(input);
	const ownerId = await getLocalOwnerId();
	await getOwnedGift(db as unknown as DashboardGiftDatabase, {
		ownerId,
		giftId: parsed.giftId,
	});
	await updateGift(db as unknown as GiftDatabase, parsed);
	revalidateGiftsRoute(wishlistId);
}

export async function duplicateGiftAction(
	wishlistId: string,
	giftId: string,
): Promise<void> {
	const ownerId = await getLocalOwnerId();
	await duplicateGift(db as unknown as DuplicateGiftDatabase, {
		ownerId,
		giftId,
	});
	revalidateGiftsRoute(wishlistId);
}

export async function setGiftVisibilityAction(
	wishlistId: string,
	giftId: string,
	visibilityStatus: GiftVisibilityStatus,
): Promise<void> {
	const ownerId = await getLocalOwnerId();
	await getOwnedGift(db as unknown as DashboardGiftDatabase, {
		ownerId,
		giftId,
	});
	await updateGift(db as unknown as GiftDatabase, {
		giftId,
		visibilityStatus,
	});
	revalidateGiftsRoute(wishlistId);
}

export async function setGiftPriorityAction(
	wishlistId: string,
	giftId: string,
	priority: GiftPriority,
): Promise<void> {
	const ownerId = await getLocalOwnerId();
	await getOwnedGift(db as unknown as DashboardGiftDatabase, {
		ownerId,
		giftId,
	});
	await updateGift(db as unknown as GiftDatabase, {
		giftId,
		priority,
	});
	revalidateGiftsRoute(wishlistId);
}

export async function deleteGiftAction(wishlistId: string, giftId: string) {
	const ownerId = await getLocalOwnerId();
	await getOwnedGift(db as unknown as DashboardGiftDatabase, {
		ownerId,
		giftId,
	});
	await softDeleteGift(db as unknown as GiftDatabase, { giftId });
	revalidateGiftsRoute(wishlistId);
}

export async function reorderGiftsAction(input: ReorderGiftsInput) {
	const parsed = reorderGiftsSchema.parse(input);
	const ownerId = await getLocalOwnerId();
	await reorderGifts(db as unknown as ReorderGiftDatabase, {
		ownerId,
		...parsed,
	});
	revalidateGiftsRoute(parsed.wishlistId);
}
