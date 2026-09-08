import { Skeleton } from "@/components/ui/skeleton";
import { PreparationRibbon, RibbonNode } from "./preparation-ribbon";

export function HomeSkeleton() {
	return (
		<div data-testid="home-skeleton">
			<div className="flex flex-wrap items-end justify-between gap-3">
				<div>
					<Skeleton className="h-7 w-56" />
					<Skeleton className="mt-2 h-4 w-72" />
				</div>
				<Skeleton className="h-9 w-full rounded-full md:w-40" />
			</div>

			<div className="mt-6 grid grid-cols-1 gap-6 md:mt-7 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] md:gap-8">
				<PreparationRibbon>
					<RibbonNode label="Tu siguiente paso" tone="pending">
						<div className="rounded-2xl border border-border bg-card p-5 md:p-6">
							<Skeleton className="h-4 w-40" />
							<Skeleton className="mt-4 h-7 w-3/4" />
							<Skeleton className="mt-2 h-4 w-11/12" />
							<Skeleton className="mt-5 h-[7px] w-full rounded-full" />
							<div className="mt-5 flex flex-col gap-3 md:flex-row">
								<Skeleton className="h-9 w-full rounded-full md:w-44" />
								<Skeleton className="h-9 w-full rounded-full md:w-32" />
							</div>
						</div>
					</RibbonNode>
					<RibbonNode label="Después" tone="pending">
						<div className="flex flex-col gap-2">
							{[0, 1].map((index) => (
								<div
									className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
									key={index}
								>
									<Skeleton className="size-9 shrink-0 rounded-[10px]" />
									<div className="min-w-0 flex-1">
										<Skeleton className="h-4 w-2/3" />
										<Skeleton className="mt-1.5 h-3 w-1/2" />
									</div>
								</div>
							))}
						</div>
					</RibbonNode>
				</PreparationRibbon>

				<div className="overflow-hidden rounded-2xl border border-border bg-card">
					<div className="px-4.5 pt-3.5 pb-2.5">
						<Skeleton className="h-3 w-16" />
					</div>
					{[0, 1, 2].map((index) => (
						<div
							className="flex items-center justify-between gap-3 border-border border-t px-4.5 py-3"
							key={index}
						>
							<Skeleton className="h-4 w-28" />
							<Skeleton className="h-5 w-8" />
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
