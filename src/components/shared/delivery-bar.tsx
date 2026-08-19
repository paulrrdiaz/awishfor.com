import { CopyButton } from "@/components/shared/copy-button";
import type { ComposedDelivery } from "@/lib/format/delivery";
import { cn } from "@/lib/utils";

type Props = {
	delivery: ComposedDelivery;
	className?: string;
	/** Width/padding of the inner content — match the gift section's own content wrapper. */
	contentClassName?: string;
};

/** Full-width bar presenting the composed delivery line after the gift list. */
export function DeliveryBar({ delivery, className, contentClassName }: Props) {
	return (
		<section className={cn("border-border border-t bg-card", className)}>
			<div
				className={cn(
					"mx-auto flex w-full max-w-4xl flex-wrap items-center gap-4 px-6 py-5",
					contentClassName,
				)}
			>
				<span
					aria-hidden="true"
					className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-lg"
				>
					📦
				</span>
				<div className="min-w-0 flex-1">
					<p className="font-mono text-[9px] text-muted-foreground uppercase tracking-[0.16em]">
						Envíos a domicilio
					</p>
					<p className="mt-1 font-semibold text-sm">{delivery.line}</p>
				</div>
				<CopyButton treatment="button" value={delivery.line} />
			</div>
		</section>
	);
}
