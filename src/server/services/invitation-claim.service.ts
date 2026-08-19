import { createHash } from "node:crypto";
import type { WishlistMemberInvitation } from "@/generated/prisma/client";
import { Prisma } from "@/generated/prisma/client";

type InvitationDelegate = {
	findFirst(args: {
		where: Prisma.WishlistMemberInvitationWhereInput;
	}): Promise<WishlistMemberInvitation | null>;
	findMany(args: {
		where: Prisma.WishlistMemberInvitationWhereInput;
	}): Promise<WishlistMemberInvitation[]>;
	delete(args: {
		where: Prisma.WishlistMemberInvitationWhereUniqueInput;
	}): Promise<WishlistMemberInvitation>;
};

type MemberDelegate = {
	create(args: Prisma.WishlistMemberCreateArgs): Promise<unknown>;
};

export type ClaimDatabase = {
	wishlistMemberInvitation: InvitationDelegate;
	wishlistMember: MemberDelegate;
};

const hashToken = (raw: string) =>
	createHash("sha256").update(raw).digest("hex");

const isUniqueConstraintError = (error: unknown): boolean =>
	error instanceof Prisma.PrismaClientKnownRequestError &&
	error.code === "P2002";

const createMembership = async (
	db: ClaimDatabase,
	invitation: WishlistMemberInvitation,
	localUserId: number,
) => {
	try {
		await db.wishlistMember.create({
			data: {
				wishlist: { connect: { id: invitation.wishlistId } },
				user: { connect: { id: localUserId } },
				...(invitation.invitedById
					? { invitedBy: { connect: { id: invitation.invitedById } } }
					: {}),
			},
		});
	} catch (error) {
		// Already claimed (concurrent request or double-run) — idempotent no-op.
		if (!isUniqueConstraintError(error)) {
			throw error;
		}
	}

	await db.wishlistMemberInvitation
		.delete({ where: { id: invitation.id } })
		.catch(() => {
			// Already deleted by a concurrent claim — fine.
		});
};

type InvitationPreviewDelegate = {
	findFirst(args: {
		where: Prisma.WishlistMemberInvitationWhereInput;
		include: {
			wishlist: {
				select: {
					title: true;
					owner: { select: { name: true; email: true } };
				};
			};
		};
	}): Promise<
		| (WishlistMemberInvitation & {
				wishlist: {
					title: string;
					owner: { name: string | null; email: string };
				};
		  })
		| null
	>;
};

export type InvitationPreviewDatabase = {
	wishlistMemberInvitation: InvitationPreviewDelegate;
};

export type InvitationPreviewResult =
	| { status: "found"; wishlistTitle: string; ownerName: string }
	| { status: "not_found" }
	| { status: "expired" };

/** Non-destructive lookup for the signed-out invitation landing page. */
export const getInvitationPreview = async (
	db: InvitationPreviewDatabase,
	{ token }: { token: string },
): Promise<InvitationPreviewResult> => {
	const invitation = await db.wishlistMemberInvitation.findFirst({
		where: { tokenHash: hashToken(token) },
		include: {
			wishlist: {
				select: { title: true, owner: { select: { name: true, email: true } } },
			},
		},
	});

	if (!invitation) {
		return { status: "not_found" };
	}

	if (invitation.expiresAt < new Date()) {
		return { status: "expired" };
	}

	return {
		status: "found",
		wishlistTitle: invitation.wishlist.title,
		ownerName:
			invitation.wishlist.owner.name ?? invitation.wishlist.owner.email,
	};
};

export type ClaimByTokenResult =
	| { status: "claimed"; wishlistId: string }
	| { status: "not_found" }
	| { status: "expired" };

/** Claim path A: claiming by the emailed token, independent of account email. */
export const claimInvitationByToken = async (
	db: ClaimDatabase,
	{ token, localUserId }: { token: string; localUserId: number },
): Promise<ClaimByTokenResult> => {
	const invitation = await db.wishlistMemberInvitation.findFirst({
		where: { tokenHash: hashToken(token) },
	});

	if (!invitation) {
		return { status: "not_found" };
	}

	if (invitation.expiresAt < new Date()) {
		return { status: "expired" };
	}

	await createMembership(db, invitation, localUserId);

	return { status: "claimed", wishlistId: invitation.wishlistId };
};

/**
 * Claim path B: sweeps pending invitations matching a newly created
 * account's verified email address. Call only when the local user row was
 * just created — this is a safety net, not the primary path.
 */
export const claimInvitationsForVerifiedEmail = async (
	db: ClaimDatabase,
	{ email, localUserId }: { email: string; localUserId: number },
): Promise<void> => {
	const normalizedEmail = email.trim().toLowerCase();
	const invitations = await db.wishlistMemberInvitation.findMany({
		where: { email: normalizedEmail },
	});

	const now = new Date();
	for (const invitation of invitations) {
		if (invitation.expiresAt < now) {
			continue;
		}
		await createMembership(db, invitation, localUserId);
	}
};
