import { CopyButton } from "@/components/shared/copy-button";
import { DeliveryItems } from "@/components/shared/delivery-items";
import type { ComposedDelivery } from "@/lib/format/delivery";
import { cn } from "@/lib/utils";

type Props = {
	delivery: ComposedDelivery | null;
	className?: string;
};

/** A practical delivery-details card that sits beside the event logistics. */
export function DeliveryCard({ delivery, className }: Props) {
	if (!delivery) {
		return null;
	}

	return (
		<section
			className={cn(
				"rounded-[14px] border border-primary/40 bg-card px-4 py-3 text-center",
				className,
			)}
		>
			<p className="font-mono text-[9px] text-muted-foreground uppercase tracking-[0.16em]">
				ENVÍO A DOMICILIO
			</p>
			<p className="mt-1 font-heading font-semibold text-[15px]">
				Si prefieres enviarlo a casa
			</p>
			<DeliveryItems
				className="mt-3 flex flex-col flex-wrap items-center gap-2 text-[13px] leading-2.5 [&>.delivery-row]:flex-none"
				delivery={delivery}
			/>
			<CopyButton className="mt-3" treatment="link" value={delivery.line} />
		</section>
	);
}
