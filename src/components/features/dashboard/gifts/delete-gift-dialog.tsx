"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { deleteGiftAction } from "@/app/(protected)/dashboard/wishlists/[id]/gifts/actions";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	wishlistId: string;
	giftId: string;
	giftName: string;
	purchasedQuantity: number;
};

export function DeleteGiftDialog({
	open,
	onOpenChange,
	wishlistId,
	giftId,
	giftName,
	purchasedQuantity,
}: Props) {
	const [isPending, startTransition] = useTransition();
	const hasPurchases = purchasedQuantity > 0;

	function handleDelete() {
		startTransition(async () => {
			try {
				await deleteGiftAction(wishlistId, giftId);
				onOpenChange(false);
			} catch {
				toast.error("No pudimos eliminar el regalo. Intenta de nuevo.");
			}
		});
	}

	return (
		<AlertDialog onOpenChange={onOpenChange} open={open}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						¿Eliminar &ldquo;{giftName}&rdquo;?
					</AlertDialogTitle>
					<AlertDialogDescription>
						{hasPurchases ? (
							<>
								<strong>
									Este regalo ya tiene {purchasedQuantity} compra
									{purchasedQuantity !== 1 ? "s" : ""}.
								</strong>{" "}
								Los compradores no serán notificados si lo eliminas. Esta acción
								no se puede deshacer.
							</>
						) : (
							"Esta acción no se puede deshacer."
						)}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
					<AlertDialogAction
						disabled={isPending}
						onClick={handleDelete}
						variant="destructive"
					>
						{isPending ? "Eliminando…" : "Eliminar"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
