"use client";

import { UserPlus } from "lucide-react";
import { useState } from "react";
import { CollaboratorRow } from "@/components/features/dashboard/collaborators/collaborator-row";
import { PendingInvitationRow } from "@/components/features/dashboard/collaborators/pending-invitation-row";
import { ShareByEmailDialog } from "@/components/features/dashboard/collaborators/share-by-email-dialog";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";

type Props = {
	wishlistId: string;
};

export function CollaboratorsPanel({ wishlistId }: Props) {
	const utils = api.useUtils();
	const [shareOpen, setShareOpen] = useState(false);
	const collaboratorsQuery = api.collaboration.list.useQuery({ wishlistId });

	const refresh = () => utils.collaboration.list.invalidate({ wishlistId });

	if (collaboratorsQuery.isLoading) {
		return (
			<div className="rounded-2xl border border-border px-6 py-12 text-center text-muted-foreground text-sm">
				Cargando colaboradores…
			</div>
		);
	}

	if (collaboratorsQuery.error || !collaboratorsQuery.data) {
		return (
			<div className="rounded-2xl border border-destructive/30 px-6 py-12 text-center text-destructive text-sm">
				No pudimos cargar los colaboradores.
			</div>
		);
	}

	const { members, invitations } = collaboratorsQuery.data;
	const isEmpty = members.length === 0 && invitations.length === 0;

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between gap-4">
				<div>
					<h1 className="font-heading font-semibold text-2xl">Colaboradores</h1>
					<p className="mt-1 text-muted-foreground text-sm">
						Comparte esta wishlist para que alguien más te ayude a organizarla.
					</p>
				</div>
				<Button onClick={() => setShareOpen(true)} type="button">
					<UserPlus /> Compartir
				</Button>
			</div>

			{isEmpty ? (
				<div className="rounded-2xl border border-border border-dashed bg-card px-6 py-12 text-center">
					<p className="font-medium text-sm">
						Aún no has compartido esta lista
					</p>
					<p className="mt-1 text-muted-foreground text-sm">
						Comparte por correo para que alguien más pueda editarla contigo.
					</p>
				</div>
			) : (
				<div className="space-y-6">
					{members.length > 0 && (
						<div className="space-y-3">
							<h2 className="font-medium text-muted-foreground text-sm">
								Colaboradores · {members.length}
							</h2>
							<div className="space-y-2">
								{members.map((member) => (
									<CollaboratorRow
										key={member.id}
										member={member}
										onRemoved={refresh}
										wishlistId={wishlistId}
									/>
								))}
							</div>
						</div>
					)}

					{invitations.length > 0 && (
						<div className="space-y-3">
							<h2 className="font-medium text-muted-foreground text-sm">
								Invitaciones pendientes · {invitations.length}
							</h2>
							<div className="space-y-2">
								{invitations.map((invitation) => (
									<PendingInvitationRow
										invitation={invitation}
										key={invitation.id}
										onChanged={refresh}
										wishlistId={wishlistId}
									/>
								))}
							</div>
						</div>
					)}
				</div>
			)}

			<ShareByEmailDialog
				onOpenChange={setShareOpen}
				onShared={refresh}
				open={shareOpen}
				wishlistId={wishlistId}
			/>
		</div>
	);
}
