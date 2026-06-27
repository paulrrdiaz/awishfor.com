import { beforeEach, describe, expect, it, vi } from "vitest";
import { purchaseRouter } from "@/server/api/routers/purchase";
import { createCallerFactory } from "@/server/api/trpc";

const authMock = vi.hoisted(() => vi.fn());
const listOwnerGiftPurchasesMock = vi.hoisted(() => vi.fn());
const createOwnerManualPurchaseMock = vi.hoisted(() => vi.fn());
const deleteOwnerPurchaseMock = vi.hoisted(() => vi.fn());
const markGiftPurchasedPublicMock = vi.hoisted(() => vi.fn());
const undoPurchaseMock = vi.hoisted(() => vi.fn());

vi.mock("@/server/db", () => ({ db: {} }));

vi.mock("@clerk/nextjs/server", () => ({
	auth: authMock,
}));

vi.mock("@/server/services/purchase.service", () => ({
	listOwnerGiftPurchases: listOwnerGiftPurchasesMock,
	createOwnerManualPurchase: createOwnerManualPurchaseMock,
	deleteOwnerPurchase: deleteOwnerPurchaseMock,
	markGiftPurchasedPublic: markGiftPurchasedPublicMock,
	undoPurchase: undoPurchaseMock,
	getRemainingQuantity: vi.fn(),
}));

vi.mock("@/server/mappers/owner-purchase.mapper", () => ({
	mapOwnerPurchaseRecord: (p: { id: string }) => ({ ...p, mapped: true }),
}));

const createCaller = createCallerFactory(purchaseRouter);

const makeDb = (userId: number | null = 1) => ({
	db: {
		user: {
			findUnique: vi
				.fn()
				.mockResolvedValue(userId !== null ? { id: userId } : null),
		},
	},
	headers: new Headers(),
});

describe("purchaseRouter — unauthenticated rejection", () => {
	beforeEach(() => vi.clearAllMocks());

	it("rejects listForGift when not signed in", async () => {
		authMock.mockResolvedValue({ userId: null });
		const caller = createCaller(makeDb() as never);
		await expect(
			caller.listForGift({ giftId: "gift_1" }),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});

	it("rejects createManual when not signed in", async () => {
		authMock.mockResolvedValue({ userId: null });
		const caller = createCaller(makeDb() as never);
		await expect(
			caller.createManual({ giftId: "gift_1", quantity: 1 }),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});

	it("rejects delete when not signed in", async () => {
		authMock.mockResolvedValue({ userId: null });
		const caller = createCaller(makeDb() as never);
		await expect(
			caller.delete({ purchaseId: "purchase_1" }),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});
});

describe("purchaseRouter — undoRecentPurchase (public)", () => {
	beforeEach(() => vi.clearAllMocks());

	it("calls undoPurchase and returns { ok: true } on valid token", async () => {
		undoPurchaseMock.mockResolvedValue({});
		const caller = createCaller(makeDb() as never);

		const result = await caller.undoRecentPurchase({
			purchaseId: "purchase_1",
			undoToken: "raw-token",
		});

		expect(undoPurchaseMock).toHaveBeenCalledWith(expect.anything(), {
			purchaseId: "purchase_1",
			undoToken: "raw-token",
		});
		expect(result).toEqual({ ok: true });
	});

	it("propagates TRPC error when undoPurchase rejects", async () => {
		undoPurchaseMock.mockRejectedValue(
			Object.assign(new Error("Undo token has expired"), {
				code: "BAD_REQUEST",
			}),
		);
		const caller = createCaller(makeDb() as never);

		await expect(
			caller.undoRecentPurchase({
				purchaseId: "purchase_1",
				undoToken: "expired-token",
			}),
		).rejects.toThrow("Undo token has expired");

		expect(undoPurchaseMock).toHaveBeenCalledTimes(1);
	});
});

describe("purchaseRouter — owner authorization", () => {
	beforeEach(() => vi.clearAllMocks());

	it("resolves local owner before calling service for listForGift", async () => {
		authMock.mockResolvedValue({ userId: "clerk_123" });
		listOwnerGiftPurchasesMock.mockResolvedValue([]);
		const db = makeDb(42);
		const caller = createCaller(db as never);

		await caller.listForGift({ giftId: "gift_1" });

		expect(db.db.user.findUnique).toHaveBeenCalledWith({
			where: { clerkId: "clerk_123" },
			select: { id: true },
		});
		expect(listOwnerGiftPurchasesMock).toHaveBeenCalledWith(expect.anything(), {
			ownerId: 42,
			giftId: "gift_1",
		});
	});

	it("rejects when clerk user has no local owner for createManual", async () => {
		authMock.mockResolvedValue({ userId: "clerk_missing" });
		const db = makeDb(null);
		const caller = createCaller(db as never);

		await expect(
			caller.createManual({ giftId: "gift_1", quantity: 1 }),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });

		expect(createOwnerManualPurchaseMock).not.toHaveBeenCalled();
	});

	it("resolves local owner before calling service for delete", async () => {
		authMock.mockResolvedValue({ userId: "clerk_123" });
		deleteOwnerPurchaseMock.mockResolvedValue({});
		const db = makeDb(42);
		const caller = createCaller(db as never);

		await caller.delete({ purchaseId: "purchase_1" });

		expect(deleteOwnerPurchaseMock).toHaveBeenCalledWith(expect.anything(), {
			ownerId: 42,
			purchaseId: "purchase_1",
		});
	});
});
