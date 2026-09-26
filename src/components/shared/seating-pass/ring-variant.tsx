import { UNSEATED_LABEL } from "@/lib/seating/seating-pass";
import { cn } from "@/lib/utils";
import type {
	SeatingPassMemberViewModel,
	SeatingPassTableViewModel,
	SeatingPassViewModel,
} from "@/server/mappers/view-models";
import {
	CountdownPill,
	EYEBROW,
	eventWhen,
	Tablemates,
	VenueLinks,
} from "./shared";

export const RING_MAX_DOTS = 12;
const BOX = 120;
const RADIUS = 46;
const DOT = 14;

export function TableRing({ table }: { table: SeatingPassTableViewModel }) {
	const dots = Math.min(table.capacity, RING_MAX_DOTS);
	const filled = Math.min(table.memberNames.length, RING_MAX_DOTS, dots);
	const numeric = table.numeral !== table.label;
	const seats = Array.from({ length: dots }, (_, slot) => ({
		slot,
		key: `${table.id}-seat-${slot}`,
		filled: slot < filled,
	}));
	return (
		<div className="shrink-0">
			<div
				aria-label={`${table.label}: ${table.memberNames.length} de ${table.capacity} lugares son de tu grupo`}
				className="relative"
				role="img"
				style={{ width: BOX, height: BOX }}
			>
				{seats.map((seat) => {
					const angle = -Math.PI / 2 + (2 * Math.PI * seat.slot) / dots;
					return (
						<span
							className={cn(
								"absolute rounded-full",
								seat.filled ? "bg-primary" : "bg-muted",
							)}
							data-filled={seat.filled}
							data-seat=""
							key={seat.key}
							style={{
								width: DOT,
								height: DOT,
								left: BOX / 2 + RADIUS * Math.cos(angle) - DOT / 2,
								top: BOX / 2 + RADIUS * Math.sin(angle) - DOT / 2,
							}}
						/>
					);
				})}
				<span
					className={cn(
						"absolute top-1/2 left-1/2 max-w-[56px] -translate-x-1/2 -translate-y-1/2 truncate text-center font-heading font-semibold text-primary",
						numeric ? "text-[28px]" : "text-[11px] leading-tight",
					)}
				>
					{table.numeral}
				</span>
			</div>
			{table.capacity > RING_MAX_DOTS && (
				<div className="mt-1 text-center text-[11px] text-muted-foreground">
					Mesa de {table.capacity}
				</div>
			)}
		</div>
	);
}

function UnseatedRow({ members }: { members: SeatingPassMemberViewModel[] }) {
	if (members.length === 0) return null;
	return (
		<div className="flex items-center gap-4 rounded-[10px] bg-muted px-4 py-3">
			<div className="flex-1">
				<div className="font-heading font-semibold text-[14px] text-card-foreground">
					{UNSEATED_LABEL}
				</div>
				<div className="text-[12.5px] text-muted-foreground">
					{members.map((member) => member.name).join(", ")}
				</div>
			</div>
		</div>
	);
}

/** 1f — Anillo de asientos: one ring per table the party uses. */
export function RingVariant({ pass }: { pass: SeatingPassViewModel }) {
	const unseated = pass.members.filter((member) => member.tableId === null);
	return (
		<div className="rounded-xl border border-border bg-card px-[22px] pt-[22px] pb-[22px] shadow-[0_14px_34px_rgba(80,30,60,.1)]">
			<div className="flex items-start justify-between gap-3">
				<div>
					<div className={EYEBROW}>Mesa asignada · {pass.primaryName}</div>
					<div className="mt-1 font-heading font-semibold text-[25px] text-card-foreground leading-[1.15]">
						Sus lugares
					</div>
					<div className="mt-1 text-[12.5px] text-muted-foreground">
						{eventWhen(pass)}
					</div>
				</div>
				<CountdownPill className="shrink-0" label={pass.countdownLabel} />
			</div>

			<div className="mt-5 flex flex-col gap-4">
				{pass.tables.map((table) => (
					<div className="flex items-center gap-4" key={table.id}>
						<TableRing table={table} />
						<div className="min-w-0 flex-1">
							<div className="font-heading font-semibold text-[16px] text-card-foreground">
								{table.label}
							</div>
							<div className="text-[12.5px] text-muted-foreground">
								{table.memberNames.join(", ")}
							</div>
						</div>
					</div>
				))}
				<UnseatedRow members={unseated} />
			</div>

			<div className="mt-5 flex flex-col gap-4">
				<Tablemates tables={pass.tables} />
				<VenueLinks location={pass.location} variant="buttons" />
			</div>
		</div>
	);
}
