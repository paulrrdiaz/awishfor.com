import { TRPCError } from "@trpc/server";
import type {
	Invite,
	InviteExtraGuest,
	Prisma,
} from "@/generated/prisma/client";
import { isValidSlug } from "@/lib/slug";
import {
	deriveGuestSlug,
	isGuestSlugAvailable,
} from "@/lib/wishlist/guest-slug";
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

type WishlistDelegate = {
	findFirst(args: Prisma.WishlistFindFirstArgs): Promise<{ id: string } | null>;
};

export type InviteDatabase = {
	invite: InviteDelegate;
	wishlist: WishlistDelegate;
};

export const assertOwnedWishlist = async (
	db: InviteDatabase,
	{ ownerId, wishlistId }: { ownerId: number; wishlistId: string },
): Promise<void> => {
	const wishlist = await db.wishlist.findFirst({
		where: { id: wishlistId, ownerId },
		select: { id: true },
	});
	if (!wishlist) {
		throw new TRPCError({ code: "NOT_FOUND", message: "Wishlist not found" });
	}
};

export const getOwnedInvite = async (
	db: InviteDatabase,
	{ ownerId, inviteId }: { ownerId: number; inviteId: string },
): Promise<InviteWithExtras> => {
	const invite = await db.invite.findFirst({
		where: { id: inviteId, wishlist: { ownerId } },
		include: { extraGuests: extraGuestsOrder },
	});
	if (!invite) {
		throw new TRPCError({ code: "NOT_FOUND", message: "Invite not found" });
	}
	return invite;
};

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

export const respondToInvite = async (
	db: InviteDatabase,
	{
		wishlistSlug,
		guestSlug,
		status,
	}: {
		wishlistSlug: string;
		guestSlug: string;
		status: "confirmed" | "declined";
	},
): Promise<{ status: string }> => {
	const wishlist = await db.wishlist.findFirst({
		where: { slug: wishlistSlug },
		select: { id: true },
	});
	if (!wishlist) {
		throw new TRPCError({ code: "NOT_FOUND", message: "Wishlist not found" });
	}

	const invite = await db.invite.findFirst({
		where: { wishlistId: wishlist.id, slug: guestSlug },
		select: { id: true },
	});
	if (!invite) {
		throw new TRPCError({ code: "NOT_FOUND", message: "Invite not found" });
	}

	const updated = await db.invite.update({
		where: { id: invite.id },
		data: { status, respondedAt: new Date() },
		include: { extraGuests: extraGuestsOrder },
	});

	return { status: updated.status };
};
