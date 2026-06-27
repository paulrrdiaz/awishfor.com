import type { Purchase } from "@/generated/prisma/client";
import type { OwnerPurchaseRecordViewModel } from "@/server/mappers/view-models";

export function mapOwnerPurchaseRecord(
	purchase: Purchase,
): OwnerPurchaseRecordViewModel {
	return {
		id: purchase.id,
		giftId: purchase.giftId,
		guestName: purchase.guestName,
		guestEmail: purchase.guestEmail,
		guestPhone: purchase.guestPhone,
		message: purchase.message,
		quantity: purchase.quantity,
		createdAt: purchase.createdAt.toISOString(),
		updatedAt: purchase.updatedAt.toISOString(),
	};
}
