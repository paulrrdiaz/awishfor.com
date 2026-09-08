import { Progress } from "@/components/ui/progress";

export type HomeSummary = {
	activeWishlists: number;
	totalUnits: number;
	purchasedUnits: number;
	pendingRsvps: number;
};

type Props = {
	summary: HomeSummary;
};

export function HomeSummaryCard({ summary }: Props) {
	return (
		<div className="overflow-hidden rounded-2xl border border-border bg-card">
			<div className="px-4.5 pt-3.5 pb-2.5">
				<p className="font-mono text-[10.5px] text-muted-foreground uppercase tracking-[0.16em]">
					Resumen
				</p>
			</div>

			<div className="flex items-center justify-between gap-3 border-border border-t px-4.5 py-3">
				<span className="text-muted-foreground text-sm">Wishlists activas</span>
				<span className="font-heading font-semibold text-xl">
					{summary.activeWishlists}
				</span>
			</div>

			<div className="border-border border-t px-4.5 py-3">
				<div className="flex items-baseline justify-between gap-3">
					<span className="text-muted-foreground text-sm">
						Regalos reservados
					</span>
					<span className="font-heading font-semibold text-xl">
						{summary.purchasedUnits}
						<span className="ml-1 font-normal text-muted-foreground text-sm">
							de {summary.totalUnits}
						</span>
					</span>
				</div>
				<Progress
					className="mt-2 h-1.5"
					indicatorClassName="bg-[#C3E63E]"
					max={summary.totalUnits || 1}
					value={summary.purchasedUnits}
				/>
			</div>

			<div className="flex items-center justify-between gap-3 border-border border-t px-4.5 py-3">
				<span className="text-muted-foreground text-sm">
					Respuestas pendientes
				</span>
				<span className="font-heading font-semibold text-xl">
					{summary.pendingRsvps}
				</span>
			</div>
		</div>
	);
}
