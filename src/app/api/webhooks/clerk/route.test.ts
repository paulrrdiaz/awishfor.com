import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { verifyWebhookMock } = vi.hoisted(() => ({
	verifyWebhookMock: vi.fn(),
}));

vi.mock("@clerk/nextjs/webhooks", () => ({
	verifyWebhook: verifyWebhookMock,
}));

const { deleteManyMock, upsertMock } = vi.hoisted(() => ({
	deleteManyMock: vi.fn(),
	upsertMock: vi.fn(),
}));

vi.mock("@/server/db", () => ({
	db: {
		user: {
			deleteMany: deleteManyMock,
			upsert: upsertMock,
		},
	},
}));

const claimInvitationsForVerifiedEmailMock = vi.hoisted(() => vi.fn());
vi.mock("@/server/services/invitation-claim.service", () => ({
	claimInvitationsForVerifiedEmail: claimInvitationsForVerifiedEmailMock,
}));

beforeEach(() => {
	vi.clearAllMocks();
});

const makeRequest = () =>
	new NextRequest("http://localhost/api/webhooks/clerk", { method: "POST" });

const makeUserEvent = (
	overrides: {
		type?: "user.created" | "user.updated";
		verificationStatus?: string;
	} = {},
) => ({
	type: overrides.type ?? "user.created",
	data: {
		id: "clerk_new",
		email_addresses: [
			{
				id: "email_1",
				email_address: "new@example.com",
				verification: { status: overrides.verificationStatus ?? "verified" },
			},
		],
		primary_email_address_id: "email_1",
		first_name: "New",
		last_name: "User",
		image_url: null,
	},
});

describe("Clerk webhook: user.deleted", () => {
	it("succeeds for an account that collaborates on someone else's wishlist", async () => {
		// A collaborating account's local User row cascade-deletes its
		// WishlistMember rows at the database level (see WishlistMember.user
		// onDelete: Cascade in prisma/schema.prisma), so deleteMany here
		// resolves cleanly instead of throwing a foreign key violation.
		deleteManyMock.mockResolvedValueOnce({ count: 1 });
		verifyWebhookMock.mockResolvedValueOnce({
			type: "user.deleted",
			data: { id: "clerk_collaborator_1" },
		});

		const { POST } = await import("@/app/api/webhooks/clerk/route");
		const response = await POST(makeRequest());

		expect(response.status).toBe(200);
		expect(deleteManyMock).toHaveBeenCalledWith({
			where: { clerkId: "clerk_collaborator_1" },
		});
	});

	it("returns 500 when the delete throws", async () => {
		deleteManyMock.mockRejectedValueOnce(
			new Error("foreign key constraint violation"),
		);
		verifyWebhookMock.mockResolvedValueOnce({
			type: "user.deleted",
			data: { id: "clerk_user_2" },
		});

		const { POST } = await import("@/app/api/webhooks/clerk/route");
		const response = await POST(makeRequest());

		expect(response.status).toBe(500);
	});
});

describe("Clerk webhook: user.created", () => {
	it("sweeps pending invitations for a verified primary email", async () => {
		upsertMock.mockResolvedValueOnce({ id: 99 });
		verifyWebhookMock.mockResolvedValueOnce(makeUserEvent());

		const { POST } = await import("@/app/api/webhooks/clerk/route");
		const response = await POST(makeRequest());

		expect(response.status).toBe(200);
		expect(claimInvitationsForVerifiedEmailMock).toHaveBeenCalledWith(
			expect.anything(),
			{ email: "new@example.com", localUserId: 99 },
		);
	});

	it("does not sweep for an unverified primary email", async () => {
		upsertMock.mockResolvedValueOnce({ id: 99 });
		verifyWebhookMock.mockResolvedValueOnce(
			makeUserEvent({ verificationStatus: "unverified" }),
		);

		const { POST } = await import("@/app/api/webhooks/clerk/route");
		await POST(makeRequest());

		expect(claimInvitationsForVerifiedEmailMock).not.toHaveBeenCalled();
	});
});

describe("Clerk webhook: user.updated", () => {
	it("does not sweep invitations on profile updates", async () => {
		upsertMock.mockResolvedValueOnce({ id: 99 });
		verifyWebhookMock.mockResolvedValueOnce(
			makeUserEvent({ type: "user.updated" }),
		);

		const { POST } = await import("@/app/api/webhooks/clerk/route");
		await POST(makeRequest());

		expect(claimInvitationsForVerifiedEmailMock).not.toHaveBeenCalled();
	});
});
