import { createHash, randomBytes } from "node:crypto";
import { TRPCError } from "@trpc/server";
import type {
	Prisma,
	User,
	Wishlist,
	WishlistMember,
	WishlistMemberInvitation,
} from "@/generated/prisma/client";
import { assertWishlistAccess } from "@/server/services/collaboration.service";

export const INVITATION_EXPIRY_DAYS = 30;
const RESEND_COOLDOWN_MS = 60_000;

type UserSummary = Pick<User, "id" | "name" | "email">;

type WishlistMemberDelegate = {
	findFirst(
		args: Prisma.WishlistMemberFindFirstArgs,
	): Promise<Pick<WishlistMember, "id" | "userId" | "createdAt"> | null>;
	findMany(args: Prisma.WishlistMemberFindManyArgs): Promise<
		Array<
			Pick<WishlistMember, "id" | "createdAt"> & {
				user: Pick<User, "name" | "email">;
			}
		>
	>;
	create(args: Prisma.WishlistMemberCreateArgs): Promise<WishlistMember>;
	delete(args: Prisma.WishlistMemberDeleteArgs): Promise<WishlistMember>;
};

type WishlistMemberInvitationDelegate = {
	findFirst(
		args: Prisma.WishlistMemberInvitationFindFirstArgs,
	): Promise<WishlistMemberInvitation | null>;
	findMany(
		args: Prisma.WishlistMemberInvitationFindManyArgs,
	): Promise<WishlistMemberInvitation[]>;
	upsert(
		args: Prisma.WishlistMemberInvitationUpsertArgs,
	): Promise<WishlistMemberInvitation>;
	update(
		args: Prisma.WishlistMemberInvitationUpdateArgs,
	): Promise<WishlistMemberInvitation>;
	delete(
		args: Prisma.WishlistMemberInvitationDeleteArgs,
	): Promise<WishlistMemberInvitation>;
};

export type WishlistSharingDatabase = {
	wishlist: {
		findFirst(
			args: Prisma.WishlistFindFirstArgs,
		): Promise<Pick<Wishlist, "id" | "ownerId" | "title"> | null>;
	};
	user: {
		findUnique(args: Prisma.UserFindUniqueArgs): Promise<UserSummary | null>;
	};
	wishlistMember: WishlistMemberDelegate;
	wishlistMemberInvitation: WishlistMemberInvitationDelegate;
};

export const normalizeEmail = (email: string): string =>
	email.trim().toLowerCase();

const hashToken = (raw: string) =>
	createHash("sha256").update(raw).digest("hex");

const generateToken = () => randomBytes(32).toString("hex");

const displayName = (user: Pick<User, "name" | "email">) =>
	user.name ?? user.email;

const findAccountByEmail = (
	db: WishlistSharingDatabase,
	email: string,
): Promise<UserSummary | null> =>
	db.user.findUnique({
		where: { email },
		select: { id: true, name: true, email: true },
	}) as unknown as Promise<UserSummary | null>;

const getWishlistAndInviter = async (
	db: WishlistSharingDatabase,
	{ wishlistId, ownerId }: { wishlistId: string; ownerId: number },
) => {
	const [wishlist, inviter] = await Promise.all([
		db.wishlist.findFirst({
			where: { id: wishlistId },
			select: { id: true, ownerId: true, title: true },
		}),
		db.user.findUnique({
			where: { id: ownerId },
			select: { id: true, name: true, email: true },
		}),
	]);

	if (!wishlist || !inviter) {
		throw new TRPCError({ code: "NOT_FOUND", message: "Wishlist not found" });
	}

	return { wishlist, inviter };
};

export type RecipientPreview = {
	/** Null when the address has no account yet. */
	name: string | null;
};

export const getRecipientPreview = async (
	db: WishlistSharingDatabase,
	{
		wishlistId,
		ownerId,
		email,
	}: { wishlistId: string; ownerId: number; email: string },
): Promise<RecipientPreview> => {
	await assertWishlistAccess(db, {
		localUserId: ownerId,
		wishlistId,
		requireOwner: true,
	});

	const account = await findAccountByEmail(db, normalizeEmail(email));
	return { name: account ? displayName(account) : null };
};

export type ShareWishlistResult =
	| {
			status: "already_member";
	  }
	| {
			status: "granted_existing";
			email: string;
			recipientName: string;
			wishlistTitle: string;
			inviterName: string;
	  }
	| {
			status: "granted_pending";
			email: string;
			token: string;
			wishlistTitle: string;
			inviterName: string;
	  };

