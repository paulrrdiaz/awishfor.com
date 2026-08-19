import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import type { WishlistMemberInvitation } from "@/generated/prisma/client";
import { Prisma } from "@/generated/prisma/client";
import {
	type ClaimDatabase,
	claimInvitationByToken,
	claimInvitationsForVerifiedEmail,
	getInvitationPreview,
	type InvitationPreviewDatabase,
} from "@/server/services/invitation-claim.service";

const hashToken = (raw: string) =>
	createHash("sha256").update(raw).digest("hex");

const RAW_TOKEN = "raw-token-value";

const makeInvitation = (
	overrides: Partial<WishlistMemberInvitation> = {},
): WishlistMemberInvitation => ({
	id: "invitation_1",
	wishlistId: "wl_1",
	email: "future@example.com",
	tokenHash: hashToken(RAW_TOKEN),
	invitedById: 1,
	expiresAt: new Date(Date.now() + 60_000),
	lastSentAt: null,
	createdAt: new Date(),
	...overrides,
});

type ClaimState = {
	invitations: WishlistMemberInvitation[];
	members: Array<{
		wishlistId: string;
		userId: number;
		invitedById: number | null;
	}>;
};

const makeClaimDb = (
	state: ClaimState,
): ClaimDatabase & { state: ClaimState } => ({
	state,
	wishlistMemberInvitation: {
		findFirst: async (args) => {
			const where = args.where as { tokenHash?: string; email?: string };
			return (
				state.invitations.find(
					(invitation) =>
						(where.tokenHash === undefined ||
							invitation.tokenHash === where.tokenHash) &&
						(where.email === undefined || invitation.email === where.email),
				) ?? null
			);
		},
		findMany: async (args) => {
			const where = args.where as { email?: string };
			return state.invitations.filter(
				(invitation) =>
					where.email === undefined || invitation.email === where.email,
			);
		},
		delete: async (args) => {
			const where = args.where as { id: string };
			const index = state.invitations.findIndex((i) => i.id === where.id);
			if (index === -1) {
				throw new Prisma.PrismaClientKnownRequestError("Not found", {
					code: "P2025",
					clientVersion: "test",
				});
			}
			const [removed] = state.invitations.splice(index, 1);
			return removed as WishlistMemberInvitation;
		},
	},
	wishlistMember: {
		create: async (args) => {
			const data = args.data as {
				wishlist: { connect: { id: string } };
				user: { connect: { id: number } };
				invitedBy?: { connect: { id: number } };
			};
			const wishlistId = data.wishlist.connect.id;
			const userId = data.user.connect.id;
			if (
				state.members.some(
					(m) => m.wishlistId === wishlistId && m.userId === userId,
				)
			) {
				throw new Prisma.PrismaClientKnownRequestError("Unique constraint", {
					code: "P2002",
					clientVersion: "test",
				});
			}
			state.members.push({
				wishlistId,
				userId,
				invitedById: data.invitedBy?.connect.id ?? null,
			});
			return {};
		},
	},
});

describe("claimInvitationByToken", () => {
	it("creates membership and deletes the invitation on a valid token", async () => {
		const state: ClaimState = { invitations: [makeInvitation()], members: [] };
		const db = makeClaimDb(state);

		const result = await claimInvitationByToken(db, {
			token: RAW_TOKEN,
			localUserId: 42,
		});

		expect(result).toEqual({ status: "claimed", wishlistId: "wl_1" });
		expect(state.members).toEqual([
			{ wishlistId: "wl_1", userId: 42, invitedById: 1 },
		]);
		expect(state.invitations).toHaveLength(0);
	});

	it("returns not_found for an unknown token", async () => {
		const state: ClaimState = { invitations: [], members: [] };
		const db = makeClaimDb(state);

		const result = await claimInvitationByToken(db, {
			token: "wrong-token",
			localUserId: 42,
		});

		expect(result).toEqual({ status: "not_found" });
	});

	it("returns expired for a token past its expiry", async () => {
		const state: ClaimState = {
			invitations: [makeInvitation({ expiresAt: new Date(Date.now() - 1000) })],
			members: [],
		};
		const db = makeClaimDb(state);

		const result = await claimInvitationByToken(db, {
			token: RAW_TOKEN,
			localUserId: 42,
		});

		expect(result).toEqual({ status: "expired" });
		expect(state.invitations).toHaveLength(1);
	});

	it("is idempotent when the account was already claimed concurrently", async () => {
		const state: ClaimState = {
			invitations: [makeInvitation()],
			members: [{ wishlistId: "wl_1", userId: 42, invitedById: 1 }],
		};
		const db = makeClaimDb(state);

		const result = await claimInvitationByToken(db, {
			token: RAW_TOKEN,
			localUserId: 42,
		});

		expect(result).toEqual({ status: "claimed", wishlistId: "wl_1" });
		expect(state.members).toHaveLength(1);
	});
});

