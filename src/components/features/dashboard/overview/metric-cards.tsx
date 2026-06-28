import { CheckCircle2, Gift, PackageCheck, ShoppingBag } from "lucide-react";
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
		<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
			<MetricCard
				description="Regalos visibles en la lista"
				icon={<Gift className="size-5" />}
				label="Regalos totales"
				value={metrics.totalGifts}
			/>
			<MetricCard
				description="Aún tienen unidades disponibles"
				icon={<ShoppingBag className="size-5" />}
				label="Disponibles"
				value={metrics.availableGifts}
			/>
			<MetricCard
				description="Completamente comprados"
				icon={<PackageCheck className="size-5" />}
				label="Comprados"
				value={metrics.purchasedGifts}
			/>
			<div className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm">
				<div className="flex items-start justify-between gap-3">
					<div>
						<p className="text-muted-foreground text-sm">Progreso de compras</p>
						<p className="mt-1 font-heading text-2xl leading-none">
							{progress}%
						</p>
					</div>
					<CheckCircle2 className="size-5 text-primary" />
				</div>
				<div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
					<div
						className="h-full rounded-full bg-primary transition-[width]"
						style={{ width: `${progress}%` }}
					/>
				</div>
				<p className="mt-3 text-muted-foreground text-sm">
					{metrics.purchasedUnits}/{metrics.totalUnits} unidades compradas
				</p>
			</div>
		</div>
	);
}
