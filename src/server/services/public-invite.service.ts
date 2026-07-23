import type {
	Invite,
	InviteExtraGuest,
	Prisma,
} from "@/generated/prisma/client";
import type { PublicGuestViewModel } from "@/server/mappers/view-models";

type InviteWithExtras = Invite & { extraGuests: InviteExtraGuest[] };

type PublicInviteDelegate = {
	findFirst(args: Prisma.InviteFindFirstArgs): Promise<InviteWithExtras | null>;
	update(args: Prisma.InviteUpdateArgs): Promise<Invite>;
};

export type PublicInviteDatabase = {
	invite: PublicInviteDelegate;
};

export type PersonalizedInviteResult =
	| { kind: "found"; guest: PublicGuestViewModel }
	| { kind: "notFound" };

export async function resolvePersonalizedInvite(
	db: PublicInviteDatabase,
	{ wishlistId, guestSlug }: { wishlistId: string; guestSlug: string },
): Promise<PersonalizedInviteResult> {
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
			extraGuests: invite.extraGuests.map((guest) => ({ name: guest.name })),
			status: invite.status,
		},
	};
}
