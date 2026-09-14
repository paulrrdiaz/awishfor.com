"use client";

import { useDraggable } from "@dnd-kit/core";
import { GripVerticalIcon } from "lucide-react";
import Link from "next/link";
import { hrefFor } from "@/components/layouts/dashboard/wishlist-sections";
import { cn } from "@/lib/utils";
import type { SeatingPersonViewModel } from "@/server/mappers/view-models";
import { chipParty, SEATING_COPY } from "./seating-copy";

type Props = {
	person: SeatingPersonViewModel;
	wishlistId: string;
	state?: "idle" | "ghost" | "dragging" | "invalid";
	/** Replaces the party sub-line while hovering a full table. */
	invalidReason?: string;
	draggable?: boolean;
	/** Keyboard flow: the chip currently picked up. */
	isPickedUp?: boolean;
	onPickUp?: (personId: string) => void;
};

export function GuestChip({
	person,
	wishlistId,
	state = "idle",
	invalidReason,
	draggable = true,
	isPickedUp = false,
	onPickUp,
}: Props) {
	const { attributes, listeners, setNodeRef } = useDraggable({
		id: person.personId,
		data: { type: "person", personId: person.personId },
		disabled: !draggable,
	});

	return (
		<div
			className={cn(
				"flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-2 py-1.5",
				state === "ghost" && "border-dashed opacity-40",
				state === "dragging" && "-rotate-2 shadow-lg",
				state === "invalid" && "border-seat-invalid bg-[#FDF3F2]",
				isPickedUp && "ring-2 ring-ring",
			)}
			ref={draggable ? setNodeRef : undefined}
		>
			{draggable ? (
				<button
					{...attributes}
					{...listeners}
					aria-label={`Mover a ${person.displayName}`}
					className="shrink-0 cursor-grab p-1 text-muted-foreground active:cursor-grabbing"
					onKeyDown={(event) => {
						if (event.key === " " && onPickUp) onPickUp(person.personId);
					}}
					type="button"
				>
					<GripVerticalIcon className="size-4" />
				</button>
			) : (
				<span aria-hidden="true" className="w-1" />
			)}
			<span
				aria-hidden="true"
				className={cn(
					"size-[7px] shrink-0 rounded-full",
					person.status === "confirmed" ? "bg-seat-open" : "bg-[#E0B84A]",
				)}
			/>
			<span className="min-w-0 flex-1">
				<span
					className={cn(
						"block truncate font-semibold text-[13.5px]",
						person.isUnnamed && "text-muted-foreground italic",
					)}
				>
					{person.isUnnamed ? SEATING_COPY.chipUnnamed : person.displayName}
				</span>
				<span className="block truncate text-[11px] text-muted-foreground">
					{invalidReason ?? chipParty(person.partyLabel)}
				</span>
			</span>
			{person.isUnnamed ? (
				// Naming a companion rewrites the invitation's extra-guest rows, so it
				// belongs in Invitados rather than inline here.
				<Link
					className="shrink-0 text-[11px] underline underline-offset-2 hover:text-foreground"
					href={hrefFor(wishlistId, "guests")}
				>
					{SEATING_COPY.chipPutName}
				</Link>
			) : null}
		</div>
	);
}
