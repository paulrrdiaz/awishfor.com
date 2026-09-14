"use client";

import { useDroppable } from "@dnd-kit/core";
import { MaximizeIcon, MinusIcon, PlusIcon } from "lucide-react";
import { useId } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
	SeatingPersonViewModel,
	SeatingTableViewModel,
} from "@/server/mappers/view-models";
import {
	SEATING_CANVAS_H,
	SEATING_CANVAS_W,
	SEATING_GRID,
	type TableVisualState,
} from "./seating-geometry";
import { TableNode } from "./table-node";

type Props = {
	tables: SeatingTableViewModel[];
	stateFor: (tableId: string) => TableVisualState;
	previewSeatedFor: (tableId: string) => number | undefined;
	/** tableId → who is seated there. Memoised upstream so `TableNode` stays memoised. */
	seatedByTable: Map<string, SeatingPersonViewModel[]>;
	/** People whose seat is still being written. */
	pendingPersonIds: ReadonlySet<string>;
	/** Tables whose position is still being written. */
	savingTableIds: ReadonlySet<string>;
	zoom: number;
	onZoomChange: (zoom: number) => void;
	onFitToScreen: () => void;
	snapToGrid: boolean;
	onSnapChange: (snap: boolean) => void;
	onSelectTable: (tableId: string) => void;
	/** Unseats a person straight from their rim bubble, no drawer required. */
	onRemovePerson: (personId: string) => void;
	/** Shown at the foot of the canvas while a person hovers a full table. */
	invalidNotice?: string | null;
};

/** One shared empty array, so an empty table never re-renders on identity alone. */
const NO_SEATED_PEOPLE: SeatingPersonViewModel[] = [];

export function FloorCanvas({
	tables,
	stateFor,
	previewSeatedFor,
	seatedByTable,
	pendingPersonIds,
	savingTableIds,
	zoom,
	onZoomChange,
	onFitToScreen,
	snapToGrid,
	onSnapChange,
	onSelectTable,
	onRemovePerson,
	invalidNotice,
}: Props) {
	const snapId = useId();
	// Dropping on the background is an unassign, not a no-op.
	const { setNodeRef, isOver } = useDroppable({
		id: "canvas-background",
		data: { type: "canvas" },
	});

	return (
		<div className="relative flex min-w-0 flex-1 flex-col gap-2">
			<div className="flex flex-wrap items-center gap-2">
				<div className="flex items-center gap-1 rounded-full border border-border bg-card px-1 py-0.5">
					<Button
						aria-label="Alejar"
						onClick={() => onZoomChange(Math.max(0.4, zoom - 0.1))}
						size="icon-sm"
						type="button"
						variant="ghost"
					>
						<MinusIcon />
					</Button>
					<span className="w-12 text-center font-mono text-xs tabular-nums">
						{Math.round(zoom * 100)}%
					</span>
					<Button
						aria-label="Acercar"
						onClick={() => onZoomChange(Math.min(1.6, zoom + 0.1))}
						size="icon-sm"
						type="button"
						variant="ghost"
					>
						<PlusIcon />
					</Button>
				</div>
				<Button
					onClick={onFitToScreen}
					size="sm"
					type="button"
					variant="outline"
				>
					<MaximizeIcon /> Ajustar a pantalla
				</Button>
				<label
					className="flex items-center gap-1.5 text-muted-foreground text-xs"
					htmlFor={snapId}
				>
					<input
						checked={snapToGrid}
						className="size-3.5 accent-[var(--color-seat-open)]"
						id={snapId}
						onChange={(event) => onSnapChange(event.target.checked)}
						type="checkbox"
					/>
					Ajustar a la grilla
				</label>
				<Legend />
			</div>

			<div className="min-h-0 flex-1 overflow-auto rounded-xl border border-[#E2E5DA]">
				<div
					className="relative origin-top-left"
					style={{
						width: SEATING_CANVAS_W,
						height: SEATING_CANVAS_H,
						transform: `scale(${zoom})`,
					}}
				>
					<div
						className={cn(
							"absolute inset-0 bg-[#FCFCF9]",
							isOver && "bg-[#F5F6EF]",
						)}
						ref={setNodeRef}
						style={{
							backgroundImage: `linear-gradient(to right, #EDEFE5 1px, transparent 1px), linear-gradient(to bottom, #EDEFE5 1px, transparent 1px)`,
							backgroundSize: `${SEATING_GRID}px ${SEATING_GRID}px`,
						}}
					/>
					{/* Orientation only — not editable objects. */}
					<span className="pointer-events-none absolute top-3 left-4 font-mono text-[10px] text-muted-foreground uppercase tracking-wide">
						Entrada
					</span>
					<span className="pointer-events-none absolute right-8 bottom-5 left-8 border-2 border-[#DCE0D2] border-dashed pt-1 pb-2 text-center font-mono text-[10px] text-muted-foreground uppercase tracking-wide">
						Escenario / pista
					</span>
					{tables.map((table) => (
						<TableNode
							isSavingPosition={savingTableIds.has(table.id)}
							key={table.id}
							onRemovePerson={onRemovePerson}
							onSelect={onSelectTable}
							pendingPersonIds={pendingPersonIds}
							previewSeated={previewSeatedFor(table.id)}
							seatedPeople={seatedByTable.get(table.id) ?? NO_SEATED_PEOPLE}
							state={stateFor(table.id)}
							table={table}
						/>
					))}
					{invalidNotice ? (
						<p className="pointer-events-none absolute inset-x-0 bottom-0 bg-[#FDF3F2] px-3 py-1.5 text-center text-[11px] text-seat-invalid">
							{invalidNotice}
						</p>
					) : null}
				</div>
			</div>
		</div>
	);
}

function Legend() {
	return (
		<ul className="ml-auto flex items-center gap-3 text-[11px] text-muted-foreground">
			<li className="flex items-center gap-1.5">
				<span className="size-2.5 rounded-full border border-[#D9DDD0] bg-card" />
				Con lugares
			</li>
			<li className="flex items-center gap-1.5">
				<span className="size-2.5 rounded-full border border-[#BFDCC9] bg-seat-full" />
				Completa
			</li>
			<li className="flex items-center gap-1.5">
				<span className="size-2.5 rounded-full border-2 border-seat-invalid bg-[#FDF3F2]" />
				Destino inválido
			</li>
		</ul>
	);
}
