import { TRPCError } from "@trpc/server";
import type {
	Invite,
	InviteExtraGuest,
	InviteFollowUpKind,
	Prisma,
} from "@/generated/prisma/client";
import { isValidSlug } from "@/lib/slug";
import {
	deriveGuestSlug,
	isGuestSlugAvailable,
} from "@/lib/wishlist/guest-slug";
import type { WishlistAccessDatabase } from "@/server/services/collaboration.service";
import { assertWishlistAccess } from "@/server/services/collaboration.service";
import type {
	CreateInviteInput,
	UpdateInviteInput,
} from "@/server/validators/invite.schema";

export type InviteWithExtras = Invite & { extraGuests: InviteExtraGuest[] };

const extraGuestsOrder = {
	orderBy: { sortOrder: "asc" as const },
};

type InviteDelegate = {
	create(args: Prisma.InviteCreateArgs): Promise<InviteWithExtras>;
	update(args: Prisma.InviteUpdateArgs): Promise<InviteWithExtras>;
	delete(args: Prisma.InviteDeleteArgs): Promise<Invite>;
	findFirst(args: Prisma.InviteFindFirstArgs): Promise<InviteWithExtras | null>;
	findMany(args: Prisma.InviteFindManyArgs): Promise<InviteWithExtras[]>;
};

type OwnerRsvpClient = {
	invite: {
		update(args: Prisma.InviteUpdateArgs): Promise<Invite>;
	};
	inviteExtraGuest: {
		update(args: Prisma.InviteExtraGuestUpdateArgs): Promise<InviteExtraGuest>;
	};
};

export type InviteDatabase = {
	invite: InviteDelegate;
} & WishlistAccessDatabase;

export type OwnerRsvpDatabase = InviteDatabase & {
	$transaction<T>(callback: (tx: OwnerRsvpClient) => Promise<T>): Promise<T>;
};

export type OwnerFollowUpDatabase = InviteDatabase;

export type OwnerRsvpExtraGuestInput = {
	id: string;
	status: "confirmed" | "declined";
};

export const getOwnedInvite = async (
	db: InviteDatabase,
	{ localUserId, inviteId }: { localUserId: number; inviteId: string },
): Promise<InviteWithExtras> => {
	const invite = await db.invite.findFirst({
		where: { id: inviteId },
		include: { extraGuests: extraGuestsOrder },
	});
	if (!invite) {
		throw new TRPCError({ code: "NOT_FOUND", message: "Invite not found" });
	}
	await assertWishlistAccess(db, {
		localUserId,
		wishlistId: invite.wishlistId,
	});
	return invite;
};

export const getOwnerInvite = async (
	db: InviteDatabase,
	{ localUserId, inviteId }: { localUserId: number; inviteId: string },
): Promise<InviteWithExtras> => {
	const invite = await db.invite.findFirst({
		where: { id: inviteId },
		include: { extraGuests: extraGuestsOrder },
	});
	if (!invite) {
		throw new TRPCError({ code: "NOT_FOUND", message: "Invite not found" });
	}
	await assertWishlistAccess(db, {
		localUserId,
		wishlistId: invite.wishlistId,
		requireOwner: true,
	});
	return invite;
};

function hasExactExtraGuestSet(
	expected: InviteExtraGuest[],
	submitted: OwnerRsvpExtraGuestInput[],
): boolean {
	if (expected.length !== submitted.length) return false;
	const submittedIds = new Set(submitted.map((guest) => guest.id));
	return (
		submittedIds.size === submitted.length &&
		expected.every((guest) => submittedIds.has(guest.id))
	);
}

export async function recordOwnerRsvp(
	db: OwnerRsvpDatabase,
	{
		invite,
		status,
		extraGuests,
	}: {
		invite: InviteWithExtras;
		status: "confirmed" | "declined";
		extraGuests: OwnerRsvpExtraGuestInput[];
	},
): Promise<void> {
	if (!hasExactExtraGuestSet(invite.extraGuests, extraGuests)) {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "Los acompañantes no coinciden con la invitación",
		});
	}
	const statuses = new Map(
		extraGuests.map((guest) => [guest.id, guest.status]),
	);
	const now = new Date();
	await db.$transaction(async (tx) => {
		await tx.invite.update({
			where: { id: invite.id },
			data: {
				status,
				respondedAt: now,
				responseSource: "owner",
				responseLockedAt: now,
			},
		});
		for (const guest of invite.extraGuests) {
			await tx.inviteExtraGuest.update({
				where: { id: guest.id },
				data: {
					status:
						status === "declined"
							? "declined"
							: (statuses.get(guest.id) ?? "declined"),
				},
			});
		}
	});
}

export const reopenOwnerRsvp = (
	db: OwnerRsvpDatabase,
	{ inviteId }: { inviteId: string },
): Promise<Invite> =>
	db.invite.update({
		where: { id: inviteId },
		data: { responseSource: null, responseLockedAt: null },
	});

