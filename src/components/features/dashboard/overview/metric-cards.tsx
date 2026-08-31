import { MetricCard } from "@/components/shared/metric-card";

type Props = {
	metrics: {
		totalGifts: number;
		purchasedGifts: number;
		confirmedGuests: number;
		totalGuests: number;
		totalViews?: number;
		uniqueVisitors?: number;
		conversionRate?: number;
	};
};

function formatConversionRate(rate: number | undefined): string {
	if (rate === undefined) return "—";
	return `${(rate * 100).toFixed(1)}%`;
}

export function MetricCards({ metrics }: Props) {
	const hasViewMetrics = metrics.totalViews !== undefined;

	return (
		<div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
			<MetricCard label="Regalos" value={metrics.totalGifts} />
			<MetricCard label="Comprados" value={metrics.purchasedGifts} />
			<div className="rounded-lg border border-border bg-card p-[18px] text-card-foreground shadow-sm">
				<p className="text-muted-foreground text-xs">Confirmados</p>
				<p className="mt-1 font-heading text-[30px] leading-none">
					{metrics.confirmedGuests}
					<span className="ml-1.5 text-base text-muted-foreground">
						/ {metrics.totalGuests}
					</span>
				</p>
			</div>
			{hasViewMetrics && (
				<>
					<MetricCard label="Visitas" value={metrics.totalViews ?? 0} />
					<MetricCard
						label="Visitantes únicos"
						value={metrics.uniqueVisitors ?? 0}
					/>
					<MetricCard
						label="Tasa de compra"
						value={formatConversionRate(metrics.conversionRate)}
					/>
				</>
			)}
		</div>
	);
}
