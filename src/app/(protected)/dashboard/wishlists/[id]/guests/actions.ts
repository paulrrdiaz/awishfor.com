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
	getOwnerInvite,
	type InviteDatabase,
	type OwnerRsvpDatabase,
	recordOwnerRsvp,
	reopenOwnerRsvp,
	updateInvite,
} from "@/server/services/invite.service";
import { getOrCreateLocalUserId } from "@/server/services/local-user.service";
import {
	type CreateInviteInput,
	createInviteSchema,
	type RecordOwnerRsvpInput,
	recordOwnerRsvpSchema,
	reopenOwnerRsvpSchema,
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

export async function recordOwnerRsvpAction(
	wishlistId: string,
	input: RecordOwnerRsvpInput,
): Promise<void> {
	const parsed = recordOwnerRsvpSchema.parse(input);
	const localUserId = await getLocalUserId();
	const invite = await getOwnerInvite(db as unknown as InviteDatabase, {
		localUserId,
		inviteId: parsed.inviteId,
	});
	await recordOwnerRsvp(db as unknown as OwnerRsvpDatabase, {
		invite,
		status: parsed.status,
		extraGuests: parsed.extraGuests,
	});
	revalidateGuestsRoute(wishlistId);
}

export async function reopenOwnerRsvpAction(
	wishlistId: string,
	inviteId: string,
): Promise<void> {
	const parsed = reopenOwnerRsvpSchema.parse({ inviteId });
	const localUserId = await getLocalUserId();
	await getOwnerInvite(db as unknown as InviteDatabase, {
		localUserId,
		inviteId: parsed.inviteId,
	});
	await reopenOwnerRsvp(db as unknown as OwnerRsvpDatabase, parsed);
	revalidateGuestsRoute(wishlistId);
}
