"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { GuestSheet } from "@/components/features/dashboard/guests/guest-sheet";
import { Button } from "@/components/ui/button";

type Props = {
	wishlistId: string;
	totalGuests: number;
	totalInvites: number;
};

export function GuestsHeaderToolbar({
	wishlistId,
	totalGuests,
	totalInvites,
}: Props) {
	const [addOpen, setAddOpen] = useState(false);

	return (
		<div className="flex flex-wrap items-center justify-between gap-4">
			<div className="font-semibold text-base">
				Invitados{" "}
				<span className="font-medium text-muted-foreground">
					· {totalGuests} {totalGuests === 1 ? "persona" : "personas"} ·{" "}
					{totalInvites} {totalInvites === 1 ? "invitación" : "invitaciones"}
				</span>
			</div>
			<Button onClick={() => setAddOpen(true)} type="button">
				<Plus /> Agregar invitado
			</Button>
			<GuestSheet
				invite={null}
				onOpenChange={setAddOpen}
				open={addOpen}
				wishlistId={wishlistId}
			/>
		</div>
	);
}
