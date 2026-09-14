"use client";

import { Trash2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import type {
	SeatingPersonViewModel,
	SeatingTableViewModel,
} from "@/server/mappers/view-models";
import { SEATING_COPY } from "./seating-copy";

type Props = {
	table: SeatingTableViewModel | null;
	seatedPeople: SeatingPersonViewModel[];
	onClose: () => void;
	onRename: (name: string) => void;
	onEditCapacity: () => void;
	onDelete: () => void;
	onRemovePerson: (personId: string) => void;
};

/**
 * A `Sheet` at every width rather than an anchored `Popover`: the canvas
 * scrolls and zooms under the panel, so an anchored surface drifts off its
 * table. The content is the design's `TableDetailPopover`.
 */
export function TableDetailPopover({
	table,
	seatedPeople,
	onClose,
	onRename,
	onEditCapacity,
	onDelete,
	onRemovePerson,
}: Props) {
	const [name, setName] = useState(table?.name ?? "");

	useEffect(() => {
		setName(table?.name ?? "");
	}, [table]);

	if (!table) return null;

	const free = Math.max(0, table.capacity - table.seated);

	return (
		<Sheet onOpenChange={(next) => !next && onClose()} open>
			<SheetContent className="gap-0 overflow-y-auto p-4" side="right">
				<SheetHeader className="p-0">
					<SheetTitle>{table.label}</SheetTitle>
					<SheetDescription>
						<span className="font-mono">
							{table.seated}/{table.capacity}
						</span>{" "}
						·{" "}
						{free === 0
							? SEATING_COPY.tableFull
							: `${free} ${free === 1 ? "lugar libre" : "lugares libres"}`}
					</SheetDescription>
				</SheetHeader>

				<ul className="mt-4 space-y-1.5">
					{seatedPeople.length === 0 ? (
						<li className="text-muted-foreground text-xs">
							Nadie sentado todavía.
						</li>
					) : null}
					{seatedPeople.map((person) => (
						<li
							className="flex items-center justify-between gap-2 rounded-lg border border-border px-2 py-1.5 text-xs"
							key={person.personId}
						>
							<span className="min-w-0 truncate">
								{person.isUnnamed
									? SEATING_COPY.chipUnnamed
									: person.displayName}
								<span className="text-muted-foreground">
									{" "}
									· {person.partyLabel}
								</span>
							</span>
							<button
								className="shrink-0 underline underline-offset-2"
								onClick={() => onRemovePerson(person.personId)}
								type="button"
							>
								Quitar
							</button>
						</li>
					))}
				</ul>

				<div className="mt-5 space-y-2">
					<div className="flex gap-2">
						<Input
							aria-label="Nombre de la mesa"
							onChange={(event) => setName(event.target.value)}
							placeholder={table.label}
							value={name}
						/>
						<Button
							onClick={() => onRename(name)}
							type="button"
							variant="outline"
						>
							Renombrar
						</Button>
					</div>
					<Button
						className="w-full"
						onClick={onEditCapacity}
						type="button"
						variant="outline"
					>
						Capacidad · {table.capacity}
					</Button>
					<Button
						className="w-full text-seat-invalid"
						onClick={onDelete}
						type="button"
						variant="outline"
					>
						<Trash2Icon /> Eliminar mesa
					</Button>
				</div>
			</SheetContent>
		</Sheet>
	);
}