describe("claimInvitationsForVerifiedEmail", () => {
	it("claims every pending invitation matching the verified address", async () => {
		const state: ClaimState = {
			invitations: [
				makeInvitation({ id: "inv_1", wishlistId: "wl_1" }),
				makeInvitation({
					id: "inv_2",
					wishlistId: "wl_2",
					tokenHash: hashToken("other-token"),
				}),
			],
			members: [],
		};
		const db = makeClaimDb(state);

		await claimInvitationsForVerifiedEmail(db, {
			email: " Future@Example.com ",
			localUserId: 42,
		});

		expect(state.members).toHaveLength(2);
		expect(state.invitations).toHaveLength(0);
	});

	it("skips expired invitations without claiming or deleting them", async () => {
		const state: ClaimState = {
			invitations: [makeInvitation({ expiresAt: new Date(Date.now() - 1000) })],
			members: [],
		};
		const db = makeClaimDb(state);

		await claimInvitationsForVerifiedEmail(db, {
			email: "future@example.com",
			localUserId: 42,
		});

		expect(state.members).toHaveLength(0);
		expect(state.invitations).toHaveLength(1);
	});

	it("does nothing when no invitations match the address", async () => {
		const state: ClaimState = { invitations: [], members: [] };
		const db = makeClaimDb(state);

		await claimInvitationsForVerifiedEmail(db, {
			email: "nobody@example.com",
			localUserId: 42,
		});

		expect(state.members).toHaveLength(0);
	});
});

type PreviewState = {
	invitation:
		| (WishlistMemberInvitation & {
				wishlist: {
					title: string;
					owner: { name: string | null; email: string };
				};
		  })
		| null;
};

const makePreviewDb = (state: PreviewState): InvitationPreviewDatabase => ({
	wishlistMemberInvitation: {
		findFirst: async () => state.invitation,
	},
});

describe("getInvitationPreview", () => {
	it("returns the wishlist title and owner name for a valid token", async () => {
		const db = makePreviewDb({
			invitation: {
				...makeInvitation(),
				wishlist: {
					title: "Boda de Ana",
					owner: { name: "Ana Torres", email: "ana@example.com" },
				},
			},
		});

		const preview = await getInvitationPreview(db, { token: RAW_TOKEN });

		expect(preview).toEqual({
			status: "found",
			wishlistTitle: "Boda de Ana",
			ownerName: "Ana Torres",
		});
	});

	it("falls back to the owner's email when they have no display name", async () => {
		const db = makePreviewDb({
			invitation: {
				...makeInvitation(),
				wishlist: {
					title: "Boda de Ana",
					owner: { name: null, email: "ana@example.com" },
				},
			},
		});

		const preview = await getInvitationPreview(db, { token: RAW_TOKEN });

		expect(preview).toMatchObject({ ownerName: "ana@example.com" });
	});

	it("returns not_found without revealing whether the wishlist exists", async () => {
		const db = makePreviewDb({ invitation: null });
		const preview = await getInvitationPreview(db, { token: "unknown" });
		expect(preview).toEqual({ status: "not_found" });
	});

	it("returns expired for a lapsed invitation", async () => {
		const db = makePreviewDb({
			invitation: {
				...makeInvitation({ expiresAt: new Date(Date.now() - 1000) }),
				wishlist: {
					title: "Boda de Ana",
					owner: { name: "Ana", email: "ana@example.com" },
				},
			},
		});

		const preview = await getInvitationPreview(db, { token: RAW_TOKEN });

		expect(preview).toEqual({ status: "expired" });
	});
});
