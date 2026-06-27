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
import { useRef, useState } from "react";
import type { DashboardGiftRowViewModel } from "@/server/mappers/view-models";
import { api } from "@/trpc/react";
import { SortableGiftRow } from "./sortable-gift-row";

type GroupKey = "available" | "purchased" | "hidden";
type Groups = Record<GroupKey, DashboardGiftRowViewModel[]>;

const GROUP_LABELS: Record<GroupKey, string> = {
	available: "Disponibles",
	purchased: "Comprados",
	hidden: "Ocultos",
};
const GROUP_ORDER: GroupKey[] = ["available", "purchased", "hidden"];

type Props = {
	wishlistId: string;
	available: DashboardGiftRowViewModel[];
	purchased: DashboardGiftRowViewModel[];
	hidden: DashboardGiftRowViewModel[];
};

export function GiftGroup({ wishlistId, available, purchased, hidden }: Props) {
	const [groups, setGroups] = useState<Groups>({
		available,
		purchased,
		hidden,
	});
	const prevGroupsRef = useRef<Groups>(groups);
	const utils = api.useUtils();

	const reorder = api.gift.reorder.useMutation({
		onError: () => setGroups(prevGroupsRef.current),
		onSettled: () => utils.gift.list.invalidate({ wishlistId }),
	});

	const sensors = useSensors(useSensor(PointerSensor));

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over || active.id === over.id) return;

		const activeId = String(active.id);
		const overId = String(over.id);

		const groupKey = GROUP_ORDER.find((key) =>
			groups[key].some((g) => g.id === activeId),
		);
		if (!groupKey) return;

		const group = groups[groupKey];
		if (!group.some((g) => g.id === overId)) return;

		const oldIndex = group.findIndex((g) => g.id === activeId);
		const newIndex = group.findIndex((g) => g.id === overId);
		const reordered = arrayMove(group, oldIndex, newIndex);

		prevGroupsRef.current = groups;
		const nextGroups: Groups = { ...groups, [groupKey]: reordered };
		setGroups(nextGroups);

		const orderedGiftIds = GROUP_ORDER.flatMap((key) =>
			nextGroups[key].map((g) => g.id),
		);
		reorder.mutate({ wishlistId, orderedGiftIds });
	};

	return (
		<DndContext
			collisionDetection={closestCenter}
			onDragEnd={handleDragEnd}
			sensors={sensors}
		>
			<div className="space-y-8">
				{GROUP_ORDER.map((key) => {
					const gifts = groups[key];
					if (gifts.length === 0) return null;
					return (
						<section key={key}>
							<h2 className="mb-3 font-medium text-gray-500 text-xs uppercase tracking-wide">
								{GROUP_LABELS[key]} ({gifts.length})
							</h2>
							<SortableContext
								items={gifts.map((g) => g.id)}
								strategy={verticalListSortingStrategy}
							>
								<ul className="space-y-2">
									{gifts.map((gift) => (
										<SortableGiftRow gift={gift} key={gift.id} />
									))}
								</ul>
							</SortableContext>
						</section>
					);
				})}
			</div>
		</DndContext>
	);
}
