import type { PublicGiftViewModel } from "@/server/mappers/view-models";
import { GiftCard } from "./gift-card";

type Props = {
	gifts: PublicGiftViewModel[];
	giftCardStyle?: "card" | "row" | "minimal";
	actionsEnabled?: boolean;
};

export function GiftList({
	gifts,
	giftCardStyle = "row",
	actionsEnabled = false,
}: Props) {
	if (gifts.length === 0) return null;

	return (
		<div className="flex flex-col gap-4">
			{gifts.map((gift) => (
				<GiftCard
					actionsEnabled={actionsEnabled}
					cardStyle={giftCardStyle}
					gift={gift}
					key={gift.id}
				/>
			))}
		</div>
	);
}
