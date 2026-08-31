"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { WishlistViewSeriesPointViewModel } from "@/server/mappers/view-models";
import { api } from "@/trpc/react";

const WINDOW_OPTIONS = [7, 30, 90] as const;
type WindowDays = (typeof WINDOW_OPTIONS)[number];

type Props = {
	wishlistId: string;
	initialWindowDays: WindowDays;
	initialSeries: WishlistViewSeriesPointViewModel[];
};

function formatBucketDate(dateKey: string): string {
	return new Intl.DateTimeFormat("es-PE", {
		day: "numeric",
		month: "short",
		timeZone: "UTC",
	})
		.format(new Date(`${dateKey}T00:00:00Z`))
		.replace(/\./g, "");
}

export function ViewTrendPanel({
	wishlistId,
	initialWindowDays,
	initialSeries,
}: Props) {
	const [windowDays, setWindowDays] = useState<WindowDays>(initialWindowDays);
	const isInitialWindow = windowDays === initialWindowDays;
	const query = api.wishlist.overview.useQuery(
		{ wishlistId, viewWindowDays: windowDays },
		{ enabled: !isInitialWindow },
	);

	const series = isInitialWindow
		? initialSeries
		: (query.data?.viewSeries ?? []);
	const isLoading = !isInitialWindow && query.isPending;
	const hasViews = series.some((point) => point.views > 0);
	const maxViews = Math.max(1, ...series.map((point) => point.views));

	return (
		<div className="rounded-lg border border-border bg-card p-5 shadow-sm">
			<div className="flex items-center justify-between gap-3">
				<h2 className="font-semibold text-[15px]">Visitas por día</h2>
				<div className="flex gap-1.5">
					{WINDOW_OPTIONS.map((option) => (
						<button
							className={cn(
								"rounded-full px-2.5 py-1 text-xs transition-colors",
								option === windowDays
									? "bg-primary text-primary-foreground"
									: "bg-muted text-muted-foreground hover:bg-muted/70",
							)}
							key={option}
							onClick={() => setWindowDays(option)}
							type="button"
						>
							{option}d
						</button>
					))}
				</div>
			</div>

			{isLoading ? (
				<div className="mt-6 flex h-[140px] items-center justify-center text-muted-foreground text-sm">
					Cargando…
				</div>
			) : hasViews ? (
				<>
					<div className="mt-5 flex h-[140px] items-end gap-1">
						{series.map((point) => (
							<div
								className="flex-1 rounded-t bg-primary/25"
								key={point.date}
								style={{
									height: `${Math.max(4, (point.views / maxViews) * 100)}%`,
								}}
								title={`${point.date}: ${point.views}`}
							/>
						))}
					</div>
					<div className="mt-2 flex justify-between text-muted-foreground text-xs">
						<span>{formatBucketDate(series[0]?.date ?? "")}</span>
						<span>
							{formatBucketDate(series[series.length - 1]?.date ?? "")}
						</span>
					</div>
				</>
			) : (
				<div className="mt-5 rounded-lg border border-border border-dashed px-4 py-8 text-center text-muted-foreground text-sm">
					Aún no hay visitas registradas en este periodo.
				</div>
			)}
		</div>
	);
}
