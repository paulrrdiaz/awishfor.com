import { describe, expect, it } from "vitest";
import {
	createOwnerManualPurchaseSchema,
	createPurchaseSchema,
	deleteOwnerPurchaseSchema,
	listGiftPurchasesSchema,
	PURCHASE_GUEST_NAME_MAX_LENGTH,
	undoPurchaseSchema,
} from "@/server/validators/purchase.schema";

const baseCreate = {
	giftId: "gift_123",
	guestName: "Jane Doe",
};

describe("purchase validation", () => {
	it("requires a guest name", () => {
		expect(() =>
			createPurchaseSchema.parse({ giftId: "gift_1", guestName: "" }),
		).toThrow("Guest name is required");

		expect(() =>
			createPurchaseSchema.parse({ giftId: "gift_1", guestName: "   " }),
		).toThrow("Guest name is required");
	});

	it("trims guest name", () => {
		const result = createPurchaseSchema.parse({
			...baseCreate,
			guestName: "  Jane Doe  ",
		});
		expect(result.guestName).toBe("Jane Doe");
	});

	it("rejects guest name exceeding max length", () => {
		expect(() =>
			createPurchaseSchema.parse({
				...baseCreate,
				guestName: "a".repeat(PURCHASE_GUEST_NAME_MAX_LENGTH + 1),
			}),
		).toThrow(
			`Guest name must be at most ${PURCHASE_GUEST_NAME_MAX_LENGTH} characters`,
		);
	});

	it("creates purchase with only required fields", () => {
		const result = createPurchaseSchema.parse(baseCreate);
		expect(result.guestName).toBe("Jane Doe");
		expect(result.guestEmail).toBeUndefined();
		expect(result.guestPhone).toBeUndefined();
		expect(result.message).toBeUndefined();
		expect(result.quantity).toBe(1);
	});

	it("rejects invalid email", () => {
		expect(() =>
			createPurchaseSchema.parse({ ...baseCreate, guestEmail: "not-an-email" }),
		).toThrow("Guest email must be a valid email address");
	});

	it("accepts valid optional contact details", () => {
		const result = createPurchaseSchema.parse({
			...baseCreate,
			guestEmail: "jane@example.com",
			guestPhone: "+1-555-000-0000",
			message: "Congratulations!",
		});
		expect(result.guestEmail).toBe("jane@example.com");
		expect(result.guestPhone).toBe("+1-555-000-0000");
		expect(result.message).toBe("Congratulations!");
	});

	it("rejects purchase quantity below 1", () => {
		expect(() =>
			createPurchaseSchema.parse({ ...baseCreate, quantity: 0 }),
		).toThrow("Purchase quantity must be at least 1");
	});

	it("applies default quantity of 1 when omitted", () => {
		const result = createPurchaseSchema.parse(baseCreate);
		expect(result.quantity).toBe(1);
	});

	it("requires purchaseId and undoToken for undo", () => {
		expect(() =>
			undoPurchaseSchema.parse({ purchaseId: "", undoToken: "token" }),
		).toThrow("Purchase id is required");

		expect(() =>
			undoPurchaseSchema.parse({
				purchaseId: "purchase_1",
				undoToken: "",
			}),
		).toThrow("Undo token is required");
	});
});

describe("listGiftPurchasesSchema", () => {
	it("accepts a valid giftId", () => {
		const result = listGiftPurchasesSchema.parse({ giftId: "gift_abc" });
		expect(result.giftId).toBe("gift_abc");
	});

	it("rejects an empty giftId", () => {
		expect(() => listGiftPurchasesSchema.parse({ giftId: "" })).toThrow();
	});
});

describe("createOwnerManualPurchaseSchema", () => {
	it("accepts minimal input with defaults", () => {
		const result = createOwnerManualPurchaseSchema.parse({
			giftId: "gift_1",
		});
		expect(result.giftId).toBe("gift_1");
		expect(result.guestName).toBeUndefined();
		expect(result.quantity).toBe(1);
	});

	it("accepts explicit guest name", () => {
		const result = createOwnerManualPurchaseSchema.parse({
			giftId: "gift_1",
			guestName: "Ana García",
		});
		expect(result.guestName).toBe("Ana García");
	});

	it("rejects guest name exceeding max length", () => {
		expect(() =>
			createOwnerManualPurchaseSchema.parse({
				giftId: "gift_1",
				guestName: "a".repeat(PURCHASE_GUEST_NAME_MAX_LENGTH + 1),
			}),
		).toThrow(
			`Guest name must be at most ${PURCHASE_GUEST_NAME_MAX_LENGTH} characters`,
		);
	});

	it("rejects quantity below 1", () => {
		expect(() =>
			createOwnerManualPurchaseSchema.parse({ giftId: "gift_1", quantity: 0 }),
		).toThrow("Purchase quantity must be at least 1");
	});

	it("accepts optional contact fields", () => {
		const result = createOwnerManualPurchaseSchema.parse({
			giftId: "gift_1",
			guestEmail: "owner@example.com",
			guestPhone: "+51999000000",
			message: "Una nota",
		});
		expect(result.guestEmail).toBe("owner@example.com");
		expect(result.guestPhone).toBe("+51999000000");
		expect(result.message).toBe("Una nota");
	});
});

describe("deleteOwnerPurchaseSchema", () => {
	it("accepts a valid purchaseId", () => {
		const result = deleteOwnerPurchaseSchema.parse({
			purchaseId: "purchase_1",
		});
		expect(result.purchaseId).toBe("purchase_1");
	});

	it("rejects an empty purchaseId", () => {
		expect(() => deleteOwnerPurchaseSchema.parse({ purchaseId: "" })).toThrow(
			"Purchase id is required",
		);
	});
});
