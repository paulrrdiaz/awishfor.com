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
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ArrowUpDownIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { reorderGiftsAction } from "@/app/(protected)/dashboard/wishlists/[id]/gifts/actions";
import { GiftReorderMode } from "@/components/layouts/dashboard/mobile/gift-reorder-mode";
import { Button } from "@/components/ui/button";
import type { DashboardGiftRowViewModel } from "@/server/mappers/view-models";
import { GiftSheet } from "./gift-sheet";
import { SortableGiftRow } from "./sortable-gift-row";

type Props = {
	wishlistId: string;
	gifts: DashboardGiftRowViewModel[];
	categoriesById: Record<string, string>;
	sortable: boolean;
};

export function GiftGroup({
	wishlistId,
	gifts,
	categoriesById,
	sortable,
}: Props) {
	const [items, setItems] = useState(gifts);
	const prevItemsRef = useRef(items);
	const [editingGift, setEditingGift] =
		useState<DashboardGiftRowViewModel | null>(null);
	const [reorderMode, setReorderMode] = useState(false);

	useEffect(() => {
		setItems(gifts);
	}, [gifts]);

	const sensors = useSensors(useSensor(PointerSensor));

	function handleDragEnd(event: DragEndEvent) {
		if (!sortable) return;
		const { active, over } = event;
		if (!over || active.id === over.id) return;

		const oldIndex = items.findIndex((g) => g.id === active.id);
		const newIndex = items.findIndex((g) => g.id === over.id);
		if (oldIndex === -1 || newIndex === -1) return;

		prevItemsRef.current = items;
		const reordered = arrayMove(items, oldIndex, newIndex);
		setItems(reordered);

		reorderGiftsAction({
			wishlistId,
			orderedGiftIds: reordered.map((g) => g.id),
		}).catch(() => {
			setItems(prevItemsRef.current);
			toast.error("No pudimos guardar el nuevo orden.");
		});
	}

	return (
		<>
			{items.length > 0 && (
				<div className="flex items-center justify-between gap-2 md:hidden">
					<p className="text-muted-foreground text-xs">
						Desliza un regalo para editarlo.
					</p>
					{sortable && items.length > 1 && (
						<Button
							className="shrink-0"
							onClick={() => setReorderMode(true)}
							size="sm"
							type="button"
							variant="outline"
						>
							<ArrowUpDownIcon /> Reordenar
						</Button>
					)}
				</div>
			)}
			{reorderMode && (
				<GiftReorderMode
					gifts={items}
					onClose={() => setReorderMode(false)}
					wishlistId={wishlistId}
				/>
			)}
			<DndContext
				collisionDetection={closestCenter}
				id={`gifts-${wishlistId}`}
				onDragEnd={handleDragEnd}
				sensors={sensors}
			>
				<SortableContext
					items={items.map((g) => g.id)}
					strategy={verticalListSortingStrategy}
				>
					<ul className="space-y-2.5">
						{items.map((gift) => (
							<SortableGiftRow
								categoryName={
									gift.categoryId ? categoriesById[gift.categoryId] : null
								}
								gift={gift}
								key={gift.id}
								onEdit={() => setEditingGift(gift)}
								sortable={sortable}
								wishlistId={wishlistId}
							/>
						))}
					</ul>
				</SortableContext>
			</DndContext>
			<GiftSheet
				gift={editingGift}
				onOpenChange={(open) => {
					if (!open) setEditingGift(null);
				}}
				open={!!editingGift}
				wishlistId={wishlistId}
			/>
		</>
	);
}
