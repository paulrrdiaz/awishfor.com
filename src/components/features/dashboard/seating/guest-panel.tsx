"use client";

import { useDroppable } from "@dnd-kit/core";
import { CheckIcon, PrinterIcon, SearchIcon } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type {
	SeatingBoardViewModel,
	SeatingPersonViewModel,
} from "@/server/mappers/view-models";
import { GuestChip } from "./guest-chip";
import { allSeatedBody, declinedNote, SEATING_COPY } from "./seating-copy";
import { groupByParty, matchesSeatingSearch } from "./seating-geometry";

type Filter = "unseated" | "seated" | "pending";

type Props = {
	board: SeatingBoardViewModel;
	wishlistId: string;
	activePersonId: string | null;
	pickedUpPersonId: string | null;
	onPickUp: (personId: string) => void;
	onSeatTogether: (inviteId: string) => void;
	onUnassign: (personId: string) => void;
};

export function GuestPanel({
	board,
	wishlistId,
	activePersonId,
	pickedUpPersonId,
	onPickUp,
	onSeatTogether,
	onUnassign,
}: Props) {
	const [query, setQuery] = useState("");
	const [filter, setFilter] = useState<Filter>("unseated");
	const [seatedOpen, setSeatedOpen] = useState(false);

	// Dropping on the panel header returns a person to the unassigned list.
	const { setNodeRef, isOver } = useDroppable({
		id: "panel-unassign",
		data: { type: "unassign" },
	});

	const counts = useMemo(
		() => ({
			unseated: board.people.filter((person) => person.tableId === null).length,
			seated: board.people.filter((person) => person.tableId !== null).length,
			pending: board.people.filter((person) => person.status === "pending")
				.length,
		}),
		[board.people],
	);

	const visible = useMemo(() => {
		const byFilter = board.people.filter((person) => {
			if (filter === "unseated") return person.tableId === null;
			if (filter === "seated") return person.tableId !== null;
			return person.status === "pending";
		});
		return byFilter.filter((person) => matchesSeatingSearch(person, query));
	}, [board.people, filter, query]);

	const groups = useMemo(
		() => groupByParty(visible, board.people),
		[visible, board.people],
	);

	const tablesById = useMemo(
		() => new Map(board.tables.map((table) => [table.id, table])),
		[board.tables],
	);

	const allSeated =
		board.totals.unseated === 0 &&
		board.totals.tables > 0 &&
		board.totals.eligiblePeople > 0;

	return (
		<aside className="flex min-h-0 w-full min-w-0 flex-col gap-3 overflow-hidden rounded-xl border border-border bg-card p-3">
			<header
				className={cn("space-y-2 rounded-lg p-1", isOver && "bg-muted")}
				ref={setNodeRef}
			>
				<div className="flex items-baseline justify-between gap-2">
					<h2 className="font-semibold text-sm">Invitados</h2>
					<span className="font-mono text-muted-foreground text-xs tabular-nums">
						{board.totals.seated}/{board.totals.eligiblePeople} sentados
					</span>
				</div>
				<div
					aria-hidden="true"
					className="h-1.5 overflow-hidden rounded-full bg-muted"
				>
					<div
						className="h-full rounded-full bg-seat-open transition-[width]"
						style={{
							width: `${
								board.totals.eligiblePeople > 0
									? Math.round(
											(board.totals.seated / board.totals.eligiblePeople) * 100,
										)
									: 0
							}%`,
						}}
					/>
				</div>
			</header>

			{allSeated ? (
				<div className="space-y-2 rounded-xl border border-[#BFDCC9] bg-[#F7FBF4] p-3">
					<p className="flex items-center gap-1.5 font-semibold text-sm">
						<CheckIcon className="size-4 text-seat-full" />
						{SEATING_COPY.allSeatedTitle}
					</p>
					<p className="text-muted-foreground text-xs leading-relaxed">
						{allSeatedBody(board.totals.eligiblePeople)}
					</p>
					<Button asChild size="sm" variant="outline">
						<Link
							href={`/dashboard/wishlists/${wishlistId}/seating/print`}
							prefetch={false}
						>
							<PrinterIcon /> Imprimir hoja de mesas
						</Link>
					</Button>
				</div>
			) : null}

			<div className="relative">
				<SearchIcon className="pointer-events-none absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
				<Input
					aria-label="Buscar invitado"
					className="rounded-full pl-8"
					onChange={(event) => setQuery(event.target.value)}
					placeholder="Buscar invitado"
					value={query}
				/>
			</div>

			<div className="flex flex-wrap gap-1.5">
				{(
					[
						["unseated", "Sin mesa"],
						["seated", "Sentados"],
						["pending", "Pendientes"],
					] as const
				).map(([value, label]) => (
					<button
						aria-pressed={filter === value}
						className={cn(
							"rounded-full border px-2.5 py-1 text-xs",
							filter === value
								? "border-foreground bg-foreground text-background"
								: "border-border text-muted-foreground",
						)}
						key={value}
						onClick={() => setFilter(value)}
						type="button"
					>
						{label} · {counts[value]}
					</button>
				))}
			</div>

			<div className="min-h-0 flex-1 space-y-3 overflow-y-auto">
				{filter === "unseated" ? (
					<h3 className="flex items-center gap-2 font-semibold text-xs">
						{SEATING_COPY.panelUnassigned}
						{counts.unseated > 0 ? (
							<span className="rounded-full bg-[#FBF1D8] px-1.5 py-0.5 font-mono text-[#8A6A16] text-[10px]">
								{counts.unseated}
							</span>
						) : null}
					</h3>
				) : null}

				{groups.length === 0 ? (
					<p className="py-6 text-center text-muted-foreground text-xs">
						No hay personas en esta vista.
					</p>
				) : null}

				{groups.map((group) => (
					<section className="space-y-1.5" key={group.inviteId}>
						<div className="flex items-baseline justify-between gap-2">
							<p className="min-w-0 truncate text-[11px] text-muted-foreground">
								{group.partyLabel} · {group.partySize}{" "}
								{group.partySize === 1 ? "persona" : "personas"}
								{filter === "unseated" ? ` · ${group.unseated} sin mesa` : ""}
							</p>
							{filter === "unseated" && group.unseated > 1 ? (
								<button
									className="shrink-0 text-[11px] underline underline-offset-2"
									onClick={() => onSeatTogether(group.inviteId)}
									type="button"
								>
									{SEATING_COPY.panelSeatTogether}
								</button>
							) : null}
						</div>
						{group.people.map((person) => (
							<PanelRow
								key={person.personId}
								onPickUp={onPickUp}
								onUnassign={onUnassign}
								person={person}
								pickedUpPersonId={pickedUpPersonId}
								state={activePersonId === person.personId ? "ghost" : "idle"}
								tableLabel={
									person.tableId
										? (tablesById.get(person.tableId)?.label ?? null)
										: null
								}
								wishlistId={wishlistId}
							/>
						))}
					</section>
				))}
			</div>

			{board.totals.declinedExcluded > 0 ? (
				<p className="border-border border-t pt-2 text-[11px] text-muted-foreground">
					{declinedNote(board.totals.declinedExcluded)}
				</p>
			) : null}

			{board.totals.seated > 0 ? (
				<details
					className="border-border border-t pt-2"
					onToggle={(event) => setSeatedOpen(event.currentTarget.open)}
					open={seatedOpen}
				>
					<summary className="cursor-pointer font-semibold text-xs">
						Sentados · {board.totals.seated}
					</summary>
					<ul className="mt-2 space-y-1">
						{board.tables.map((table) => {
							const seated = board.people.filter(
								(person) => person.tableId === table.id,
							);
							if (seated.length === 0) return null;
							return (
								<li className="text-[11px]" key={table.id}>
									<span className="font-mono">{table.label}</span>
									<span className="text-muted-foreground">
										{" — "}
										{seated
											.map((person) =>
												person.isUnnamed
													? `${SEATING_COPY.chipUnnamed} (${person.partyLabel})`
													: person.displayName,
											)
											.join(", ")}
									</span>
								</li>
							);
						})}
					</ul>
				</details>
			) : null}
		</aside>
	);
}

function PanelRow({
	person,
	wishlistId,
	state,
	tableLabel,
	pickedUpPersonId,
	onPickUp,
	onUnassign,
}: {
	person: SeatingPersonViewModel;
	wishlistId: string;
	state: "idle" | "ghost";
	tableLabel: string | null;
	pickedUpPersonId: string | null;
	onPickUp: (personId: string) => void;
	onUnassign: (personId: string) => void;
}) {
	return (
		<div className="flex items-center gap-1.5">
			<div className="min-w-0 flex-1">
				<GuestChip
					isPickedUp={pickedUpPersonId === person.personId}
					onPickUp={onPickUp}
					person={person}
					state={state}
					wishlistId={wishlistId}
				/>
			</div>
			{tableLabel ? (
				<button
					className="shrink-0 font-mono text-[10px] text-muted-foreground underline underline-offset-2"
					onClick={() => onUnassign(person.personId)}
					title="Quitar de la mesa"
					type="button"
				>
					{tableLabel}
				</button>
			) : null}
		</div>
	);
}
