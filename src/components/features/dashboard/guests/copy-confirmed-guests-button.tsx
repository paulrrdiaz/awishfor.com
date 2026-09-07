"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const COPIED_REVERT_MS = 1500;
const NO_CONFIRMED_DESCRIPTION_ID = "no-confirmed-guests-description";

type Props = {
	confirmedGuests: number;
	rosterText: string;
};

export function CopyConfirmedGuestsButton({
	confirmedGuests,
	rosterText,
}: Props) {
	const [copied, setCopied] = useState(false);
	const disabled = confirmedGuests === 0;

	async function copyRoster() {
		try {
			await navigator.clipboard.writeText(rosterText);
			setCopied(true);
			window.setTimeout(() => setCopied(false), COPIED_REVERT_MS);
		} catch {
			toast.error("No se pudo copiar la lista. Inténtalo de nuevo.");
		}
	}

	return (
		<>
			<Button
				aria-describedby={disabled ? NO_CONFIRMED_DESCRIPTION_ID : undefined}
				disabled={disabled}
				onClick={copyRoster}
				type="button"
				variant="outline"
			>
				{copied ? <Check /> : <Copy />}
				{copied ? "Lista copiada" : "Copiar confirmados"}
			</Button>
			{disabled && (
				<span className="sr-only" id={NO_CONFIRMED_DESCRIPTION_ID}>
					No hay personas confirmadas todavía.
				</span>
			)}
		</>
	);
}
