import { beforeEach, describe, expect, it, vi } from "vitest";
import { collaborationRouter } from "@/server/api/routers/collaboration";
import { createCallerFactory } from "@/server/api/trpc";

const authMock = vi.hoisted(() => vi.fn());
const currentUserMock = vi.hoisted(() => vi.fn());
vi.mock("@clerk/nextjs/server", () => ({
	auth: authMock,
	currentUser: currentUserMock,
}));

const afterCallbacks = vi.hoisted(() => [] as Array<() => unknown>);
vi.mock("next/server", () => ({
	after: (cb: () => unknown) => {
		afterCallbacks.push(cb);
	},
}));

const sendWishlistInvitationEmailMock = vi.hoisted(() => vi.fn());
vi.mock("@/server/services/wishlist-invitation-email.service", () => ({
	sendWishlistInvitationEmail: sendWishlistInvitationEmailMock,
}));

const shareWishlistMock = vi.hoisted(() => vi.fn());
const resendInvitationMock = vi.hoisted(() => vi.fn());
vi.mock(
	"@/server/services/wishlist-sharing.service",
	async (importOriginal) => {
		const actual =
			await importOriginal<
				typeof import("@/server/services/wishlist-sharing.service")
			>();
		return {
			...actual,
			shareWishlist: shareWishlistMock,
			resendInvitation: resendInvitationMock,
		};
	},
);

const createCaller = createCallerFactory(collaborationRouter);

function makeCaller() {
	return createCaller({
		db: { user: { findUnique: vi.fn().mockResolvedValue({ id: 42 }) } },
		headers: new Headers(),
	} as never);
}

async function flushAfterCallbacks() {
	// Mirrors Next.js: an after() callback's rejection never propagates to the
	// request/response cycle, so failures here are swallowed just like in prod.
	const callbacks = afterCallbacks.splice(0, afterCallbacks.length);
	await Promise.all(
		callbacks.map((cb) =>
			Promise.resolve()
				.then(cb)
				.catch(() => {}),
		),
	);
}

beforeEach(() => {
	vi.clearAllMocks();
	afterCallbacks.length = 0;
	authMock.mockResolvedValue({ userId: "clerk_123" });
});

describe("collaborationRouter.share", () => {
	it("sends the existing-account email variant and returns identical wording", async () => {
		shareWishlistMock.mockResolvedValue({
			status: "granted_existing",
			email: "marco@example.com",
			recipientName: "Marco Pérez",
			wishlistTitle: "Boda de Ana",
			inviterName: "Ana Torres",
		});
		const caller = makeCaller();

		const result = await caller.share({
			wishlistId: "wl_1",
			email: "marco@example.com",
		});
		await flushAfterCallbacks();

		expect(result).toEqual({ ok: true });
		expect(sendWishlistInvitationEmailMock).toHaveBeenCalledWith(
			expect.objectContaining({
				to: "marco@example.com",
				variant: "existing_account",
				ctaUrl: expect.stringContaining("/dashboard/wishlists/wl_1/gifts"),
			}),
		);
	});

	it("sends the new-account email variant with an invitation link", async () => {
		shareWishlistMock.mockResolvedValue({
			status: "granted_pending",
			email: "future@example.com",
			token: "raw-token",
			wishlistTitle: "Boda de Ana",
			inviterName: "Ana Torres",
		});
		const caller = makeCaller();

		const result = await caller.share({
			wishlistId: "wl_1",
			email: "future@example.com",
		});
		await flushAfterCallbacks();

		expect(result).toEqual({ ok: true });
		expect(sendWishlistInvitationEmailMock).toHaveBeenCalledWith(
			expect.objectContaining({
				to: "future@example.com",
				variant: "new_account",
				ctaUrl: expect.stringContaining("/invitations/raw-token"),
			}),
		);
	});

	it("reports success with identical wording even when already a member, and sends no email", async () => {
		shareWishlistMock.mockResolvedValue({ status: "already_member" });
		const caller = makeCaller();

		const result = await caller.share({
			wishlistId: "wl_1",
			email: "marco@example.com",
		});
		await flushAfterCallbacks();

		expect(result).toEqual({ ok: true });
		expect(sendWishlistInvitationEmailMock).not.toHaveBeenCalled();
	});

	it("still reports success when the email send fails", async () => {
		shareWishlistMock.mockResolvedValue({
			status: "granted_pending",
			email: "future@example.com",
			token: "raw-token",
			wishlistTitle: "Boda de Ana",
			inviterName: "Ana Torres",
		});
		sendWishlistInvitationEmailMock.mockRejectedValueOnce(
			new Error("delivery failed"),
		);
		const caller = makeCaller();

		const result = await caller.share({
			wishlistId: "wl_1",
			email: "future@example.com",
		});
		await flushAfterCallbacks();

		expect(result).toEqual({ ok: true });
	});
});

describe("collaborationRouter.resendInvitation", () => {
	it("sends a fresh invitation email with the rotated token", async () => {
		resendInvitationMock.mockResolvedValue({
			email: "future@example.com",
			token: "new-token",
			wishlistTitle: "Boda de Ana",
			inviterName: "Ana Torres",
		});
		const caller = makeCaller();

		await caller.resendInvitation({
			wishlistId: "wl_1",
			invitationId: "invitation_1",
		});
		await flushAfterCallbacks();

		expect(sendWishlistInvitationEmailMock).toHaveBeenCalledWith(
			expect.objectContaining({
				to: "future@example.com",
				variant: "new_account",
				ctaUrl: expect.stringContaining("/invitations/new-token"),
			}),
		);
	});
});
