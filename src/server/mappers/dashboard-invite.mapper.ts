import type { DashboardInviteViewModel } from "@/server/mappers/view-models";
import type { InviteWithExtras } from "@/server/services/invite.service";

export function mapDashboardInvite(
	invite: InviteWithExtras,
): DashboardInviteViewModel {
	return {
		id: invite.id,
		wishlistId: invite.wishlistId,
		primaryName: invite.primaryName,
		primaryEmail: invite.primaryEmail,
		primaryPhone: invite.primaryPhone,
		slug: invite.slug,
		status: invite.status,
		partySize: 1 + invite.extraGuests.length,
		extraGuests: invite.extraGuests.map((guest) => ({
			id: guest.id,
			name: guest.name,
		})),
		openedAt: invite.openedAt?.toISOString() ?? null,
		respondedAt: invite.respondedAt?.toISOString() ?? null,
		createdAt: invite.createdAt.toISOString(),
		updatedAt: invite.updatedAt.toISOString(),
	};
}
