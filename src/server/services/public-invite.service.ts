import { TRPCError } from "@trpc/server";
import type {
	Invite,
	InviteExtraGuest,
	Prisma,
} from "@/generated/prisma/client";
import {
	buildSeatingPass,
	isSeatingPassWindowOpen,
	type SeatingPassTableRow,
} from "@/lib/seating/seating-pass";
import { isRsvpClosed } from "@/lib/wishlist/rsvp-window";
import {
	getPublicWishlistAuditGuest,
	getPublicWishlistAuditSeatingPass,
} from "@/server/fixtures/public-wishlist-audit";
import type {
	PublicGuestViewModel,
	SeatingPassViewModel,
} from "@/server/mappers/view-models";

type InviteWithExtras = Invite & { extraGuests: InviteExtraGuest[] };

type PublicInviteDelegate = {
	findFirst(args: Prisma.InviteFindFirstArgs): Promise<InviteWithExtras | null>;
	update(args: Prisma.InviteUpdateArgs): Promise<Invite>;
};

type PublicInviteExtraGuestDelegate = {
	update(args: Prisma.InviteExtraGuestUpdateArgs): Promise<InviteExtraGuest>;
};

type PublicSeatingTableDelegate = {
	findMany(
		args: Prisma.SeatingTableFindManyArgs,
	): Promise<SeatingPassTableRow[]>;
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
	seatingTable: PublicSeatingTableDelegate;
	$transaction<T>(callback: (tx: PublicInviteClient) => Promise<T>): Promise<T>;
};

export type PersonalizedInviteResult =
	| {
			kind: "found";
			guest: PublicGuestViewModel;
			inviteId?: string;
			seatingPass?: SeatingPassViewModel;
	  }
	| { kind: "notFound" };

export type ResolvePersonalizedInviteInput = {
	wishlistId: string;
	guestSlug: string;
	eventDate?: string | null;
	eventTime?: string | null;
	eventLocation?: string | null;
	showMates?: boolean;
	showMap?: boolean;
	now?: Date;
};

export async function resolvePersonalizedInvite(
	db: PublicInviteDatabase,
	{
		wishlistId,
		guestSlug,
		eventDate = null,
		eventTime = null,
		eventLocation = null,
		showMates = true,
		showMap = true,
		now = new Date(),
	}: ResolvePersonalizedInviteInput,
): Promise<PersonalizedInviteResult> {
	const auditGuest = getPublicWishlistAuditGuest(wishlistId, guestSlug);
	if (auditGuest !== undefined) {
		if (!auditGuest) return { kind: "notFound" };
		const seatingPass = getPublicWishlistAuditSeatingPass(guestSlug);
		return seatingPass
			? { kind: "found", guest: auditGuest, seatingPass }
			: { kind: "found", guest: auditGuest };
	}
	const invite = await db.invite.findFirst({
		where: { wishlistId, slug: guestSlug },
		include: { extraGuests: { orderBy: { sortOrder: "asc" } } },
	});

	if (!invite) {
		return { kind: "notFound" };
	}

	const guest: PublicGuestViewModel = {
		slug: invite.slug,
		primaryName: invite.primaryName,
		extraGuests: invite.extraGuests.map((extra) => ({
			id: extra.id,
			name: extra.name,
			status: extra.status,
		})),
		status: invite.status,
		responseSource: invite.responseSource,
		responseLockedAt: invite.responseLockedAt?.toISOString() ?? null,
	};

	// Phase 1: cheap gates on data already loaded. Phase 2 (seating query) only
	// runs for confirmed invites inside the event window.
	let seatingPass: SeatingPassViewModel | null = null;
	if (isSeatingPassWindowOpen(eventDate, invite.status, now)) {
		const tables = await db.seatingTable.findMany({
			where: { wishlistId, assignments: { some: { inviteId: invite.id } } },
			orderBy: { sortOrder: "asc" },
			select: {
				id: true,
				name: true,
				sortOrder: true,
				capacity: true,
				assignments: {
					select: {
						inviteId: true,
						extraGuestId: true,
						invite: { select: { status: true, primaryName: true } },
						extraGuest: { select: { status: true, name: true } },
					},
				},
			},
		});
		// Other invites' rows never leave the server unless the owner allows it.
		const scopedTables = showMates
			? tables
			: tables.map((table) => ({
					...table,
					assignments: table.assignments.filter(
						(row) => row.inviteId === invite.id,
					),
				}));
		seatingPass = buildSeatingPass(
			{
				eventDate,
				eventTime,
				eventLocation,
				showMates,
				showMap,
				invite: {
					id: invite.id,
					status: invite.status,
					primaryName: invite.primaryName,
					extraGuests: invite.extraGuests.map((extra) => ({
						id: extra.id,
						name: extra.name,
						status: extra.status,
					})),
				},
				tables: scopedTables,
			},
			now,
		);
	}

	return {
		kind: "found",
		inviteId: invite.id,
		guest,
		...(seatingPass ? { seatingPass } : {}),
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
	return bSet.size === b.length && a.every((id) => bSet.has(id));
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
	if (invite.responseLockedAt) {
		throw new TRPCError({
			code: "CONFLICT",
			message: "La respuesta fue registrada por el anfitrión",
		});
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
			data: { status, respondedAt: new Date(), responseSource: "guest" },
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
