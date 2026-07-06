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

type Props = {
	categoryName: string;
	giftCount: number;
	isPending: boolean;
	onDelete: () => Promise<void>;
};

export function DeleteCategoryDialog({
	categoryName,
	giftCount,
	isPending,
	onDelete,
}: Props) {
	const [open, setOpen] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleDelete = async () => {
		try {
			setError(null);
			await onDelete();
			setOpen(false);
		} catch (err) {
			setError(err instanceof Error ? err.message : "No se pudo eliminar.");
		}
	};

	return (
		<AlertDialog onOpenChange={setOpen} open={open}>
			<AlertDialogTrigger asChild>
				<Button size="sm" type="button" variant="ghost">
					Eliminar
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						¿Eliminar &ldquo;{categoryName}&rdquo;?
					</AlertDialogTitle>
					<AlertDialogDescription>
						{giftCount} regalo{giftCount !== 1 ? "s" : ""} quedará
						{giftCount !== 1 ? "n" : ""} sin categoría. Los regalos no se
						eliminarán.
					</AlertDialogDescription>
				</AlertDialogHeader>
				{error && <p className="text-red-600 text-sm">{error}</p>}
				<AlertDialogFooter>
					<AlertDialogCancel>Cancelar</AlertDialogCancel>
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
