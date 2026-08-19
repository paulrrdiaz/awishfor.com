import { describe, expect, it } from "vitest";
import {
	getRecipientPreview,
	listCollaborators,
	normalizeEmail,
	removeCollaborator,
	resendInvitation,
	revokeInvitation,
	shareWishlist,
	type WishlistSharingDatabase,
} from "@/server/services/wishlist-sharing.service";

type FakeWishlist = { id: string; ownerId: number; title: string };
type FakeUser = { id: number; name: string | null; email: string };
type FakeMember = {
	id: string;
	wishlistId: string;
	userId: number;
	createdAt: Date;
};
type FakeInvitation = {
	id: string;
	wishlistId: string;
	email: string;
	tokenHash: string;
	invitedById: number | null;
	expiresAt: Date;
	lastSentAt: Date | null;
	createdAt: Date;
};

const OWNER: FakeUser = { id: 1, name: "Ana Torres", email: "ana@example.com" };
const WISHLIST: FakeWishlist = {
	id: "wl_1",
	ownerId: 1,
	title: "Boda de Ana",
};

const makeState = (
	overrides: Partial<{
		wishlists: FakeWishlist[];
		users: FakeUser[];
		members: FakeMember[];
		invitations: FakeInvitation[];
	}> = {},
) => ({
	wishlists: overrides.wishlists ?? [WISHLIST],
	users: overrides.users ?? [OWNER],
	members: overrides.members ?? [],
	invitations: overrides.invitations ?? [],
});

const makeDb = (
	state: ReturnType<typeof makeState>,
): WishlistSharingDatabase & { state: ReturnType<typeof makeState> } => ({
	state,
	wishlist: {
		findFirst: async (args) => {
			const where = args.where as {
				id?: string;
				ownerId?: number;
				OR?: Array<{ ownerId?: number }>;
			};
			return (
				state.wishlists.find((wishlist) => {
					if (where.id !== undefined && wishlist.id !== where.id) return false;
					if (where.ownerId !== undefined) {
						return wishlist.ownerId === where.ownerId;
					}
					if (where.OR) {
						return where.OR.some(
							(clause) =>
								clause.ownerId !== undefined &&
								wishlist.ownerId === clause.ownerId,
						);
					}
					return true;
				}) ?? null
			);
		},
	},
	user: {
		findUnique: async (args) => {
			const where = args.where as { id?: number; email?: string };
			return (
				state.users.find(
					(user) =>
						(where.id === undefined || user.id === where.id) &&
						(where.email === undefined || user.email === where.email),
				) ?? null
			);
		},
	},
	wishlistMember: {
		findFirst: async (args) => {
			const where = args.where as {
				id?: string;
				wishlistId?: string;
				userId?: number;
			};
			return (
				state.members.find(
					(member) =>
						(where.id === undefined || member.id === where.id) &&
						(where.wishlistId === undefined ||
							member.wishlistId === where.wishlistId) &&
						(where.userId === undefined || member.userId === where.userId),
				) ?? null
			);
		},
		findMany: async (args) => {
			const where = args.where as { wishlistId?: string };
			return state.members
				.filter(
					(member) =>
						where.wishlistId === undefined ||
						member.wishlistId === where.wishlistId,
				)
				.map((member) => {
					const user = state.users.find((u) => u.id === member.userId);
					if (!user) throw new Error("Expected user for member");
					return {
						id: member.id,
						createdAt: member.createdAt,
						user: { name: user.name, email: user.email },
					};
				});
		},
		create: async (args) => {
			const data = args.data as {
				wishlist: { connect: { id: string } };
				user: { connect: { id: number } };
				invitedBy?: { connect: { id: number } };
			};
			const member: FakeMember = {
				id: `member_${state.members.length + 1}`,
				wishlistId: data.wishlist.connect.id,
				userId: data.user.connect.id,
				createdAt: new Date(),
			};
			state.members.push(member);
			return member as never;
		},
		delete: async (args) => {
			const where = args.where as { id: string };
			const index = state.members.findIndex((m) => m.id === where.id);
			const [removed] = state.members.splice(index, 1);
			return removed as never;
		},
	},
	wishlistMemberInvitation: {
		findFirst: async (args) => {
			const where = args.where as { id?: string; wishlistId?: string };
			return (
				state.invitations.find(
					(invitation) =>
						(where.id === undefined || invitation.id === where.id) &&
						(where.wishlistId === undefined ||
							invitation.wishlistId === where.wishlistId),
				) ?? null
			);
		},
		findMany: async (args) => {
			const where = args.where as { wishlistId?: string };
			return state.invitations.filter(
				(invitation) =>
					where.wishlistId === undefined ||
					invitation.wishlistId === where.wishlistId,
			);
		},
		upsert: async (args) => {
			const where = args.where as {
				wishlistId_email: { wishlistId: string; email: string };
			};
			const existing = state.invitations.find(
				(invitation) =>
					invitation.wishlistId === where.wishlistId_email.wishlistId &&
					invitation.email === where.wishlistId_email.email,
			);
			if (existing) {
				const data = args.update as Partial<FakeInvitation>;
				Object.assign(existing, data);
				return existing;
			}
			const data = args.create as {
				wishlist: { connect: { id: string } };
				email: string;
				tokenHash: string;
				invitedBy: { connect: { id: number } };
				expiresAt: Date;
				lastSentAt: Date;
			};
			const invitation: FakeInvitation = {
				id: `invitation_${state.invitations.length + 1}`,
				wishlistId: data.wishlist.connect.id,
				email: data.email,
				tokenHash: data.tokenHash,
				invitedById: data.invitedBy.connect.id,
				expiresAt: data.expiresAt,
				lastSentAt: data.lastSentAt,
				createdAt: new Date(),
			};
			state.invitations.push(invitation);
			return invitation;
		},
		update: async (args) => {
			const where = args.where as { id: string };
			const invitation = state.invitations.find((i) => i.id === where.id);
			if (!invitation) throw new Error("Invitation not found");
			Object.assign(invitation, args.data as Partial<FakeInvitation>);
			return invitation;
		},
		delete: async (args) => {
			const where = args.where as { id: string };
			const index = state.invitations.findIndex((i) => i.id === where.id);
			const [removed] = state.invitations.splice(index, 1);
			return removed as never;
		},
	},
});

