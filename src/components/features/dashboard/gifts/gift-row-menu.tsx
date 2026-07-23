"use client";

import {
	Copy,
	Eye,
	EyeOff,
	MoreHorizontal,
	Pencil,
	Receipt,
	Star,
	StarOff,
	Trash2,
} from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
	duplicateGiftAction,
	setGiftPriorityAction,
	setGiftVisibilityAction,
} from "@/app/(protected)/dashboard/wishlists/[id]/gifts/actions";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DashboardGiftRowViewModel } from "@/server/mappers/view-models";
import { DeleteGiftDialog } from "./delete-gift-dialog";

type Props = {
	gift: DashboardGiftRowViewModel;
	wishlistId: string;
	onEdit: () => void;
	onOpenPurchases: () => void;
};

export function GiftRowMenu({
	gift,
	wishlistId,
	onEdit,
	onOpenPurchases,
}: Props) {
	const [, startTransition] = useTransition();
	const [deleteOpen, setDeleteOpen] = useState(false);
	const isHidden = gift.visibilityStatus === "hidden";
	const isHighPriority = gift.priority === "high";

	function handleDuplicate() {
		startTransition(async () => {
			try {
				await duplicateGiftAction(wishlistId, gift.id);
				toast.success("Regalo duplicado");
			} catch {
				toast.error("No pudimos duplicar el regalo.");
			}
		});
	}

	function handleTogglePriority() {
		startTransition(async () => {
			try {
				await setGiftPriorityAction(
					wishlistId,
					gift.id,
					isHighPriority ? "medium" : "high",
				);
			} catch {
				toast.error("No pudimos actualizar el regalo.");
			}
		});
	}

	function handleToggleVisibility() {
		startTransition(async () => {
			try {
				await setGiftVisibilityAction(
					wishlistId,
					gift.id,
					isHidden ? "available" : "hidden",
				);
			} catch {
				toast.error("No pudimos actualizar el regalo.");
			}
		});
	}

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button aria-label="Más acciones" size="icon-sm" variant="ghost">
						<MoreHorizontal />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem onSelect={onEdit}>
						<Pencil /> Editar
					</DropdownMenuItem>
					<DropdownMenuItem onSelect={handleDuplicate}>
						<Copy /> Duplicar
					</DropdownMenuItem>
					<DropdownMenuItem onSelect={onOpenPurchases}>
						<Receipt /> Ver compras
					</DropdownMenuItem>
					<DropdownMenuItem onSelect={handleTogglePriority}>
						{isHighPriority ? <StarOff /> : <Star />}
						{isHighPriority ? "Quitar infaltable" : "Marcar infaltable"}
					</DropdownMenuItem>
					<DropdownMenuItem onSelect={handleToggleVisibility}>
						{isHidden ? <Eye /> : <EyeOff />}
						{isHidden ? "Mostrar" : "Ocultar"}
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onSelect={(event) => {
							event.preventDefault();
							setDeleteOpen(true);
						}}
						variant="destructive"
					>
						<Trash2 /> Eliminar
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			<DeleteGiftDialog
				giftId={gift.id}
				giftName={gift.name}
				onOpenChange={setDeleteOpen}
				open={deleteOpen}
				purchasedQuantity={gift.purchasedQuantity}
				wishlistId={wishlistId}
			/>
		</>
	);
}