export async function recordFollowUpCopy(
	db: OwnerFollowUpDatabase,
	{
		localUserId,
		wishlistId,
		inviteId,
		kind,
		now = new Date(),
	}: {
		localUserId: number;
		wishlistId: string;
		inviteId: string;
		kind: InviteFollowUpKind;
		now?: Date;
	},
): Promise<void> {
	const invite = await getOwnedInvite(db, { localUserId, inviteId });
	if (invite.wishlistId !== wishlistId) {
		throw new TRPCError({ code: "NOT_FOUND", message: "Invite not found" });
	}
	await db.invite.update({
		where: { id: invite.id },
		data: { lastFollowUpKind: kind, lastFollowUpCopiedAt: now },
	});
}

const resolveSlug = async (
	db: InviteDatabase,
	{
		wishlistId,
		requestedSlug,
		fallbackName,
		excludeInviteId,
	}: {
		wishlistId: string;
		requestedSlug: string | undefined;
		fallbackName: string | undefined;
		excludeInviteId?: string;
	},
): Promise<string> => {
	const candidate =
		requestedSlug ?? (fallbackName ? deriveGuestSlug(fallbackName) : null);

	if (!candidate || !isValidSlug(candidate)) {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "El enlace no es válido",
		});
	}

	const siblingInvites = await db.invite.findMany({
		where: {
			wishlistId,
			...(excludeInviteId ? { NOT: { id: excludeInviteId } } : {}),
		},
		select: { slug: true },
	});

	if (
		!isGuestSlugAvailable(
			candidate,
			siblingInvites.map((invite) => invite.slug),
		)
	) {
		throw new TRPCError({
			code: "CONFLICT",
			message: "Ese enlace ya está en uso",
		});
	}

	return candidate;
};

const buildExtraGuestsCreateData = (
	extraGuests: { name?: string }[] | undefined,
) =>
	(extraGuests ?? []).map((guest, index) => ({
		name: guest.name ?? null,
		sortOrder: index,
	}));

export const createInvite = async (
	db: InviteDatabase,
	{
		wishlistId,
		primaryName,
		primaryEmail,
		primaryPhone,
		slug,
		extraGuests,
	}: CreateInviteInput,
): Promise<InviteWithExtras> => {
	const resolvedSlug = await resolveSlug(db, {
		wishlistId,
		requestedSlug: slug,
		fallbackName: primaryName,
	});

	return db.invite.create({
		data: {
			wishlist: { connect: { id: wishlistId } },
			primaryName,
			primaryEmail: primaryEmail ?? null,
			primaryPhone: primaryPhone ?? null,
			slug: resolvedSlug,
			extraGuests: { create: buildExtraGuestsCreateData(extraGuests) },
		},
		include: { extraGuests: extraGuestsOrder },
	});
};

export const updateInvite = async (
	db: InviteDatabase,
	{
		inviteId,
		wishlistId,
		primaryName,
		primaryEmail,
		primaryPhone,
		slug,
		extraGuests,
	}: UpdateInviteInput & { wishlistId: string },
): Promise<InviteWithExtras> => {
	const resolvedSlug =
		slug !== undefined
			? await resolveSlug(db, {
					wishlistId,
					requestedSlug: slug,
					fallbackName: undefined,
					excludeInviteId: inviteId,
				})
			: undefined;

	return db.invite.update({
		where: { id: inviteId },
		data: {
			...(primaryName !== undefined ? { primaryName } : {}),
			...(primaryEmail !== undefined
				? { primaryEmail: primaryEmail ?? null }
				: {}),
			...(primaryPhone !== undefined
				? { primaryPhone: primaryPhone ?? null }
				: {}),
			...(resolvedSlug !== undefined ? { slug: resolvedSlug } : {}),
			...(extraGuests !== undefined
				? {
						extraGuests: {
							deleteMany: {},
							create: buildExtraGuestsCreateData(extraGuests),
						},
					}
				: {}),
		},
		include: { extraGuests: extraGuestsOrder },
	});
};

export const deleteInvite = (
	db: InviteDatabase,
	{ inviteId }: { inviteId: string },
) => db.invite.delete({ where: { id: inviteId } });

export const listInvites = (
	db: InviteDatabase,
	{ wishlistId }: { wishlistId: string },
): Promise<InviteWithExtras[]> =>
	db.invite.findMany({
		where: { wishlistId },
		include: { extraGuests: extraGuestsOrder },
		orderBy: { createdAt: "asc" },
	});

export type InviteEngagementSummary = {
	confirmedGuests: number;
	declinedGuests: number;
	pendingGuests: number;
	openedInvitations: number;
	unopenedInvitations: number;
};

/**
 * RSVP and invitation-open counts across primary and extra guests. Ungated —
 * this mirrors what collaborators already see on the guest list.
 */
export function summarizeInviteEngagement(
	invites: InviteWithExtras[],
): InviteEngagementSummary {
	let confirmedGuests = 0;
	let declinedGuests = 0;
	let pendingGuests = 0;
	let openedInvitations = 0;

	const tally = (status: "confirmed" | "declined" | "pending") => {
		if (status === "confirmed") confirmedGuests += 1;
		else if (status === "declined") declinedGuests += 1;
		else pendingGuests += 1;
	};

	for (const invite of invites) {
		tally(invite.status);
		if (invite.openedAt !== null) openedInvitations += 1;
		for (const guest of invite.extraGuests) {
			tally(guest.status);
		}
	}

	return {
		confirmedGuests,
		declinedGuests,
		pendingGuests,
		openedInvitations,
		unopenedInvitations: invites.length - openedInvitations,
	};
}
