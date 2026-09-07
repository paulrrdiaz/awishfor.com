"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { CopyConfirmedGuestsButton } from "@/components/features/dashboard/guests/copy-confirmed-guests-button";
import { GuestSheet } from "@/components/features/dashboard/guests/guest-sheet";
import { Button } from "@/components/ui/button";

type Props = {
	wishlistId: string;
	totalGuests: number;
	confirmedGuests: number;
	pendingInvitations: number;
	confirmedGuestsRoster: string;
};

export function GuestsHeaderToolbar({
	wishlistId,
	totalGuests,
	confirmedGuests,
	pendingInvitations,
	confirmedGuestsRoster,
}: Props) {
	const [addOpen, setAddOpen] = useState(false);

	return (
		<div className="flex flex-wrap items-center justify-between gap-4">
			<div className="font-semibold text-base">
				Invitados{" "}
				<span className="font-medium text-muted-foreground">
					· {totalGuests} {totalGuests === 1 ? "persona" : "personas"} ·{" "}
					{confirmedGuests}{" "}
					{confirmedGuests === 1 ? "confirmada" : "confirmadas"} ·{" "}
					{pendingInvitations}{" "}
					{pendingInvitations === 1
						? "invitación pendiente"
						: "invitaciones pendientes"}
				</span>
			</div>
			<div className="flex items-center gap-2">
				<CopyConfirmedGuestsButton
					confirmedGuests={confirmedGuests}
					rosterText={confirmedGuestsRoster}
				/>
				<Button
					className="hidden md:inline-flex"
					onClick={() => setAddOpen(true)}
					type="button"
				>
					<Plus /> Agregar invitado
				</Button>
			</div>
			<GuestSheet
				invite={null}
				onOpenChange={setAddOpen}
				open={addOpen}
				wishlistId={wishlistId}
			/>
		</div>
	);
}
