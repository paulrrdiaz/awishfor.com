"use client";

import { formatDistanceToNowStrict } from "date-fns";
import { es } from "date-fns/locale";
import { BellIcon, CheckIcon, XIcon } from "lucide-react";
import Link from "next/link";
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
import type { DashboardInviteViewModel } from "@/server/mappers/view-models";

type Props = {
	invite: DashboardInviteViewModel;
	wishlistId: string;
};

export function MobileGuestRsvpCard({ invite, wishlistId }: Props) {
	const [isPending, startTransition] = useTransition();
	const [reopenOpen, setReopenOpen] = useState(false);
	const hasResponded = invite.status !== "pending";

	function record(status: "confirmed" | "declined") {
		startTransition(async () => {
			try {
				await recordOwnerRsvpAction(wishlistId, {
					inviteId: invite.id,
					status,
					extraGuests: invite.extraGuests.map((extra) => ({
						id: extra.id,
						status,
					})),
				});
				toast.success("Respuesta registrada");
			} catch {
				toast.error("No pudimos registrar la respuesta.");
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

	if (hasResponded) {
		const respondedAgo = invite.respondedAt
			? formatDistanceToNowStrict(new Date(invite.respondedAt), {
					addSuffix: true,
					locale: es,
				})
			: null;
		const who =
			invite.responseSource === "guest"
				? "El invitado respondió"
				: "Registrado por ti";

		return (
			<div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs md:hidden">
				<span className="text-muted-foreground">
					{who}
					{respondedAgo ? ` ${respondedAgo}` : ""}
				</span>
				<button
					className="shrink-0 font-medium text-foreground underline-offset-2 hover:underline"
					onClick={() => setReopenOpen(true)}
					type="button"
				>
					Deshacer
				</button>
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
							<AlertDialogCancel disabled={isPending}>
								Cancelar
							</AlertDialogCancel>
							<AlertDialogAction disabled={isPending} onClick={reopen}>
								{isPending ? "Reabriendo…" : "Reabrir respuesta"}
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-2 md:hidden">
			<div className="flex gap-2">
				<Button
					className="flex-1"
					disabled={isPending}
					onClick={() => record("confirmed")}
					size="sm"
					type="button"
				>
					<CheckIcon /> Asistirá
				</Button>
				<Button
					className="flex-1"
					disabled={isPending}
					onClick={() => record("declined")}
					size="sm"
					type="button"
					variant="outline"
				>
					<XIcon /> No podrá
				</Button>
			</div>
			<Button
				asChild
				className="w-full"
				size="sm"
				type="button"
				variant="ghost"
			>
				<Link
					href={`/dashboard/wishlists/${wishlistId}/share?guest=${invite.id}&purpose=reminder`}
				>
					<BellIcon /> Recordar
				</Link>
			</Button>
		</div>
	);
}
