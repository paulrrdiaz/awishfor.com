"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type {
	SeatingPersonViewModel,
	SeatingTableViewModel,
} from "@/server/mappers/view-models";
import { deleteBody, deleteTitle, SEATING_COPY } from "./seating-copy";

type Props = {
	table: SeatingTableViewModel | null;
	seatedPeople: SeatingPersonViewModel[];
	onClose: () => void;
	onConfirm: () => void;
};

/**
 * Only reached when somebody is seated — an empty table is deleted with no
 * dialog. Every seated person is named before the delete, never after.
 */
export function DeleteTableDialog({
	table,
	seatedPeople,
	onClose,
	onConfirm,
}: Props) {
	if (!table) return null;

	return (
		<AlertDialog onOpenChange={(next) => !next && onClose()} open>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{deleteTitle(table.label)}</AlertDialogTitle>
					<AlertDialogDescription>
						{deleteBody(seatedPeople.length)}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<ul className="flex flex-wrap gap-1.5">
					{seatedPeople.map((person) => (
						<li
							className="rounded-full border border-border px-2 py-0.5 text-xs"
							key={person.personId}
						>
							{person.isUnnamed
								? `${SEATING_COPY.chipUnnamed} · ${person.partyLabel}`
								: person.displayName}
						</li>
					))}
				</ul>
				<AlertDialogFooter>
					<AlertDialogCancel onClick={onClose}>Cancelar</AlertDialogCancel>
					<AlertDialogAction
						className="bg-seat-invalid text-white hover:bg-seat-invalid/90"
						onClick={onConfirm}
					>
						Eliminar mesa
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
