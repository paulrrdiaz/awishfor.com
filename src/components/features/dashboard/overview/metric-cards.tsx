import { MetricCard } from "@/components/shared/metric-card";

type Props = {
	metrics: {
		totalGifts: number;
		availableGifts: number;
		purchasedGifts: number;
		totalUnits: number;
		purchasedUnits: number;
	};
};

export function MetricCards({ metrics }: Props) {
	const progress =
		metrics.totalUnits > 0
			? Math.round((metrics.purchasedUnits / metrics.totalUnits) * 100)
			: 0;

	return (
		<div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
			<MetricCard label="Regalos totales" value={metrics.totalGifts} />
			<MetricCard label="Disponibles" value={metrics.availableGifts} />
			<MetricCard label="Comprados" value={metrics.purchasedGifts} />
			<div className="rounded-lg border border-border bg-card p-[18px] text-card-foreground shadow-sm">
				<p className="text-muted-foreground text-xs">Progreso de compras</p>
				<p className="mt-1 font-heading text-[30px] leading-none">
					{progress}%
				</p>
				<div className="mt-4 h-1.5 overflow-hidden rounded-full bg-border">
					<div
						className="h-full rounded-full bg-primary transition-[width]"
						style={{ width: `${progress}%` }}
					/>
				</div>
				<p className="mt-3 text-muted-foreground text-xs">
					{metrics.purchasedUnits}/{metrics.totalUnits} unidades compradas
				</p>
			</div>
		</div>
	);
}
