import type { Gift, Purchase } from "@/generated/prisma/client";
import type { DashboardGiftRowViewModel } from "@/server/mappers/view-models";

type GiftWithPurchases = Gift & { purchases: Purchase[] };

function sumPurchasedQuantity(purchases: Purchase[]): number {
	return purchases.reduce((sum, p) => sum + p.quantity, 0);
}

export function mapDashboardGift(
	gift: GiftWithPurchases,
): DashboardGiftRowViewModel {
	const purchasedQuantity = sumPurchasedQuantity(gift.purchases);
	const remainingQuantity = Math.max(
		0,
		gift.quantityNeeded - purchasedQuantity,
	);

	return {
		id: gift.id,
		name: gift.name,
		productUrl: gift.productUrl,
		imageUrl: gift.imageUrl,
		storeName: gift.storeName,
		priceAmount: gift.priceAmount?.toString() ?? null,
		priceCurrency: gift.priceCurrency,
		quantityNeeded: gift.quantityNeeded,
		purchasedQuantity,
		remainingQuantity,
		priority: gift.priority,
		visibilityStatus: gift.visibilityStatus,
		publicNote: gift.publicNote,
		hasInternalNote: !!gift.internalNote,
		sortOrder: gift.sortOrder,
		categoryId: gift.categoryId,
		deletedAt: gift.deletedAt?.toISOString() ?? null,
		createdAt: gift.createdAt.toISOString(),
		updatedAt: gift.updatedAt.toISOString(),
	};
}
