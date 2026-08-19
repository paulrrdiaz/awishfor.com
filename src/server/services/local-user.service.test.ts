import { beforeEach, describe, expect, it, vi } from "vitest";

const currentUserMock = vi.hoisted(() => vi.fn());
vi.mock("@clerk/nextjs/server", () => ({
	currentUser: currentUserMock,
}));

const claimInvitationsForVerifiedEmailMock = vi.hoisted(() => vi.fn());
vi.mock("@/server/services/invitation-claim.service", () => ({
	claimInvitationsForVerifiedEmail: claimInvitationsForVerifiedEmailMock,
}));

import { getOrCreateLocalUserId } from "@/server/services/local-user.service";

const makeDb = ({
	existingUser = null as { id: number } | null,
	upsertResult = { id: 99 },
}: {
	existingUser?: { id: number } | null;
	upsertResult?: { id: number };
} = {}) => ({
	user: {
		findUnique: vi.fn().mockResolvedValue(existingUser),
		upsert: vi.fn().mockResolvedValue(upsertResult),
	},
});

describe("getOrCreateLocalUserId", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns the existing local user without upserting or sweeping", async () => {
		const db = makeDb({ existingUser: { id: 42 } });

		const id = await getOrCreateLocalUserId({
			db: db as never,
			userId: "clerk_123",
		});

		expect(id).toBe(42);
		expect(db.user.upsert).not.toHaveBeenCalled();
		expect(claimInvitationsForVerifiedEmailMock).not.toHaveBeenCalled();
	});

	it("creates the local user and sweeps invitations for a verified primary email", async () => {
		const db = makeDb({ existingUser: null, upsertResult: { id: 99 } });
		currentUserMock.mockResolvedValue({
			id: "clerk_new",
			emailAddresses: [
				{
					id: "email_1",
					emailAddress: "new@example.com",
					verification: { status: "verified" },
				},
			],
			primaryEmailAddressId: "email_1",
			firstName: "New",
			lastName: "User",
			imageUrl: "https://example.com/avatar.png",
		});

		const id = await getOrCreateLocalUserId({
			db: db as never,
			userId: "clerk_new",
		});

		expect(id).toBe(99);
		expect(claimInvitationsForVerifiedEmailMock).toHaveBeenCalledWith(
			expect.anything(),
			{ email: "new@example.com", localUserId: 99 },
		);
	});

	it("does not sweep invitations when the primary email is unverified", async () => {
		const db = makeDb({ existingUser: null, upsertResult: { id: 99 } });
		currentUserMock.mockResolvedValue({
			id: "clerk_new",
			emailAddresses: [
				{
					id: "email_1",
					emailAddress: "new@example.com",
					verification: { status: "unverified" },
				},
			],
			primaryEmailAddressId: "email_1",
			firstName: "New",
			lastName: "User",
			imageUrl: null,
		});

		await getOrCreateLocalUserId({ db: db as never, userId: "clerk_new" });

		expect(claimInvitationsForVerifiedEmailMock).not.toHaveBeenCalled();
	});

	it("rejects when the Clerk session does not match the requested user", async () => {
		const db = makeDb({ existingUser: null });
		currentUserMock.mockResolvedValue({ id: "someone_else" });

		await expect(
			getOrCreateLocalUserId({ db: db as never, userId: "clerk_new" }),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});
});
