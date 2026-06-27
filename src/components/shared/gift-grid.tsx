import type { PublicGiftViewModel } from "@/server/mappers/view-models";
import { GiftCard, type GiftCardStyle } from "./gift-card";

// Static lookup — Tailwind JIT requires full class literals (no interpolation)
const COLUMN_CLASSES: Record<number, string> = {
	1: "grid-cols-1",
	2: "grid-cols-1 sm:grid-cols-2",
	3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
	4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};

type Props = {
	gifts: PublicGiftViewModel[];
	giftColumns?: number;
	giftCardStyle?: GiftCardStyle;
	actionsEnabled?: boolean;
	onGiftAction?: (gift: PublicGiftViewModel) => void;
};

export function GiftGrid({
	gifts,
	giftColumns = 3,
	giftCardStyle = "card",
	actionsEnabled = false,
	onGiftAction,
}: Props) {
	if (gifts.length === 0) return null;

	const colClass = COLUMN_CLASSES[giftColumns] ?? COLUMN_CLASSES[3];

	return (
		<div className={`grid gap-6 ${colClass}`}>
			{gifts.map((gift) => (
				<GiftCard
					actionsEnabled={actionsEnabled}
					cardStyle={giftCardStyle}
					gift={gift}
					key={gift.id}
					onGiftAction={onGiftAction}
				/>
			))}
		</div>
	);
}
