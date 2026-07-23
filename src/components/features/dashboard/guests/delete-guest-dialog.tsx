"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { deleteInviteAction } from "@/app/(protected)/dashboard/wishlists/[id]/guests/actions";
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
	inviteId: string;
	primaryName: string;
};

export function DeleteGuestDialog({
	open,
	onOpenChange,
	wishlistId,
	inviteId,
	primaryName,
}: Props) {
	const [isPending, startTransition] = useTransition();

	function handleDelete() {
		startTransition(async () => {
			try {
				await deleteInviteAction(wishlistId, inviteId);
				onOpenChange(false);
			} catch {
				toast.error("No pudimos eliminar el invitado. Intenta de nuevo.");
			}
		});
	}

	return (
		<AlertDialog onOpenChange={onOpenChange} open={open}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						¿Eliminar a &ldquo;{primaryName}&rdquo;?
					</AlertDialogTitle>
					<AlertDialogDescription>
						Se eliminará su invitación y su enlace personalizado dejará de
						funcionar. Esta acción no se puede deshacer.
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
