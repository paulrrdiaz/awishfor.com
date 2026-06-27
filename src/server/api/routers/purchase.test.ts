import { beforeEach, describe, expect, it, vi } from "vitest";
import { purchaseRouter } from "@/server/api/routers/purchase";
import { createCallerFactory } from "@/server/api/trpc";

const authMock = vi.hoisted(() => vi.fn());
const listOwnerGiftPurchasesMock = vi.hoisted(() => vi.fn());
const createOwnerManualPurchaseMock = vi.hoisted(() => vi.fn());
const deleteOwnerPurchaseMock = vi.hoisted(() => vi.fn());

vi.mock("@/server/db", () => ({ db: {} }));

vi.mock("@clerk/nextjs/server", () => ({
	auth: authMock,
}));

vi.mock("@/server/services/purchase.service", () => ({
	listOwnerGiftPurchases: listOwnerGiftPurchasesMock,
	createOwnerManualPurchase: createOwnerManualPurchaseMock,
	deleteOwnerPurchase: deleteOwnerPurchaseMock,
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
