import { TRPCError } from "@trpc/server";
import type {
	Invite,
	InviteExtraGuest,
	Prisma,
} from "@/generated/prisma/client";
import { isRsvpClosed } from "@/lib/wishlist/rsvp-window";
import { getPublicWishlistAuditGuest } from "@/server/fixtures/public-wishlist-audit";
import type { PublicGuestViewModel } from "@/server/mappers/view-models";

type InviteWithExtras = Invite & { extraGuests: InviteExtraGuest[] };

type PublicInviteDelegate = {
	findFirst(args: Prisma.InviteFindFirstArgs): Promise<InviteWithExtras | null>;
	update(args: Prisma.InviteUpdateArgs): Promise<Invite>;
};

type PublicInviteExtraGuestDelegate = {
	update(args: Prisma.InviteExtraGuestUpdateArgs): Promise<InviteExtraGuest>;
};

type PublicRsvpWishlistDelegate = {
	findFirst(args: Prisma.WishlistFindFirstArgs): Promise<{
		id: string;
		eventDate: Date | null;
		rsvpDeadline: Date | null;
	} | null>;
};

type PublicInviteClient = {
	invite: PublicInviteDelegate;
	inviteExtraGuest: PublicInviteExtraGuestDelegate;
};

export type PublicInviteDatabase = PublicInviteClient & {
	wishlist: PublicRsvpWishlistDelegate;
	$transaction<T>(callback: (tx: PublicInviteClient) => Promise<T>): Promise<T>;
};

export type PersonalizedInviteResult =
	| { kind: "found"; guest: PublicGuestViewModel }
	| { kind: "notFound" };

export async function resolvePersonalizedInvite(
	db: PublicInviteDatabase,
	{ wishlistId, guestSlug }: { wishlistId: string; guestSlug: string },
): Promise<PersonalizedInviteResult> {
	const auditGuest = getPublicWishlistAuditGuest(wishlistId, guestSlug);
	if (auditGuest !== undefined) {
		return auditGuest
			? { kind: "found", guest: auditGuest }
			: { kind: "notFound" };
	}
	const invite = await db.invite.findFirst({
		where: { wishlistId, slug: guestSlug },
		include: { extraGuests: { orderBy: { sortOrder: "asc" } } },
	});

	if (!invite) {
		return { kind: "notFound" };
	}

	if (invite.openedAt === null) {
		try {
			await db.invite.update({
				where: { id: invite.id },
				data: { openedAt: new Date() },
			});
		} catch {
			// Best-effort tracking write; never block rendering the guest's page.
		}
	}

	return {
		kind: "found",
		guest: {
			slug: invite.slug,
			primaryName: invite.primaryName,
			extraGuests: invite.extraGuests.map((guest) => ({
				id: guest.id,
				name: guest.name,
				status: guest.status,
			})),
			status: invite.status,
		},
	};
}

export type RespondToInviteExtraGuestInput = {
	id: string;
	status: "confirmed" | "declined";
};

export type RespondToInviteInput = {
	wishlistSlug: string;
	guestSlug: string;
	status: "confirmed" | "declined";
	extraGuests: RespondToInviteExtraGuestInput[];
};

export type RespondToInviteResult = { status: string };

function sameIdSet(a: string[], b: string[]): boolean {
	if (a.length !== b.length) {
		return false;
	}
	const bSet = new Set(b);
	return a.every((id) => bSet.has(id));
}

export async function respondToInvite(
	db: PublicInviteDatabase,
	{ wishlistSlug, guestSlug, status, extraGuests }: RespondToInviteInput,
): Promise<RespondToInviteResult> {
	const wishlist = await db.wishlist.findFirst({
		where: { slug: wishlistSlug },
		select: { id: true, eventDate: true, rsvpDeadline: true },
	});
	if (!wishlist) {
		throw new TRPCError({ code: "NOT_FOUND", message: "Wishlist not found" });
	}

	const invite = await db.invite.findFirst({
		where: { wishlistId: wishlist.id, slug: guestSlug },
		include: { extraGuests: true },
	});
	if (!invite) {
		throw new TRPCError({ code: "NOT_FOUND", message: "Invite not found" });
	}

	if (
		isRsvpClosed(
			wishlist.eventDate?.toISOString() ?? null,
			wishlist.rsvpDeadline?.toISOString() ?? null,
		)
	) {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "El plazo para confirmar tu asistencia ya venció",
		});
	}

	if (
		!sameIdSet(
			invite.extraGuests.map((guest) => guest.id),
			extraGuests.map((guest) => guest.id),
		)
	) {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "Los acompañantes no coinciden con la invitación",
		});
	}

	const submittedStatusById = new Map(
		extraGuests.map((guest) => [guest.id, guest.status]),
	);

	const updated = await db.$transaction(async (tx) => {
		const updatedInvite = await tx.invite.update({
			where: { id: invite.id },
			data: { status, respondedAt: new Date() },
		});

		for (const guest of invite.extraGuests) {
			const guestStatus =
				status === "declined"
					? "declined"
					: (submittedStatusById.get(guest.id) ?? "declined");
			await tx.inviteExtraGuest.update({
				where: { id: guest.id },
				data: { status: guestStatus },
			});
		}

		return updatedInvite;
	});

	return { status: updated.status };
}
