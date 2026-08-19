"use server";

import { auth } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { assertWishlistAccess } from "@/server/services/collaboration.service";
import {
	createInvite,
	deleteInvite,
	getOwnedInvite,
	type InviteDatabase,
	updateInvite,
} from "@/server/services/invite.service";
import { getOrCreateLocalUserId } from "@/server/services/local-user.service";
import {
	type CreateInviteInput,
	createInviteSchema,
	type UpdateInviteInput,
	updateInviteSchema,
} from "@/server/validators/invite.schema";

async function getLocalUserId(): Promise<number> {
	const { userId } = await auth();
	if (!userId) {
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}
	return getOrCreateLocalUserId({ db, userId });
}

function revalidateGuestsRoute(wishlistId: string): void {
	revalidatePath(`/dashboard/wishlists/${wishlistId}/guests`);
}

export async function createInviteAction(
	input: CreateInviteInput,
): Promise<void> {
	const parsed = createInviteSchema.parse(input);
	const localUserId = await getLocalUserId();
	await assertWishlistAccess(db as unknown as InviteDatabase, {
		localUserId,
		wishlistId: parsed.wishlistId,
	});
	await createInvite(db as unknown as InviteDatabase, parsed);
	revalidateGuestsRoute(parsed.wishlistId);
}

export async function updateInviteAction(
	wishlistId: string,
	input: UpdateInviteInput,
): Promise<void> {
	const parsed = updateInviteSchema.parse(input);
	const localUserId = await getLocalUserId();
	const existing = await getOwnedInvite(db as unknown as InviteDatabase, {
		localUserId,
		inviteId: parsed.inviteId,
	});
	await updateInvite(db as unknown as InviteDatabase, {
		...parsed,
		wishlistId: existing.wishlistId,
	});
	revalidateGuestsRoute(wishlistId);
}

export async function deleteInviteAction(
	wishlistId: string,
	inviteId: string,
): Promise<void> {
	const localUserId = await getLocalUserId();
	await getOwnedInvite(db as unknown as InviteDatabase, {
		localUserId,
		inviteId,
	});
	await deleteInvite(db as unknown as InviteDatabase, { inviteId });
	revalidateGuestsRoute(wishlistId);
}
