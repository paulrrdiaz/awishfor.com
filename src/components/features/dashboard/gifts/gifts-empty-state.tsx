"use client";

import { Gift as GiftIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GiftSheet } from "./gift-sheet";

type Props = {
	wishlistId: string;
};

export function GiftsEmptyState({ wishlistId }: Props) {
	const [open, setOpen] = useState(false);

	return (
		<div className="flex flex-col items-center gap-4 rounded-2xl border border-border border-dashed bg-card px-6 py-16 text-center">
			<div className="flex size-14 items-center justify-center rounded-full bg-secondary">
				<GiftIcon className="size-6 text-secondary-foreground" />
			</div>
			<div>
				<h2 className="font-heading text-xl">Aún no has agregado regalos</h2>
				<p className="mt-2 max-w-sm text-muted-foreground text-sm">
					Pega el enlace de cualquier tienda o agrégalos manualmente. También
					puedes empezar con una lista sugerida.
				</p>
			</div>
			<div className="flex flex-col gap-2 sm:flex-row">
				<Button onClick={() => setOpen(true)} type="button">
					＋ Agregar regalo
				</Button>
				<Button onClick={() => setOpen(true)} type="button" variant="outline">
					🔗 Importar desde enlace
				</Button>
			</div>
			<GiftSheet
				gift={null}
				onOpenChange={setOpen}
				open={open}
				wishlistId={wishlistId}
			/>
		</div>
	);
}
