"use client";

import { useState } from "react";
import { GuestRow } from "@/components/features/dashboard/guests/guest-row";
import { GuestSheet } from "@/components/features/dashboard/guests/guest-sheet";
import type { DashboardInviteViewModel } from "@/server/mappers/view-models";

type Props = {
	wishlistId: string;
	invites: (DashboardInviteViewModel & { inviteUrl: string })[];
};

export function GuestList({ wishlistId, invites }: Props) {
	const [editingInvite, setEditingInvite] =
		useState<DashboardInviteViewModel | null>(null);

	return (
		<>
			<ul className="space-y-2.5">
				{invites.map((invite) => (
					<li key={invite.id}>
						<GuestRow
							invite={invite}
							inviteUrl={invite.inviteUrl}
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
