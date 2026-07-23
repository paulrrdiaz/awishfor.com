"use client";

import { MoreHorizontal, Pencil, Trash2, Users } from "lucide-react";
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

export function GuestRow({ invite, wishlistId, inviteUrl, onEdit }: Props) {
	const [deleteOpen, setDeleteOpen] = useState(false);

	return (
		<div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3.5 sm:flex-row sm:items-center sm:justify-between">
			<div className="min-w-0 flex-1">
				<div className="flex flex-wrap items-center gap-2">
					<span className="truncate font-semibold text-sm">
						{invite.primaryName}
					</span>
					<RsvpStatusBadge status={invite.status} />
				</div>
				<div className="mt-1 flex items-center gap-1.5 text-muted-foreground text-xs">
					<Users className="size-3.5" />
					{invite.partySize} {invite.partySize === 1 ? "persona" : "personas"}
				</div>
			</div>

			<div className="flex shrink-0 items-center gap-2">
				<CopyInviteUrlButton url={inviteUrl} />
				<Button onClick={onEdit} size="sm" type="button" variant="ghost">
					<Pencil /> Editar
				</Button>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button aria-label="Más acciones" size="icon-sm" variant="ghost">
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
