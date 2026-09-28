import type { Gift, Purchase } from "@/generated/prisma/client";
import type { Currency } from "@/generated/prisma/enums";

type GiftWithPurchases = Gift & { purchases: Purchase[] };

export type ApproxGiftValue = {
	receivedAmount: string;
	goalAmount: string;
	pricedGiftCount: number;
	visibleGiftCount: number;
	foreignReceived: { currency: Currency; amount: string }[];
};

export function isVisibleAndNotDeleted(gift: Gift): boolean {
	return gift.deletedAt === null && gift.visibilityStatus !== "hidden";
}

function sumPurchasedQuantity(purchases: Purchase[]): number {
	return purchases.reduce((sum, purchase) => sum + purchase.quantity, 0);
}

function toCents(priceAmount: NonNullable<Gift["priceAmount"]>): number {
	return Math.round(Number(priceAmount.toString()) * 100);
}

function formatCents(cents: number): string {
	return (cents / 100).toFixed(2);
}

export function computeApproxGiftValue(
	gifts: GiftWithPurchases[],
	wishlistCurrency: Currency,
): ApproxGiftValue {
	let receivedCents = 0;
	let goalCents = 0;
	let pricedGiftCount = 0;
	const foreignReceivedCents = new Map<Currency, number>();
	const visibleGifts = gifts.filter(isVisibleAndNotDeleted);

	for (const gift of visibleGifts) {
		if (gift.priceAmount === null) {
			continue;
		}

		const currency = gift.priceCurrency ?? wishlistCurrency;
		const priceCents = toCents(gift.priceAmount);
		const purchasedUnits = Math.min(
			gift.quantityNeeded,
			sumPurchasedQuantity(gift.purchases),
		);

		if (currency === wishlistCurrency) {
			pricedGiftCount += 1;
			goalCents += priceCents * gift.quantityNeeded;
			receivedCents += priceCents * purchasedUnits;
			continue;
		}

		if (purchasedUnits > 0) {
			foreignReceivedCents.set(
				currency,
				(foreignReceivedCents.get(currency) ?? 0) + priceCents * purchasedUnits,
			);
		}
	}

	return {
		receivedAmount: formatCents(receivedCents),
		goalAmount: formatCents(goalCents),
		pricedGiftCount,
		visibleGiftCount: visibleGifts.length,
		foreignReceived: [...foreignReceivedCents.entries()]
			.filter(([, cents]) => cents > 0)
			.sort(([left], [right]) => left.localeCompare(right))
			.map(([currency, cents]) => ({
				currency,
				amount: formatCents(cents),
			})),
	};
}
