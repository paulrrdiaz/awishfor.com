"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DashboardGiftRowViewModel } from "@/server/mappers/view-models";
import { GiftRow } from "./gift-row";

type Props = {
	gift: DashboardGiftRowViewModel;
	wishlistId: string;
	categoryName?: string | null;
	sortable: boolean;
	onEdit: () => void;
};

export function SortableGiftRow({
	gift,
	wishlistId,
	categoryName,
	sortable,
	onEdit,
}: Props) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: gift.id, disabled: !sortable });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<li
			className={isDragging ? "opacity-50" : ""}
			ref={setNodeRef}
			style={style}
			{...(sortable ? attributes : {})}
		>
			<div className="flex items-center gap-1">
				<button
					{...(sortable ? listeners : {})}
					aria-hidden={!sortable}
					className={cn(
						"shrink-0 p-1 text-muted-foreground",
						sortable
							? "cursor-grab hover:text-foreground active:cursor-grabbing"
							: "cursor-not-allowed opacity-30",
					)}
					disabled={!sortable}
					tabIndex={sortable ? 0 : -1}
					title={
						sortable
							? "Arrastrar para reordenar"
							: "Cambia a orden manual para reordenar"
					}
					type="button"
				>
					<GripVertical className="size-4" />
				</button>
				<div className="min-w-0 flex-1">
					<GiftRow
						categoryName={categoryName}
						gift={gift}
						onEdit={onEdit}
						wishlistId={wishlistId}
					/>
				</div>
			</div>
		</li>
	);
}
