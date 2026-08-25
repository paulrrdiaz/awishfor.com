"use client";

import { useQueryState } from "nuqs";
import { guestsSearchParams } from "@/app/(protected)/dashboard/wishlists/[id]/guests/search-params";
import type {
	DashboardInviteFilter,
	DashboardInviteFilterCounts,
} from "@/lib/dashboard/guest-filters";
import { cn } from "@/lib/utils";

const FILTERS: { value: DashboardInviteFilter; label: string }[] = [
	{ value: "all", label: "Todos" },
	{ value: "pending", label: "Pendientes" },
	{ value: "confirmed", label: "Confirmados" },
	{ value: "declined", label: "No asistirán" },
];

type Props = {
	counts: DashboardInviteFilterCounts;
};

export function GuestStatusFilterChips({ counts }: Props) {
	const [status, setStatus] = useQueryState(
		"status",
		guestsSearchParams.status,
	);

	return (
		<fieldset className="flex flex-wrap gap-1.5">
			<legend className="sr-only">Filtrar por estado de confirmación</legend>
			{FILTERS.map((option) => {
				const isActive = status === option.value;
				return (
					<button
						aria-pressed={isActive}
						className={cn(
							"rounded-full px-3.5 py-1.5 font-medium text-xs transition-colors",
							isActive
								? "bg-foreground text-background"
								: "border border-border bg-card text-foreground hover:bg-muted",
						)}
						key={option.value}
						onClick={() =>
							void setStatus(option.value === "all" ? null : option.value)
						}
						type="button"
					>
						{option.label} · {counts[option.value]}
					</button>
				);
			})}
		</fieldset>
	);
}
