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
		<span className={cn("inline-block", className)}>
			{delivery.recipientName && (
				<>
					<span className="delivery-row block">
						<span aria-hidden="true">👤</span>{" "}
						<strong className="font-semibold not-italic">
							{delivery.recipientName}
						</strong>
					</span>
					<br />
				</>
			)}
			<span className="delivery-row block">
				<span aria-hidden="true">📍</span> {delivery.address}
			</span>
			{delivery.phone && (
				<>
					<br />
					<span className="delivery-row block whitespace-nowrap">
						<span aria-hidden="true">📱</span> {delivery.phone}
					</span>
				</>
			)}
		</span>
	);
}
