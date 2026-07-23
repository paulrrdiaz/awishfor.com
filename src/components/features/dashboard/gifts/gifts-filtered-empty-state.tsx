"use client";

import { useQueryStates } from "nuqs";
import { giftsSearchParams } from "@/app/(protected)/dashboard/wishlists/[id]/gifts/search-params";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export function GiftsFilteredEmptyState() {
	const [, setParams] = useQueryStates(giftsSearchParams);

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
			description="No hay regalos que coincidan con tu búsqueda o filtro."
			title="Sin resultados"
		/>
	);
}
