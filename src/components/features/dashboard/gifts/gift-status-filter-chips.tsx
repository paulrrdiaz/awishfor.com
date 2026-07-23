"use client";

import { useQueryState } from "nuqs";
import { giftsSearchParams } from "@/app/(protected)/dashboard/wishlists/[id]/gifts/search-params";
import type { DashboardGiftFilter } from "@/lib/dashboard/gift-filters";
import { cn } from "@/lib/utils";

const FILTERS: { value: DashboardGiftFilter; label: string }[] = [
	{ value: "todos", label: "Todos" },
	{ value: "disponibles", label: "Disponibles" },
	{ value: "comprados", label: "Comprados" },
	{ value: "infaltables", label: "★ Infaltables" },
	{ value: "ocultos", label: "Ocultos" },
];

export function GiftStatusFilterChips() {
	const [filter, setFilter] = useQueryState("filter", giftsSearchParams.filter);

	return (
		<div className="flex flex-wrap gap-1.5">
			{FILTERS.map((option) => {
				const isActive = filter === option.value;
				return (
					<button
						className={cn(
							"rounded-full px-3.5 py-1.5 font-medium text-xs transition-colors",
							isActive
								? "bg-foreground text-background"
								: "border border-border bg-card text-foreground hover:bg-muted",
						)}
						key={option.value}
						onClick={() =>
							void setFilter(option.value === "todos" ? null : option.value)
						}
						type="button"
					>
						{option.label}
					</button>
				);
			})}
		</div>
	);
}
