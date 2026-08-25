"use client";

import { useQueryStates } from "nuqs";
import { guestsSearchParams } from "@/app/(protected)/dashboard/wishlists/[id]/guests/search-params";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export function GuestsFilteredEmptyState() {
	const [, setParams] = useQueryStates(guestsSearchParams);

	return (
		<EmptyState
			action={
				<Button
					onClick={() => void setParams(null)}
					type="button"
					variant="outline"
				>
					Quitar filtros
				</Button>
			}
			className="rounded-2xl border border-border border-dashed bg-card"
			description="No hay invitados que coincidan con tu búsqueda o filtro."
			title="Sin resultados"
		/>
	);
}
