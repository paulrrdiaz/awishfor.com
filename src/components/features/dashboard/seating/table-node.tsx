"use client";

import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { CheckIcon, Loader2Icon, XIcon } from "lucide-react";
import { memo, useState } from "react";
import { toast } from "sonner";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type {
	SeatingPersonViewModel,
	SeatingTableViewModel,
} from "@/server/mappers/view-models";
import {
	type SeatBubble,
	type SeatBubbleLayout,
	seatBubbleLayout,
	type TableVisualState,
	tableAriaLabel,
	tableGeometry,
	tableStateLabel,
} from "./seating-geometry";

type Props = {
	table: SeatingTableViewModel;
	state: TableVisualState;
	/** Occupancy shown while a person hovers a valid target: `9/10 → 10/10`. */
	previewSeated?: number;
	/** Who is seated here. Must be a stable reference — this component is memoised. */
	seatedPeople: SeatingPersonViewModel[];
	/** People whose seat here is still being written. Shown, but marked as saving. */
	pendingPersonIds: ReadonlySet<string>;
	/** True while this table's new position is being persisted. */
	isSavingPosition: boolean;
	onSelect: (tableId: string) => void;
	/** Unseats a person straight from their rim bubble, no drawer required. */
	onRemovePerson: (personId: string) => void;
};

const RING_TRACK = "#E9ECE1";

function TableNodeImpl({
	table,
	state,
	previewSeated,
	seatedPeople,
	pendingPersonIds,
	isSavingPosition,
	onSelect,
	onRemovePerson,
}: Props) {
	const { attributes, listeners, setNodeRef, transform, isDragging } =
		useDraggable({
			id: `table:${table.id}`,
			data: { type: "table", tableId: table.id },
		});
	const { setNodeRef: setDropRef } = useDroppable({
		id: `droptable:${table.id}`,
		data: { type: "table", tableId: table.id },
	});

	const { width, height } = tableGeometry(table);
	const isRound = table.shape === "round";
	const ratio = table.capacity > 0 ? table.seated / table.capacity : 0;
	const seats = seatBubbleLayout(table, seatedPeople);

	return (
		<div
			className="absolute"
			ref={setDropRef}
			style={{ left: table.x, top: table.y, width, height }}
		>
			{/* The dashed hole the design leaves at the origin while dragging. */}
			{isDragging ? (
				<span
					aria-hidden="true"
					className={cn(
						"absolute inset-0 border-2 border-border border-dashed opacity-40",
						isRound ? "rounded-full" : "rounded-xl",
					)}
				/>
			) : null}
			{/* The table and its seats move together; only the hole stays behind. */}
			<div
				className="absolute inset-0"
				style={{ transform: CSS.Translate.toString(transform) }}
			>
				<button
					{...attributes}
					{...listeners}
					aria-label={tableAriaLabel(table, state, table.shape, seatedPeople)}
					className={cn(
						"absolute inset-0 flex cursor-grab flex-col items-center justify-center border text-center shadow-[0_1px_2px_rgba(20,30,50,.07)] transition-colors active:cursor-grabbing",
						isRound ? "rounded-full" : "rounded-xl",
						state === "empty" && "border-border border-dashed bg-card",
						state === "open" &&
							(isRound
								? "border-transparent bg-card"
								: "border-[#D9DDD0] bg-card"),
						state === "full" &&
							(isRound
								? "border-transparent bg-[#F7FBF4]"
								: "border-[#BFDCC9] bg-[#F7FBF4]"),
						state === "valid" &&
							"border-2 border-seat-open bg-card ring-4 ring-seat-open/20",
						state === "invalid" &&
							"cursor-no-drop border-2 border-seat-invalid bg-[#FDF3F2]",
						state === "selected" &&
							(isRound
								? "border-transparent bg-card ring-2 ring-ring"
								: "border-[#D9DDD0] bg-card ring-2 ring-ring"),
						isDragging && "-rotate-2 scale-[1.04] shadow-lg",
					)}
					onClick={() => onSelect(table.id)}
					ref={setNodeRef}
					type="button"
				>
					{isRound ? (
						<span
							aria-hidden="true"
							className="absolute inset-0 rounded-full transition-[background] duration-200"
							style={{
								background:
									state === "invalid"
										? undefined
										: `conic-gradient(${state === "full" ? "var(--color-seat-full)" : "var(--color-seat-open)"} 0 ${ratio * 360}deg, ${RING_TRACK} 0)`,
								padding: 6,
								WebkitMask:
									"radial-gradient(farthest-side, transparent calc(100% - 6px), #000 calc(100% - 6px))",
								mask: "radial-gradient(farthest-side, transparent calc(100% - 6px), #000 calc(100% - 6px))",
							}}
						/>
					) : null}
					<span className="relative px-2 font-bold text-[12.5px] leading-tight">
						{table.label}
					</span>
					<span className="relative font-mono text-[12px] tabular-nums">
						{previewSeated !== undefined && previewSeated !== table.seated
							? `${table.seated}/${table.capacity} → ${previewSeated}/${table.capacity}`
							: `${table.seated}/${table.capacity}`}
					</span>
					<span className="relative font-mono text-[9.5px] text-muted-foreground uppercase">
						{tableStateLabel(state, table.shape)}
					</span>
					{!isRound ? (
						<span
							aria-hidden="true"
							className="relative mt-1 h-1 w-3/5 overflow-hidden rounded-full bg-[#E9ECE1]"
						>
							<span
								className="block h-full rounded-full transition-[width] duration-200"
								style={{
									width: `${Math.round(ratio * 100)}%`,
									background:
										state === "full"
											? "var(--color-seat-full)"
											: "var(--color-seat-open)",
								}}
							/>
						</span>
					) : null}
				</button>
				{isSavingPosition ? (
					<span
						aria-label="Guardando la posición"
						className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm"
						role="status"
					>
						<Loader2Icon className="size-3 animate-spin" />
					</span>
				) : null}
				<SeatBubbles
					layout={seats}
					onRemove={onRemovePerson}
					pendingPersonIds={pendingPersonIds}
				/>
			</div>
		</div>
	);
}

