import type { ReactNode } from "react";
import { DeliveryBar } from "@/components/shared/delivery-bar";
import { GiftListBand } from "@/components/shared/gift-list-band";
import { GiftListMessage } from "@/components/shared/gift-list-message";
import type { ComposedDelivery } from "@/lib/format/delivery";

type Props = {
	children: ReactNode;
	className?: string;
	delivery?: ComposedDelivery | null;
	/** Width/padding of the delivery bar's inner content — match this layout's own content wrapper. */
	deliveryContentClassName?: string;
	giftListMessage?: string | null;
	/** Width/padding of the gift list message's inner content — match this layout's own content wrapper. */
	giftListMessageContentClassName?: string;
};

/**
 * The gift list band plus its trailing delivery presentation, composed
 * together so "delivery always renders after the gift list" is structural
 * rather than a convention every layout has to repeat. The same
 * `className` reaches both children so the delivery bar's breakout width
 * stays aligned with the band's, whichever breakout mechanic the calling
 * layout uses.
 */
export function GiftSection({
	children,
	className,
	delivery,
	deliveryContentClassName,
	giftListMessage,
	giftListMessageContentClassName,
}: Props) {
	return (
		<>
			<GiftListBand className={className}>
				<GiftListMessage
					className={giftListMessageContentClassName}
					message={giftListMessage}
				/>
				{children}
			</GiftListBand>
			{delivery && (
				<DeliveryBar
					className={className}
					contentClassName={deliveryContentClassName}
					delivery={delivery}
				/>
			)}
		</>
	);
}
