"use client";

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
	purchaseId: string;
	guestName: string;
	onSuccess: () => void;
};

export function DeletePurchaseDialog({
	purchaseId,
	guestName,
	onSuccess,
}: Props) {
	const [open, setOpen] = useState(false);

	const deleteMutation = api.purchase.delete.useMutation({
		onSuccess: () => {
			setOpen(false);
			onSuccess();
		},
	});

	return (
		<AlertDialog onOpenChange={setOpen} open={open}>
			<AlertDialogTrigger asChild>
				<Button size="sm" variant="ghost">
					Eliminar
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						¿Eliminar compra de &ldquo;{guestName}&rdquo;?
					</AlertDialogTitle>
					<AlertDialogDescription>
						Esta acción no se puede deshacer.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancelar</AlertDialogCancel>
					<AlertDialogAction
						disabled={deleteMutation.isPending}
						onClick={() => deleteMutation.mutate({ purchaseId })}
						variant="destructive"
					>
						{deleteMutation.isPending ? "Eliminando…" : "Eliminar"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
