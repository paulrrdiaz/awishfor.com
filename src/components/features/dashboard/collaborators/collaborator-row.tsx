"use client";

import { useState } from "react";
import { toast } from "sonner";
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
import { Button } from "@/components/ui/button";
import { api, type RouterOutputs } from "@/trpc/react";

type Collaborator = RouterOutputs["collaboration"]["list"]["members"][number];

type Props = {
	wishlistId: string;
	member: Collaborator;
	onRemoved: () => void;
};

export function CollaboratorRow({ wishlistId, member, onRemoved }: Props) {
	const [confirmOpen, setConfirmOpen] = useState(false);

	const removeMutation = api.collaboration.removeMember.useMutation({
		onSuccess: () => {
			toast.success("Colaborador eliminado");
			setConfirmOpen(false);
			onRemoved();
		},
		onError: () => toast.error("No pudimos eliminar al colaborador."),
	});

	return (
		<div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3.5">
			<div className="min-w-0">
				<p className="truncate font-medium text-sm">{member.name}</p>
				<p className="truncate text-muted-foreground text-xs">{member.email}</p>
			</div>

			<AlertDialog onOpenChange={setConfirmOpen} open={confirmOpen}>
				<Button
					onClick={() => setConfirmOpen(true)}
					size="sm"
					type="button"
					variant="ghost"
				>
					Quitar
				</Button>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							¿Quitar a &ldquo;{member.name}&rdquo;?
						</AlertDialogTitle>
						<AlertDialogDescription>
							Perderá acceso a esta wishlist de inmediato. Los regalos,
							categorías e invitados que haya creado se conservan.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={removeMutation.isPending}>
							Cancelar
						</AlertDialogCancel>
						<AlertDialogAction
							disabled={removeMutation.isPending}
							onClick={() =>
								removeMutation.mutate({ wishlistId, memberId: member.id })
							}
							variant="destructive"
						>
							{removeMutation.isPending ? "Quitando…" : "Quitar"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
