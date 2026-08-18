import type { MotifPreset, MotifTreatment } from "@/config/motifs";
import type { PublicGiftViewModel } from "@/server/mappers/view-models";
import { GiftCard, type GiftCardStyle } from "./gift-card";

type Props = {
	gifts: PublicGiftViewModel[];
	giftCardStyle?: GiftCardStyle;
	actionsEnabled?: boolean;
	onProductAction?: (gift: PublicGiftViewModel) => void;
	onPurchaseAction?: (gift: PublicGiftViewModel) => void;
	motif?: MotifPreset | null;
	motifTreatment?: MotifTreatment;
};

export function GiftList({
	gifts,
	giftCardStyle = "row",
	actionsEnabled = false,
	onProductAction,
	onPurchaseAction,
	motif,
	motifTreatment,
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
					motif={motif}
					motifTreatment={motifTreatment}
					onProductAction={onProductAction}
					onPurchaseAction={onPurchaseAction}
				/>
			))}
		</div>
	);
}
