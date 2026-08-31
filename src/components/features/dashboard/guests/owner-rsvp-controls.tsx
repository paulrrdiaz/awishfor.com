"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
	recordOwnerRsvpAction,
	reopenOwnerRsvpAction,
} from "@/app/(protected)/dashboard/wishlists/[id]/guests/actions";
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
import { cn } from "@/lib/utils";
import type { DashboardInviteViewModel } from "@/server/mappers/view-models";

type Status = "confirmed" | "declined";

type Props = {
	invite: DashboardInviteViewModel;
	wishlistId: string;
};

export function OwnerRsvpControls({ invite, wishlistId }: Props) {
	const [editing, setEditing] = useState(false);
	const [reopenOpen, setReopenOpen] = useState(false);
	const [isPending, startTransition] = useTransition();
	const [status, setStatus] = useState<Status>(
		invite.status === "declined" ? "declined" : "confirmed",
	);
	const [extraStatuses, setExtraStatuses] = useState<Record<string, Status>>(
		() =>
			Object.fromEntries(
				invite.extraGuests.map((extra) => [
					extra.id,
					extra.status === "declined" ? "declined" : "confirmed",
				]),
			),
	);
	const locked = Boolean(invite.responseLockedAt);

	function save() {
		startTransition(async () => {
			try {
				await recordOwnerRsvpAction(wishlistId, {
					inviteId: invite.id,
					status,
					extraGuests: invite.extraGuests.map((extra) => ({
						id: extra.id,
						status:
							status === "declined"
								? "declined"
								: (extraStatuses[extra.id] ?? "confirmed"),
					})),
				});
				setEditing(false);
				toast.success("Respuesta registrada y enlace bloqueado");
			} catch {
				toast.error("No pudimos guardar la respuesta.");
			}
		});
	}

	function reopen() {
		startTransition(async () => {
			try {
				await reopenOwnerRsvpAction(wishlistId, invite.id);
				setReopenOpen(false);
				toast.success("Enlace reabierto para respuesta del invitado");
			} catch {
				toast.error("No pudimos reabrir la respuesta.");
			}
		});
	}

	return (
		<div className="space-y-2">
			{locked && (
				<p className="text-muted-foreground text-xs">
					Respuesta registrada por el anfitrión
				</p>
			)}
			{editing ? (
				<div className="space-y-3 rounded-lg border bg-muted/30 p-3">
					<div className="flex gap-2">
						{(["confirmed", "declined"] as const).map((choice) => (
							<Button
								className={cn("flex-1", status !== choice && "opacity-60")}
								key={choice}
								onClick={() => setStatus(choice)}
								size="sm"
								type="button"
								variant={choice === "confirmed" ? "default" : "outline"}
							>
								{choice === "confirmed" ? "Asiste" : "No asiste"}
							</Button>
						))}
					</div>
					{status === "confirmed" && invite.extraGuests.length > 0 && (
						<div className="space-y-2">
							{invite.extraGuests.map((extra, index) => (
								<div
									className="flex items-center justify-between gap-2 text-xs"
									key={extra.id}
								>
									<span>{extra.name ?? `Acompañante ${index + 1}`}</span>
									<Button
										onClick={() =>
											setExtraStatuses((current) => ({
												...current,
												[extra.id]:
													current[extra.id] === "declined"
														? "confirmed"
														: "declined",
											}))
										}
										size="sm"
										type="button"
										variant="outline"
									>
										{extraStatuses[extra.id] === "declined"
											? "No asiste"
											: "Asiste"}
									</Button>
								</div>
							))}
						</div>
					)}
					<div className="flex gap-2">
						<Button disabled={isPending} onClick={save} size="sm" type="button">
							{isPending ? "Guardando…" : "Guardar y bloquear"}
						</Button>
						<Button
							disabled={isPending}
							onClick={() => setEditing(false)}
							size="sm"
							type="button"
							variant="ghost"
						>
							Cancelar
						</Button>
					</div>
				</div>
			) : (
				<div className="flex gap-2">
					<Button
						onClick={() => setEditing(true)}
						size="sm"
						type="button"
						variant="outline"
					>
						{locked ? "Corregir respuesta" : "Registrar respuesta"}
					</Button>
					{locked && (
						<Button
							onClick={() => setReopenOpen(true)}
							size="sm"
							type="button"
							variant="ghost"
						>
							Reabrir
						</Button>
					)}
				</div>
			)}

			<AlertDialog onOpenChange={setReopenOpen} open={reopenOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>¿Reabrir respuesta?</AlertDialogTitle>
						<AlertDialogDescription>
							El invitado podrá cambiar su respuesta desde su enlace
							personalizado.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
						<AlertDialogAction disabled={isPending} onClick={reopen}>
							{isPending ? "Reabriendo…" : "Reabrir respuesta"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
