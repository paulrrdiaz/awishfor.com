import type { MotifPreset, MotifTreatment } from "@/config/motifs";
import type { PublicGiftViewModel } from "@/server/mappers/view-models";
import { GiftCard, type GiftCardStyle } from "./gift-card";

type Props = {
	gifts: PublicGiftViewModel[];
	giftCardStyle?: GiftCardStyle;
	actionsEnabled?: boolean;
	onGiftAction?: (gift: PublicGiftViewModel) => void;
	motif?: MotifPreset | null;
	motifTreatment?: MotifTreatment;
};

export function GiftList({
	gifts,
	giftCardStyle = "row",
	actionsEnabled = false,
	onGiftAction,
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
					onGiftAction={onGiftAction}
				/>
			))}
		</div>
	);
}
