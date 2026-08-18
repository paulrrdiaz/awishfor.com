import type { ComposedDelivery } from "@/lib/format/delivery";
import { cn } from "@/lib/utils";

type Props = {
	delivery: ComposedDelivery;
	className?: string;
};

/**
 * Presents each available delivery detail with a quick visual cue while the
 * composed, emoji-free line remains available for clipboard use.
 */
export function DeliveryItems({ delivery, className }: Props) {
	return (
		<span className={cn("flex flex-col gap-1.5", className)}>
			{delivery.recipientName && (
				<span className="delivery-row flex items-center gap-1.5">
					<span aria-hidden="true" className="shrink-0">
						👤
					</span>
					<strong className="font-semibold not-italic">
						{delivery.recipientName}
					</strong>
				</span>
			)}
			{delivery.documentId && (
				<span className="delivery-row flex items-center gap-1.5">
					<span aria-hidden="true" className="shrink-0">
						🪪
					</span>
					<span>DNI: {delivery.documentId}</span>
				</span>
			)}
			<span className="delivery-row flex items-start gap-1.5">
				<span aria-hidden="true" className="shrink-0">
					📍
				</span>
				<span>{delivery.address}</span>
			</span>
			{delivery.phone && (
				<span className="delivery-row flex items-center gap-1.5 whitespace-nowrap">
					<span aria-hidden="true" className="shrink-0">
						📱
					</span>
					{delivery.phone}
				</span>
			)}
		</span>
	);
}
