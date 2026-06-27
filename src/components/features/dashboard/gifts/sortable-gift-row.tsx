"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import type { DashboardGiftRowViewModel } from "@/server/mappers/view-models";
import { GiftRow } from "./gift-row";

type Props = { gift: DashboardGiftRowViewModel };

export function SortableGiftRow({ gift }: Props) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: gift.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<li
			className={isDragging ? "opacity-50" : ""}
			ref={setNodeRef}
			style={style}
			{...attributes}
		>
			<div className="flex items-start gap-1">
				<button
					{...listeners}
					aria-label="Reordenar"
					className="mt-4 shrink-0 cursor-grab p-1 text-gray-300 hover:text-gray-400 active:cursor-grabbing"
					type="button"
				>
					<GripVertical className="h-4 w-4" />
				</button>
				<div className="min-w-0 flex-1">
					<GiftRow gift={gift} />
				</div>
			</div>
		</li>
	);
}