describe("normalizeEmail", () => {
	it("trims and lowercases", () => {
		expect(normalizeEmail("  Ana@Example.COM ")).toBe("ana@example.com");
	});
});

describe("shareWishlist", () => {
	it("rejects sharing with the owner's own address", async () => {
		const db = makeDb(makeState());
		await expect(
			shareWishlist(db, {
				wishlistId: "wl_1",
				ownerId: 1,
				email: "ana@example.com",
			}),
		).rejects.toMatchObject({ code: "BAD_REQUEST" });
	});

	it("grants immediate membership when the address has an account", async () => {
		const collaborator: FakeUser = {
			id: 2,
			name: "Marco Pérez",
			email: "marco@example.com",
		};
		const db = makeDb(makeState({ users: [OWNER, collaborator] }));

		const result = await shareWishlist(db, {
			wishlistId: "wl_1",
			ownerId: 1,
			email: "  Marco@Example.com ",
		});

		expect(result).toMatchObject({
			status: "granted_existing",
			email: "marco@example.com",
			recipientName: "Marco Pérez",
			wishlistTitle: "Boda de Ana",
		});
		expect(db.state.members).toHaveLength(1);
		expect(db.state.members[0]?.userId).toBe(2);
	});

	it("is idempotent when the address is already a collaborator", async () => {
		const collaborator: FakeUser = {
			id: 2,
			name: "Marco Pérez",
			email: "marco@example.com",
		};
		const db = makeDb(
			makeState({
				users: [OWNER, collaborator],
				members: [
					{
						id: "member_1",
						wishlistId: "wl_1",
						userId: 2,
						createdAt: new Date(),
					},
				],
			}),
		);

		const result = await shareWishlist(db, {
			wishlistId: "wl_1",
			ownerId: 1,
			email: "marco@example.com",
		});

		expect(result).toEqual({ status: "already_member" });
		expect(db.state.members).toHaveLength(1);
	});

	it("records a pending invitation when the address has no account", async () => {
		const db = makeDb(makeState());

		const result = await shareWishlist(db, {
			wishlistId: "wl_1",
			ownerId: 1,
			email: "future@example.com",
		});

		expect(result.status).toBe("granted_pending");
		if (result.status === "granted_pending") {
			expect(result.email).toBe("future@example.com");
			expect(result.token).toHaveLength(64);
		}
		expect(db.state.invitations).toHaveLength(1);
		expect(db.state.invitations[0]?.email).toBe("future@example.com");
	});

	it("refreshes the token and expiry when re-sharing to the same pending address", async () => {
		const db = makeDb(makeState());
		const first = await shareWishlist(db, {
			wishlistId: "wl_1",
			ownerId: 1,
			email: "future@example.com",
		});
		const second = await shareWishlist(db, {
			wishlistId: "wl_1",
			ownerId: 1,
			email: "future@example.com",
		});

		expect(db.state.invitations).toHaveLength(1);
		if (
			first.status === "granted_pending" &&
			second.status === "granted_pending"
		) {
			expect(first.token).not.toBe(second.token);
		}
	});

	it("rejects a non-owner caller with NOT_FOUND", async () => {
		const db = makeDb(makeState());
		await expect(
			shareWishlist(db, {
				wishlistId: "wl_1",
				ownerId: 99,
				email: "future@example.com",
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});
});

describe("getRecipientPreview", () => {
	it("returns the account name when the address has an account", async () => {
		const collaborator: FakeUser = {
			id: 2,
			name: "Marco Pérez",
			email: "marco@example.com",
		};
		const db = makeDb(makeState({ users: [OWNER, collaborator] }));

		const preview = await getRecipientPreview(db, {
			wishlistId: "wl_1",
			ownerId: 1,
			email: "marco@example.com",
		});

		expect(preview).toEqual({ name: "Marco Pérez" });
	});

	it("returns null when the address has no account", async () => {
		const db = makeDb(makeState());
		const preview = await getRecipientPreview(db, {
			wishlistId: "wl_1",
			ownerId: 1,
			email: "future@example.com",
		});
		expect(preview).toEqual({ name: null });
	});
});

describe("collaborator management is owner-reserved", () => {
	it("listCollaborators rejects a collaborator", async () => {
		const db = makeDb(
			makeState({
				members: [
					{
						id: "member_1",
						wishlistId: "wl_1",
						userId: 2,
						createdAt: new Date(),
					},
				],
			}),
		);
		await expect(
			listCollaborators(db, { wishlistId: "wl_1", ownerId: 2 }),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("removeCollaborator rejects a collaborator", async () => {
		const db = makeDb(
			makeState({
				members: [
					{
						id: "member_1",
						wishlistId: "wl_1",
						userId: 2,
						createdAt: new Date(),
					},
				],
			}),
		);
		await expect(
			removeCollaborator(db, {
				wishlistId: "wl_1",
				ownerId: 2,
				memberId: "member_1",
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("revokeInvitation rejects a collaborator", async () => {
		const db = makeDb(
			makeState({
				members: [
					{
						id: "member_1",
						wishlistId: "wl_1",
						userId: 2,
						createdAt: new Date(),
					},
				],
				invitations: [
					{
						id: "invitation_1",
						wishlistId: "wl_1",
						email: "future@example.com",
						tokenHash: "hash",
						invitedById: 1,
						expiresAt: new Date(Date.now() + 1000),
						lastSentAt: null,
						createdAt: new Date(),
					},
				],
			}),
		);
		await expect(
			revokeInvitation(db, {
				wishlistId: "wl_1",
				ownerId: 2,
				invitationId: "invitation_1",
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("resendInvitation rejects a collaborator", async () => {
		const db = makeDb(
			makeState({
				members: [
					{
						id: "member_1",
						wishlistId: "wl_1",
						userId: 2,
						createdAt: new Date(),
					},
				],
				invitations: [
					{
						id: "invitation_1",
						wishlistId: "wl_1",
						email: "future@example.com",
						tokenHash: "hash",
						invitedById: 1,
						expiresAt: new Date(Date.now() + 1000),
						lastSentAt: null,
						createdAt: new Date(),
					},
				],
			}),
		);
		await expect(
			resendInvitation(db, {
				wishlistId: "wl_1",
				ownerId: 2,
				invitationId: "invitation_1",
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});
});

describe("removeCollaborator", () => {
	it("removes the membership and leaves the wishlist untouched", async () => {
		const db = makeDb(
			makeState({
				users: [OWNER, { id: 2, name: "Marco", email: "marco@example.com" }],
				members: [
					{
						id: "member_1",
						wishlistId: "wl_1",
						userId: 2,
						createdAt: new Date(),
					},
				],
			}),
		);

		await removeCollaborator(db, {
			wishlistId: "wl_1",
			ownerId: 1,
			memberId: "member_1",
		});

		expect(db.state.members).toHaveLength(0);
		expect(db.state.wishlists).toHaveLength(1);
	});

	it("throws NOT_FOUND for a member id from a different wishlist", async () => {
		const db = makeDb(
			makeState({
				members: [
					{
						id: "member_1",
						wishlistId: "wl_other",
						userId: 2,
						createdAt: new Date(),
					},
				],
			}),
		);

		await expect(
			removeCollaborator(db, {
				wishlistId: "wl_1",
				ownerId: 1,
				memberId: "member_1",
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});
});

describe("revokeInvitation", () => {
	it("deletes the pending invitation", async () => {
		const db = makeDb(
			makeState({
				invitations: [
					{
						id: "invitation_1",
						wishlistId: "wl_1",
						email: "future@example.com",
						tokenHash: "hash",
						invitedById: 1,
						expiresAt: new Date(Date.now() + 1000),
						lastSentAt: null,
						createdAt: new Date(),
					},
				],
			}),
		);

		await revokeInvitation(db, {
			wishlistId: "wl_1",
			ownerId: 1,
			invitationId: "invitation_1",
		});

		expect(db.state.invitations).toHaveLength(0);
	});
});

describe("resendInvitation", () => {
	it("rotates the token and updates lastSentAt", async () => {
		const past = new Date(Date.now() - 5 * 60_000);
		const db = makeDb(
			makeState({
				invitations: [
					{
						id: "invitation_1",
						wishlistId: "wl_1",
						email: "future@example.com",
						tokenHash: "old-hash",
						invitedById: 1,
						expiresAt: new Date(Date.now() + 1000),
						lastSentAt: past,
						createdAt: new Date(),
					},
				],
			}),
		);

		const result = await resendInvitation(db, {
			wishlistId: "wl_1",
			ownerId: 1,
			invitationId: "invitation_1",
		});

		expect(result.email).toBe("future@example.com");
		expect(db.state.invitations[0]?.tokenHash).not.toBe("old-hash");
		expect(db.state.invitations[0]?.lastSentAt?.getTime()).toBeGreaterThan(
			past.getTime(),
		);
	});

	it("throttles a resend within the cooldown window", async () => {
		const db = makeDb(
			makeState({
				invitations: [
					{
						id: "invitation_1",
						wishlistId: "wl_1",
						email: "future@example.com",
						tokenHash: "old-hash",
						invitedById: 1,
						expiresAt: new Date(Date.now() + 1000),
						lastSentAt: new Date(),
						createdAt: new Date(),
					},
				],
			}),
		);

		await expect(
			resendInvitation(db, {
				wishlistId: "wl_1",
				ownerId: 1,
				invitationId: "invitation_1",
			}),
		).rejects.toMatchObject({ code: "TOO_MANY_REQUESTS" });
	});
});
