"use client";

import { PrinterIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { SeatingBoardViewModel } from "@/server/mappers/view-models";
import { AddTablePopover, type AddTableValues } from "./add-table-popover";
import { MesasEmptyState } from "./mesas-empty-state";
import { SEATING_COPY } from "./seating-copy";

type Props = {
	board: SeatingBoardViewModel;
	wishlistId: string;
	onAddTable: (values: AddTableValues) => void;
};

/**
 * Below 768px the canvas is not offered at all — dragging a 90px table with a
 * finger is not usable, a deliberate exception to the product's mobile-first
 * rule granted by PRD §11. The notice names the fix rather than degrading
 * silently, and the tab is never hidden or disabled. Everything read-only
 * stays reachable: the unassigned list, the table list with occupancy, and the
 * print sheet.
 */
export function SeatingMobileView({ board, wishlistId, onAddTable }: Props) {
	const unseated = board.people.filter((person) => person.tableId === null);

	return (
		<div className="space-y-4">
			<p className="rounded-lg border border-[#EBDCAE] bg-[#FBF7EA] px-3 py-2 text-[#7A5E12] text-xs leading-relaxed">
				{SEATING_COPY.mobileNotice}
			</p>

			{board.totals.tables === 0 ? (
				<MesasEmptyState
					action={
						<AddTablePopover
							label="Agregar mi primera mesa"
							onSubmit={onAddTable}
						/>
					}
					variant="no-tables"
					wishlistId={wishlistId}
				/>
			) : (
				<section className="space-y-2">
					<h2 className="font-semibold text-sm">Mesas</h2>
					<ul className="space-y-1.5">
						{board.tables.map((table) => (
							<li
								className="flex min-h-12 items-center justify-between gap-2 rounded-xl border border-border bg-card px-3"
								key={table.id}
							>
								<span className="min-w-0 truncate text-sm">{table.label}</span>
								<span className="shrink-0 font-mono text-muted-foreground text-xs tabular-nums">
									{table.seated}/{table.capacity}
								</span>
							</li>
						))}
					</ul>
				</section>
			)}

			<section className="space-y-2">
				<h2 className="font-semibold text-sm">
					{SEATING_COPY.panelUnassigned} · {unseated.length}
				</h2>
				<ul className="space-y-1.5">
					{unseated.length === 0 ? (
						<li className="text-muted-foreground text-xs">
							Todos tienen mesa.
						</li>
					) : null}
					{unseated.map((person) => (
						<li
							className="flex min-h-12 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm"
							key={person.personId}
						>
							<span
								aria-hidden="true"
								className={
									person.status === "confirmed"
										? "size-[7px] shrink-0 rounded-full bg-seat-open"
										: "size-[7px] shrink-0 rounded-full bg-[#E0B84A]"
								}
							/>
							<span className="min-w-0 flex-1 truncate">
								{person.isUnnamed
									? SEATING_COPY.chipUnnamed
									: person.displayName}
								<span className="text-muted-foreground text-xs">
									{" "}
									· {person.partyLabel}
								</span>
							</span>
						</li>
					))}
				</ul>
			</section>

			<Button asChild className="min-h-12 w-full" variant="outline">
				<Link
					href={`/dashboard/wishlists/${wishlistId}/seating/print`}
					prefetch={false}
				>
					<PrinterIcon /> Hoja de mesas
				</Link>
			</Button>
		</div>
	);
}
