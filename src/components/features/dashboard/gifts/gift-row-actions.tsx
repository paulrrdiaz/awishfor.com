"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { setGiftVisibilityAction } from "@/app/(protected)/dashboard/wishlists/[id]/gifts/actions";
import { GiftActionSheet } from "@/components/layouts/dashboard/mobile/gift-action-sheet";
import { Button } from "@/components/ui/button";
import type { DashboardGiftRowViewModel } from "@/server/mappers/view-models";
import { PurchaseDrawer } from "../purchases/purchase-drawer";
import { GiftRowMenu } from "./gift-row-menu";

type Props = {
	gift: DashboardGiftRowViewModel;
	wishlistId: string;
	onEdit: () => void;
};

export function GiftRowActions({ gift, wishlistId, onEdit }: Props) {
	const [isPending, startTransition] = useTransition();
	const [purchaseDrawerOpen, setPurchaseDrawerOpen] = useState(false);
	const isHidden = gift.visibilityStatus === "hidden";

	function handleShow() {
		startTransition(async () => {
			try {
				await setGiftVisibilityAction(wishlistId, gift.id, "available");
			} catch {
				toast.error("No pudimos actualizar el regalo.");
			}
		});
	}

	return (
		<>
			<div className="hidden shrink-0 items-center gap-1 md:flex">
				{isHidden ? (
					<Button
						className="text-secondary"
						disabled={isPending}
						onClick={handleShow}
						size="sm"
						type="button"
						variant="ghost"
					>
						Mostrar
					</Button>
				) : (
					<Button onClick={onEdit} size="sm" type="button" variant="ghost">
						Editar
					</Button>
				)}
				<GiftRowMenu
					gift={gift}
					onEdit={onEdit}
					onOpenPurchases={() => setPurchaseDrawerOpen(true)}
					wishlistId={wishlistId}
				/>
			</div>
			<div className="shrink-0 md:hidden">
				<GiftActionSheet
					gift={gift}
					onEdit={onEdit}
					onOpenPurchases={() => setPurchaseDrawerOpen(true)}
					wishlistId={wishlistId}
				/>
			</div>
			<PurchaseDrawer
				giftId={gift.id}
				giftName={gift.name}
				onClose={() => setPurchaseDrawerOpen(false)}
				open={purchaseDrawerOpen}
				remainingQuantity={gift.remainingQuantity}
			/>
		</>
	);
}
