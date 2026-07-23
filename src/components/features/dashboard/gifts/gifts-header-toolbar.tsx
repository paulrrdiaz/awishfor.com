"use client";

import { Link2, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GiftSheet } from "./gift-sheet";

type Props = {
	wishlistId: string;
	totalGifts: number;
	sortable: boolean;
};

export function GiftsHeaderToolbar({
	wishlistId,
	totalGifts,
	sortable,
}: Props) {
	const [addOpen, setAddOpen] = useState(false);

	return (
		<div className="flex flex-wrap items-start justify-between gap-4">
			<div>
				<div className="font-semibold text-base">
					Regalos{" "}
					<span className="font-medium text-muted-foreground">
						· {totalGifts}
					</span>
				</div>
				{sortable && (
					<p className="mt-0.5 text-muted-foreground text-xs">
						Arrastra las filas para cambiar el orden en tu página pública.
					</p>
				)}
			</div>
			<div className="flex gap-2">
				<Button
					onClick={() => setAddOpen(true)}
					type="button"
					variant="outline"
				>
					<Link2 /> Importar desde enlace
				</Button>
				<Button onClick={() => setAddOpen(true)} type="button">
					<Plus /> Agregar regalo
				</Button>
			</div>
			<GiftSheet
				gift={null}
				onOpenChange={setAddOpen}
				open={addOpen}
				wishlistId={wishlistId}
			/>
		</div>
	);
}
