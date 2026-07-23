"use client";

import { Users } from "lucide-react";
import { useState } from "react";
import { GuestSheet } from "@/components/features/dashboard/guests/guest-sheet";
import { Button } from "@/components/ui/button";

type Props = {
	wishlistId: string;
};

export function GuestsEmptyState({ wishlistId }: Props) {
	const [open, setOpen] = useState(false);

	return (
		<div className="flex flex-col items-center gap-4 rounded-2xl border border-border border-dashed bg-card px-6 py-16 text-center">
			<div className="flex size-14 items-center justify-center rounded-full bg-secondary">
				<Users className="size-6 text-secondary-foreground" />
			</div>
			<div>
				<h2 className="font-heading text-xl">Aún no has agregado invitados</h2>
				<p className="mt-2 max-w-sm text-muted-foreground text-sm">
					Crea un invitado para darle un enlace personalizado y llevar el
					registro de confirmaciones.
				</p>
			</div>
			<Button onClick={() => setOpen(true)} type="button">
				＋ Agregar invitado
			</Button>
			<GuestSheet
				invite={null}
				onOpenChange={setOpen}
				open={open}
				wishlistId={wishlistId}
			/>
		</div>
	);
}
