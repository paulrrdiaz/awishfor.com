"use client";

import {
	Copy,
	Eye,
	EyeOff,
	type LucideIcon,
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
	deleteGiftAction,
	duplicateGiftAction,
	setGiftPriorityAction,
	setGiftVisibilityAction,
} from "@/app/(protected)/dashboard/wishlists/[id]/gifts/actions";
import { DeleteGiftDialog } from "@/components/features/dashboard/gifts/delete-gift-dialog";
import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerHandle,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import type {
	GiftPriority,
	GiftVisibilityStatus,
} from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";
import type { DashboardGiftRowViewModel } from "@/server/mappers/view-models";

const UNDO_DURATION_MS = 5000;

type Props = {
	gift: DashboardGiftRowViewModel;
	wishlistId: string;
	onEdit: () => void;
	onOpenPurchases: () => void;
};

function ActionItem({
	icon: Icon,
	label,
	onSelect,
	destructive,
}: {
	icon: LucideIcon;
	label: string;
	onSelect: () => void;
	destructive?: boolean;
}) {
	return (
		<DrawerClose asChild>
			<button
				className={cn(
					"flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left font-medium text-sm",
					destructive ? "text-destructive" : "text-foreground",
				)}
				onClick={onSelect}
				type="button"
			>
				<Icon className="size-4.5 shrink-0" />
				{label}
			</button>
		</DrawerClose>
	);
}

export function GiftActionSheet({
	gift,
	wishlistId,
	onEdit,
	onOpenPurchases,
}: Props) {
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [, startTransition] = useTransition();
	const isHidden = gift.visibilityStatus === "hidden";
	const isHighPriority = gift.priority === "high";

	function handleDuplicate() {
		startTransition(async () => {
			try {
				const duplicate = await duplicateGiftAction(wishlistId, gift.id);
				toast.success("Regalo duplicado", {
					action: {
						label: "Deshacer",
						onClick: () => {
							void deleteGiftAction(wishlistId, duplicate.id);
						},
					},
					duration: UNDO_DURATION_MS,
				});
			} catch {
				toast.error("No pudimos duplicar el regalo.");
			}
		});
	}

	function handleTogglePriority() {
		const previousPriority = gift.priority as GiftPriority;
		const nextPriority: GiftPriority = isHighPriority ? "medium" : "high";
		startTransition(async () => {
			try {
				await setGiftPriorityAction(wishlistId, gift.id, nextPriority);
				toast.success(
					nextPriority === "high"
						? "Marcado como infaltable"
						: "Ya no es infaltable",
					{
						action: {
							label: "Deshacer",
							onClick: () => {
								void setGiftPriorityAction(
									wishlistId,
									gift.id,
									previousPriority,
								);
							},
						},
						duration: UNDO_DURATION_MS,
					},
				);
			} catch {
				toast.error("No pudimos actualizar el regalo.");
			}
		});
	}

	function handleToggleVisibility() {
		const previousVisibility = gift.visibilityStatus as GiftVisibilityStatus;
		const nextVisibility: GiftVisibilityStatus = isHidden
			? "available"
			: "hidden";
		startTransition(async () => {
			try {
				await setGiftVisibilityAction(wishlistId, gift.id, nextVisibility);
				toast.success(isHidden ? "Regalo visible de nuevo" : "Regalo oculto", {
					action: {
						label: "Deshacer",
						onClick: () => {
							void setGiftVisibilityAction(
								wishlistId,
								gift.id,
								previousVisibility,
							);
						},
					},
					duration: UNDO_DURATION_MS,
				});
			} catch {
				toast.error("No pudimos actualizar el regalo.");
			}
		});
	}

	return (
		<>
			<Drawer>
				<DrawerTrigger asChild>
					<Button
						aria-label="Más acciones"
						size="icon-sm"
						type="button"
						variant="ghost"
					>
						<MoreHorizontal />
					</Button>
				</DrawerTrigger>
				<DrawerContent aria-label={`Acciones para ${gift.name}`}>
					<DrawerHandle />
					<DrawerHeader>
						<DrawerTitle className="truncate">{gift.name}</DrawerTitle>
					</DrawerHeader>
					<ul className="flex flex-col gap-0.5 p-2 pt-0">
						<li>
							<ActionItem
								icon={Pencil}
								label="Editar regalo"
								onSelect={onEdit}
							/>
						</li>
						<li>
							<ActionItem
								icon={Copy}
								label="Duplicar"
								onSelect={handleDuplicate}
							/>
						</li>
						<li>
							<ActionItem
								icon={Receipt}
								label="Ver compras"
								onSelect={onOpenPurchases}
							/>
						</li>
						<li>
							<ActionItem
								icon={isHighPriority ? StarOff : Star}
								label={
									isHighPriority
										? "Quitar infaltable"
										: "Marcar como infaltable"
								}
								onSelect={handleTogglePriority}
							/>
						</li>
						<li>
							<ActionItem
								icon={isHidden ? Eye : EyeOff}
								label={
									isHidden
										? "Mostrar en la lista pública"
										: "Ocultar de la lista pública"
								}
								onSelect={handleToggleVisibility}
							/>
						</li>
						<li className="mt-1 border-border border-t pt-1">
							<ActionItem
								destructive
								icon={Trash2}
								label="Eliminar"
								onSelect={() => setDeleteOpen(true)}
							/>
						</li>
					</ul>
				</DrawerContent>
			</Drawer>
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
