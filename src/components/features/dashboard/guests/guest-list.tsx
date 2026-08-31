"use client";

import { useState } from "react";
import { GuestRow } from "@/components/features/dashboard/guests/guest-row";
import { GuestSheet } from "@/components/features/dashboard/guests/guest-sheet";
import type { DashboardInviteViewModel } from "@/server/mappers/view-models";

type Props = {
	wishlistId: string;
	invites: (DashboardInviteViewModel & { inviteUrl: string })[];
	isOwner?: boolean;
};

export function GuestList({ wishlistId, invites, isOwner = false }: Props) {
	const [editingInvite, setEditingInvite] =
		useState<DashboardInviteViewModel | null>(null);

	return (
		<>
			<ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
				{invites.map((invite) => (
					<li className="h-full" key={invite.id}>
						<GuestRow
							invite={invite}
							inviteUrl={invite.inviteUrl}
							isOwner={isOwner}
							onEdit={() => setEditingInvite(invite)}
							wishlistId={wishlistId}
						/>
					</li>
				))}
			</ul>
			<GuestSheet
				invite={editingInvite}
				onOpenChange={(open) => {
					if (!open) setEditingInvite(null);
				}}
				open={!!editingInvite}
				wishlistId={wishlistId}
			/>
		</>
	);
}
