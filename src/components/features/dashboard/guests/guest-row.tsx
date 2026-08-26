"use client";

import { Eye, MoreHorizontal, Pencil, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { CopyInviteUrlButton } from "@/components/features/dashboard/guests/copy-invite-url-button";
import { DeleteGuestDialog } from "@/components/features/dashboard/guests/delete-guest-dialog";
import { RsvpStatusBadge } from "@/components/features/dashboard/guests/rsvp-status-badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DashboardInviteViewModel } from "@/server/mappers/view-models";

type Props = {
	invite: DashboardInviteViewModel;
	wishlistId: string;
	inviteUrl: string;
	onEdit: () => void;
};

function confirmedCount(invite: DashboardInviteViewModel): number {
	const primaryConfirmed = invite.status === "confirmed" ? 1 : 0;
	const extrasConfirmed = invite.extraGuests.filter(
		(extra) => extra.status === "confirmed",
	).length;
	return primaryConfirmed + extrasConfirmed;
}

function formatLastViewedAt(value: string | null): string {
	if (!value) return "Sin vistas aún";
	return new Intl.DateTimeFormat("es-PE", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(value));
}

export function GuestRow({ invite, wishlistId, inviteUrl, onEdit }: Props) {
	const [deleteOpen, setDeleteOpen] = useState(false);
	const hasResponded = invite.status !== "pending";
	const hasViewAnalytics = invite.viewCount !== undefined;

	return (
		<div className="flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-3.5">
			<div className="flex items-start justify-between gap-2">
				<div className="min-w-0 flex-1">
					<div className="flex flex-wrap items-center gap-2">
						<span className="truncate font-semibold text-sm">
							{invite.primaryName}
						</span>
						<RsvpStatusBadge status={invite.status} />
					</div>
					<div className="mt-1 flex items-center gap-1.5 text-muted-foreground text-xs">
						<Users className="size-3.5" />
						{hasResponded
							? `${confirmedCount(invite)} de ${invite.partySize} confirmados`
							: `${invite.partySize} ${invite.partySize === 1 ? "persona" : "personas"}`}
					</div>
				</div>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							aria-label="Más acciones"
							className="shrink-0"
							size="icon-sm"
							variant="ghost"
						>
							<MoreHorizontal />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem
							onSelect={(event) => {
								event.preventDefault();
								setDeleteOpen(true);
							}}
							variant="destructive"
						>
							<Trash2 /> Eliminar
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			{hasViewAnalytics && (
				<div className="flex items-center gap-1.5 text-muted-foreground text-xs">
					<Eye className="size-3.5" />
					<span>
						{invite.viewCount} {invite.viewCount === 1 ? "vista" : "vistas"}
					</span>
					<span aria-hidden="true">·</span>
					<span>{formatLastViewedAt(invite.lastViewedAt ?? null)}</span>
				</div>
			)}

			<div className="mt-auto flex items-center justify-between gap-2 border-border border-t pt-3">
				<CopyInviteUrlButton url={inviteUrl} />
				<Button onClick={onEdit} size="sm" type="button" variant="ghost">
					<Pencil /> Editar
				</Button>
			</div>

			<DeleteGuestDialog
				inviteId={invite.id}
				onOpenChange={setDeleteOpen}
				open={deleteOpen}
				primaryName={invite.primaryName}
				wishlistId={wishlistId}
			/>
		</div>
	);
}
