"use client";

import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type {
	SeatingPersonViewModel,
	SeatingTableViewModel,
} from "@/server/mappers/view-models";
import {
	SEATING_MAX_CAPACITY,
	SEATING_MIN_CAPACITY,
} from "@/server/services/seating.service";
import { capacityBlockedBody, capacityBlockedTitle } from "./seating-copy";

type Props = {
	table: SeatingTableViewModel | null;
	seatedPeople: SeatingPersonViewModel[];
	onClose: () => void;
	onSave: (capacity: number) => void;
	onRemovePerson: (personId: string) => void;
};

/**
 * Blocks rather than ejects: while the requested capacity is below the seated
 * count, Save stays disabled and the people who would have to move are named,
 * each with its own "Quitar de la mesa". Suggested by recency — the host
 * decides who actually moves.
 */
export function CapacityDialog({
	table,
	seatedPeople,
	onClose,
	onSave,
	onRemovePerson,
}: Props) {
	const [capacity, setCapacity] = useState(table?.capacity ?? 1);
	const capacityId = useId();

	useEffect(() => {
		if (table) setCapacity(table.capacity);
	}, [table]);

	if (!table) return null;

	const seated = seatedPeople.length;
	const blocked = capacity < seated;
	const overflow = blocked ? seated - capacity : 0;
	// Most recently seated first — the same suggestion the service names when it
	// refuses the write, so the dialog and the error never disagree.
	const mustMove = blocked
		? [...seatedPeople]
				.sort((a, b) => (b.seatedAt ?? "").localeCompare(a.seatedAt ?? ""))
				.slice(0, overflow)
		: [];
	const inRange =
		Number.isInteger(capacity) &&
		capacity >= SEATING_MIN_CAPACITY &&
		capacity <= SEATING_MAX_CAPACITY;

	return (
		<Dialog onOpenChange={(next) => !next && onClose()} open>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Capacidad de {table.label}</DialogTitle>
					<DialogDescription>
						Hay {seated}{" "}
						{seated === 1 ? "persona sentada" : "personas sentadas"} en esta
						mesa.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-1.5">
					<Label htmlFor={capacityId}>Personas que se sientan</Label>
					<Input
						aria-invalid={blocked}
						className={cn(blocked && "border-seat-invalid")}
						id={capacityId}
						max={SEATING_MAX_CAPACITY}
						min={SEATING_MIN_CAPACITY}
						onChange={(event) => setCapacity(Number(event.target.value))}
						type="number"
						value={capacity}
					/>
				</div>

				{blocked ? (
					<div className="space-y-2 rounded-xl border border-seat-invalid bg-[#FDF3F2] p-3">
						<p className="font-semibold text-seat-invalid text-sm">
							{capacityBlockedTitle(capacity, seated)}
						</p>
						<p className="text-muted-foreground text-xs leading-relaxed">
							{capacityBlockedBody(overflow)}
						</p>
						<ul className="space-y-1">
							{mustMove.map((person) => (
								<li
									className="flex items-center justify-between gap-2 rounded-lg bg-card px-2 py-1.5 text-xs"
									key={person.personId}
								>
									<span className="min-w-0 truncate">
										{person.displayName}
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
										Quitar de la mesa
									</button>
								</li>
							))}
						</ul>
					</div>
				) : null}

				<DialogFooter>
					<Button onClick={onClose} type="button" variant="outline">
						Cancelar
					</Button>
					<Button
						disabled={blocked || !inRange}
						onClick={() => onSave(capacity)}
						type="button"
					>
						Guardar
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
