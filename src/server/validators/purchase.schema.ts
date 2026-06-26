import { z } from "zod";
import { giftIdSchema } from "@/server/validators/gift.schema";

export const PURCHASE_GUEST_NAME_MAX_LENGTH = 120;
export const PURCHASE_MESSAGE_MAX_LENGTH = 1_000;

export const purchaseGuestNameSchema = z
	.string()
	.trim()
	.min(1, "Guest name is required")
	.max(
		PURCHASE_GUEST_NAME_MAX_LENGTH,
		`Guest name must be at most ${PURCHASE_GUEST_NAME_MAX_LENGTH} characters`,
	);

export const purchaseQuantitySchema = z
	.number()
	.int("Purchase quantity must be a whole number")
	.min(1, "Purchase quantity must be at least 1");

export const createPurchaseSchema = z.object({
	giftId: giftIdSchema,
	guestName: purchaseGuestNameSchema,
	guestEmail: z.email("Guest email must be a valid email address").optional(),
	guestPhone: z
		.string()
		.trim()
		.max(30, "Guest phone must be at most 30 characters")
		.optional(),
	message: z
		.string()
		.trim()
		.max(
			PURCHASE_MESSAGE_MAX_LENGTH,
			`Message must be at most ${PURCHASE_MESSAGE_MAX_LENGTH} characters`,
		)
		.optional(),
	quantity: purchaseQuantitySchema.default(1),
});

export const undoPurchaseSchema = z.object({
	purchaseId: z.string().min(1, "Purchase id is required"),
	undoToken: z.string().min(1, "Undo token is required"),
});

export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>;
export type UndoPurchaseInput = z.infer<typeof undoPurchaseSchema>;
