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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api, type RouterOutputs } from "@/trpc/react";

type PendingInvitation =
	RouterOutputs["collaboration"]["list"]["invitations"][number];

type Props = {
	wishlistId: string;
	invitation: PendingInvitation;
	onChanged: () => void;
};

const dateFormatter = new Intl.DateTimeFormat("es-PE", {
	day: "2-digit",
	month: "short",
	year: "numeric",
});

export function PendingInvitationRow({
	wishlistId,
	invitation,
	onChanged,
}: Props) {
	const [confirmOpen, setConfirmOpen] = useState(false);

	const resendMutation = api.collaboration.resendInvitation.useMutation({
		onSuccess: () => {
			toast.success("Invitación reenviada");
			onChanged();
		},
		onError: (error) => {
			if (error.data?.code === "TOO_MANY_REQUESTS") {
				toast.error("Espera un momento antes de reenviar de nuevo.");
			} else {
				toast.error("No pudimos reenviar la invitación.");
			}
		},
	});

	const revokeMutation = api.collaboration.revokeInvitation.useMutation({
		onSuccess: () => {
			toast.success("Invitación cancelada");
			setConfirmOpen(false);
			onChanged();
		},
		onError: () => toast.error("No pudimos cancelar la invitación."),
	});

	return (
		<div className="flex items-center justify-between gap-3 rounded-xl border border-border border-dashed bg-card p-3.5">
			<div className="min-w-0">
				<div className="flex flex-wrap items-center gap-2">
					<p className="truncate font-medium text-sm">{invitation.email}</p>
					<Badge variant="secondary">Pendiente</Badge>
				</div>
				<p className="truncate text-muted-foreground text-xs">
					{invitation.lastSentAt
						? `Enviada el ${dateFormatter.format(new Date(invitation.lastSentAt))}`
						: "Aún no se ha enviado"}
				</p>
			</div>

			<div className="flex shrink-0 items-center gap-1">
				<Button
					disabled={resendMutation.isPending}
					onClick={() =>
						resendMutation.mutate({ wishlistId, invitationId: invitation.id })
					}
					size="sm"
					type="button"
					variant="ghost"
				>
					{resendMutation.isPending ? "Enviando…" : "Reenviar"}
				</Button>

				<AlertDialog onOpenChange={setConfirmOpen} open={confirmOpen}>
					<Button
						onClick={() => setConfirmOpen(true)}
						size="sm"
						type="button"
						variant="ghost"
					>
						Cancelar
					</Button>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>¿Cancelar esta invitación?</AlertDialogTitle>
							<AlertDialogDescription>
								El enlace que se envió a {invitation.email} dejará de funcionar.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel disabled={revokeMutation.isPending}>
								Volver
							</AlertDialogCancel>
							<AlertDialogAction
								disabled={revokeMutation.isPending}
								onClick={() =>
									revokeMutation.mutate({
										wishlistId,
										invitationId: invitation.id,
									})
								}
								variant="destructive"
							>
								{revokeMutation.isPending
									? "Cancelando…"
									: "Cancelar invitación"}
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
		</div>
	);
}