export const shareWishlist = async (
	db: WishlistSharingDatabase,
	{
		wishlistId,
		ownerId,
		email,
	}: { wishlistId: string; ownerId: number; email: string },
): Promise<ShareWishlistResult> => {
	await assertWishlistAccess(db, {
		localUserId: ownerId,
		wishlistId,
		requireOwner: true,
	});

	const { wishlist, inviter } = await getWishlistAndInviter(db, {
		wishlistId,
		ownerId,
	});

	const normalizedEmail = normalizeEmail(email);

	if (normalizedEmail === normalizeEmail(inviter.email)) {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "No puedes compartir la lista contigo mismo",
		});
	}

	const account = await findAccountByEmail(db, normalizedEmail);
	const inviterName = displayName(inviter);

	if (account) {
		const existingMembership = await db.wishlistMember.findFirst({
			where: { wishlistId, userId: account.id },
			select: { id: true, userId: true, createdAt: true },
		});

		if (existingMembership) {
			return { status: "already_member" };
		}

		await db.wishlistMember.create({
			data: {
				wishlist: { connect: { id: wishlistId } },
				user: { connect: { id: account.id } },
				invitedBy: { connect: { id: ownerId } },
			},
		});

		return {
			status: "granted_existing",
			email: normalizedEmail,
			recipientName: displayName(account),
			wishlistTitle: wishlist.title,
			inviterName,
		};
	}

	const rawToken = generateToken();
	const expiresAt = new Date(
		Date.now() + INVITATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
	);
	const now = new Date();

	await db.wishlistMemberInvitation.upsert({
		where: { wishlistId_email: { wishlistId, email: normalizedEmail } },
		create: {
			wishlist: { connect: { id: wishlistId } },
			email: normalizedEmail,
			tokenHash: hashToken(rawToken),
			invitedBy: { connect: { id: ownerId } },
			expiresAt,
			lastSentAt: now,
		},
		update: {
			tokenHash: hashToken(rawToken),
			invitedBy: { connect: { id: ownerId } },
			expiresAt,
			lastSentAt: now,
		},
	});

	return {
		status: "granted_pending",
		email: normalizedEmail,
		token: rawToken,
		wishlistTitle: wishlist.title,
		inviterName,
	};
};

export type CollaboratorView = {
	id: string;
	email: string;
	name: string;
	createdAt: Date;
};

export type PendingInvitationView = {
	id: string;
	email: string;
	lastSentAt: Date | null;
	createdAt: Date;
};

export const listCollaborators = async (
	db: WishlistSharingDatabase,
	{ wishlistId, ownerId }: { wishlistId: string; ownerId: number },
): Promise<{
	members: CollaboratorView[];
	invitations: PendingInvitationView[];
}> => {
	await assertWishlistAccess(db, {
		localUserId: ownerId,
		wishlistId,
		requireOwner: true,
	});

	const [members, invitations] = await Promise.all([
		db.wishlistMember.findMany({
			where: { wishlistId },
			include: { user: { select: { name: true, email: true } } },
			orderBy: { createdAt: "asc" },
		}),
		db.wishlistMemberInvitation.findMany({
			where: { wishlistId },
			orderBy: { createdAt: "asc" },
		}),
	]);

	return {
		members: members.map((member) => ({
			id: member.id,
			email: member.user.email,
			name: displayName(member.user),
			createdAt: member.createdAt,
		})),
		invitations: invitations.map((invitation) => ({
			id: invitation.id,
			email: invitation.email,
			lastSentAt: invitation.lastSentAt,
			createdAt: invitation.createdAt,
		})),
	};
};

export const removeCollaborator = async (
	db: WishlistSharingDatabase,
	{
		wishlistId,
		ownerId,
		memberId,
	}: { wishlistId: string; ownerId: number; memberId: string },
): Promise<void> => {
	await assertWishlistAccess(db, {
		localUserId: ownerId,
		wishlistId,
		requireOwner: true,
	});

	const member = await db.wishlistMember.findFirst({
		where: { id: memberId, wishlistId },
		select: { id: true, userId: true, createdAt: true },
	});

	if (!member) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "Collaborator not found",
		});
	}

	await db.wishlistMember.delete({ where: { id: memberId } });
};

export const revokeInvitation = async (
	db: WishlistSharingDatabase,
	{
		wishlistId,
		ownerId,
		invitationId,
	}: { wishlistId: string; ownerId: number; invitationId: string },
): Promise<void> => {
	await assertWishlistAccess(db, {
		localUserId: ownerId,
		wishlistId,
		requireOwner: true,
	});

	const invitation = await db.wishlistMemberInvitation.findFirst({
		where: { id: invitationId, wishlistId },
	});

	if (!invitation) {
		throw new TRPCError({ code: "NOT_FOUND", message: "Invitation not found" });
	}

	await db.wishlistMemberInvitation.delete({ where: { id: invitationId } });
};

export type ResendInvitationResult = {
	email: string;
	token: string;
	wishlistTitle: string;
	inviterName: string;
};

export const resendInvitation = async (
	db: WishlistSharingDatabase,
	{
		wishlistId,
		ownerId,
		invitationId,
	}: { wishlistId: string; ownerId: number; invitationId: string },
): Promise<ResendInvitationResult> => {
	await assertWishlistAccess(db, {
		localUserId: ownerId,
		wishlistId,
		requireOwner: true,
	});

	const invitation = await db.wishlistMemberInvitation.findFirst({
		where: { id: invitationId, wishlistId },
	});

	if (!invitation) {
		throw new TRPCError({ code: "NOT_FOUND", message: "Invitation not found" });
	}

	if (
		invitation.lastSentAt &&
		Date.now() - invitation.lastSentAt.getTime() < RESEND_COOLDOWN_MS
	) {
		throw new TRPCError({
			code: "TOO_MANY_REQUESTS",
			message: "Espera un momento antes de reenviar la invitación de nuevo",
		});
	}

	const { wishlist, inviter } = await getWishlistAndInviter(db, {
		wishlistId,
		ownerId,
	});

	const rawToken = generateToken();
	const now = new Date();

	await db.wishlistMemberInvitation.update({
		where: { id: invitationId },
		data: {
			tokenHash: hashToken(rawToken),
			lastSentAt: now,
		},
	});

	return {
		email: invitation.email,
		token: rawToken,
		wishlistTitle: wishlist.title,
		inviterName: displayName(inviter),
	};
};
