"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";

type Props = {
	giftId: string;
	giftName: string;
	purchasedQuantity: number;
};

export function DeleteGiftDialog({
	giftId,
	giftName,
	purchasedQuantity,
}: Props) {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const hasPurchases = purchasedQuantity > 0;

	const deleteMutation = api.gift.delete.useMutation({
		onSuccess: () => {
			setOpen(false);
			router.refresh();
		},
	});

	return (
		<AlertDialog onOpenChange={setOpen} open={open}>
			<AlertDialogTrigger
				render={
					<Button size="sm" variant="ghost">
						Eliminar
					</Button>
				}
			/>
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
					<AlertDialogCancel>Cancelar</AlertDialogCancel>
					<AlertDialogAction
						disabled={deleteMutation.isPending}
						onClick={() => deleteMutation.mutate({ giftId })}
						variant="destructive"
					>
						{deleteMutation.isPending ? "Eliminando…" : "Eliminar"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