/**
 * Names around the rim, so a host can read who is at a table without opening
 * it. The container is inert to the pointer — the table underneath stays
 * draggable and droppable — and only the bubbles themselves take clicks.
 * `aria-hidden`, because `tableAriaLabel` already reads the same roster out and
 * ~50 extra tab stops on the canvas would drown the panel's keyboard flow.
 */
function SeatBubbles({
	layout,
	pendingPersonIds,
	onRemove,
}: {
	layout: SeatBubbleLayout;
	pendingPersonIds: ReadonlySet<string>;
	onRemove: (personId: string) => void;
}) {
	if (layout.bubbles.length === 0) return null;

	return (
		<div aria-hidden="true" className="pointer-events-none absolute inset-0">
			{layout.bubbles.map((bubble) => (
				<SeatBubbleChip
					bubble={bubble}
					isPending={pendingPersonIds.has(bubble.personId)}
					key={bubble.personId}
					mode={layout.mode}
					onRemove={onRemove}
				/>
			))}
		</div>
	);
}

function SeatBubbleChip({
	bubble,
	mode,
	isPending,
	onRemove,
}: {
	bubble: SeatBubble;
	mode: SeatBubbleLayout["mode"];
	isPending: boolean;
	onRemove: (personId: string) => void;
}) {
	const [copied, setCopied] = useState(false);

	async function handleCopy(event: React.MouseEvent) {
		// The table underneath opens its detail sheet on click.
		event.stopPropagation();
		try {
			await navigator.clipboard.writeText(bubble.inviteUrl);
			setCopied(true);
			setTimeout(() => setCopied(false), 1600);
			toast.success(`Enlace de ${bubble.partyLabel} copiado`);
		} catch {
			toast.error("No se pudo copiar el enlace");
		}
	}

	function handleRemove(event: React.MouseEvent) {
		event.stopPropagation();
		onRemove(bubble.personId);
	}

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				{/* Group wrapper carries the hover state so the remove badge can
				    live outside the copy button's own rounded bounds. */}
				<span
					className="group pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 hover:z-10"
					style={{ left: bubble.x, top: bubble.y }}
				>
					<button
						className={cn(
							"flex cursor-copy items-center justify-center rounded-full border font-medium shadow-[0_1px_2px_rgba(20,30,50,.07)] transition-colors",
							bubble.status === "confirmed"
								? "border-seat-open/40 bg-card text-foreground hover:border-seat-open"
								: "border-[#E0B84A]/60 bg-[#FDF8EA] text-[#7A5E12] hover:border-[#E0B84A]",
							bubble.isUnnamed && "italic",
							mode === "name" &&
								"max-w-[56px] px-1.5 py-px text-[9px] leading-[14px]",
							mode === "initials" &&
								"size-[19px] font-mono text-[8.5px] leading-none",
							mode === "dot" && "size-3 border-2",
							isPending && "animate-pulse opacity-70",
							copied && "border-seat-full bg-[#F7FBF4]",
						)}
						onClick={handleCopy}
						// Mouse affordance only: the panel and the table sheet are the
						// keyboard paths, and the roster is already in the table's label.
						tabIndex={-1}
						type="button"
					>
						{mode === "dot" ? null : copied ? (
							<CheckIcon className="size-2.5" />
						) : (
							<span className="truncate">{bubble.label}</span>
						)}
					</button>
					{isPending ? null : (
						<button
							aria-label={`Quitar a ${bubble.title} de la mesa`}
							className="absolute -top-1.5 -right-1.5 flex size-4 scale-75 items-center justify-center rounded-full border border-seat-invalid/50 bg-card text-seat-invalid opacity-0 shadow-[0_1px_2px_rgba(20,30,50,.1)] transition-all hover:bg-[#FDF3F2] group-hover:scale-100 group-hover:opacity-100"
							onClick={handleRemove}
							tabIndex={-1}
							type="button"
						>
							<XIcon className="size-2.5" />
						</button>
					)}
				</span>
			</TooltipTrigger>
			{/* The shared tooltip lays its children out in a row; these are lines. */}
			<TooltipContent className="flex-col items-start gap-0.5">
				<p className="font-medium">{bubble.title}</p>
				<p className="opacity-80">{bubble.statusLabel}</p>
				<p className="opacity-80">
					{isPending
						? "Guardando…"
						: "Clic para copiar su enlace · × para quitar"}
				</p>
			</TooltipContent>
		</Tooltip>
	);
}

/** Memoised so an `onDragOver` on one table does not repaint the whole canvas. */
export const TableNode = memo(TableNodeImpl);
