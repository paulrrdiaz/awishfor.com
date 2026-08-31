"use client";

import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GiftIcon, GripVertical, XIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { reorderGiftsAction } from "@/app/(protected)/dashboard/wishlists/[id]/gifts/actions";
import { Button } from "@/components/ui/button";
import type { DashboardGiftRowViewModel } from "@/server/mappers/view-models";

type Props = {
	wishlistId: string;
	gifts: DashboardGiftRowViewModel[];
	onClose: () => void;
};

function ReorderRow({ gift }: { gift: DashboardGiftRowViewModel }) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: gift.id });

	return (
		<li
			className={
				isDragging
					? "flex items-center gap-2 opacity-50"
					: "flex items-center gap-2"
			}
			ref={setNodeRef}
			style={{
				transform: CSS.Transform.toString(transform),
				transition,
			}}
		>
			<button
				{...attributes}
				{...listeners}
				aria-label={`Arrastrar ${gift.name}`}
				className="flex size-11 shrink-0 cursor-grab items-center justify-center text-muted-foreground active:cursor-grabbing"
				type="button"
			>
				<GripVertical className="size-5" />
			</button>
			<div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-border bg-card p-2.5">
				<div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-muted">
					{gift.imageUrl ? (
						<Image
							alt={gift.name}
							className="object-cover"
							fill
							src={gift.imageUrl}
							unoptimized
						/>
					) : (
						<div className="flex h-full items-center justify-center text-muted-foreground">
							<GiftIcon className="size-4" />
						</div>
					)}
				</div>
				<span className="min-w-0 flex-1 truncate font-medium text-sm">
					{gift.name}
				</span>
			</div>
		</li>
	);
}

export function GiftReorderMode({ wishlistId, gifts, onClose }: Props) {
	const [items, setItems] = useState(gifts);
	const [isSaving, setIsSaving] = useState(false);
	const sensors = useSensors(useSensor(PointerSensor));

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;
		if (!over || active.id === over.id) return;
		const oldIndex = items.findIndex((gift) => gift.id === active.id);
		const newIndex = items.findIndex((gift) => gift.id === over.id);
		if (oldIndex === -1 || newIndex === -1) return;
		setItems((current) => arrayMove(current, oldIndex, newIndex));
	}

	async function handleSave() {
		setIsSaving(true);
		try {
			await reorderGiftsAction({
				wishlistId,
				orderedGiftIds: items.map((gift) => gift.id),
			});
			onClose();
		} catch {
			setIsSaving(false);
			toast.error("No pudimos guardar el nuevo orden.");
		}
	}

	return (
		<div className="fixed inset-0 z-50 flex h-dvh flex-col bg-background md:hidden">
			<div className="flex shrink-0 items-center justify-between gap-2 border-border border-b px-3 py-2.5">
				<Button
					aria-label="Cerrar"
					disabled={isSaving}
					onClick={onClose}
					size="icon-sm"
					type="button"
					variant="ghost"
				>
					<XIcon />
				</Button>
				<p className="font-medium text-sm">Reordenando regalos…</p>
				<div aria-hidden="true" className="size-9" />
			</div>
			<DndContext
				collisionDetection={closestCenter}
				onDragEnd={handleDragEnd}
				sensors={sensors}
			>
				<SortableContext
					items={items.map((gift) => gift.id)}
					strategy={verticalListSortingStrategy}
				>
					<ul className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
						{items.map((gift) => (
							<ReorderRow gift={gift} key={gift.id} />
						))}
					</ul>
				</SortableContext>
			</DndContext>
			<div className="flex shrink-0 gap-2 border-border border-t px-3 pt-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
				<Button
					className="flex-1"
					disabled={isSaving}
					onClick={onClose}
					type="button"
					variant="outline"
				>
					Cancelar
				</Button>
				<Button
					className="flex-1"
					disabled={isSaving}
					onClick={handleSave}
					type="button"
				>
					{isSaving ? "Guardando…" : "Guardar orden"}
				</Button>
			</div>
		</div>
	);
}
