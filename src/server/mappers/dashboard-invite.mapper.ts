import type { DashboardInviteViewModel } from "@/server/mappers/view-models";
import type { InviteWithExtras } from "@/server/services/invite.service";

export function mapDashboardInvite(
	invite: InviteWithExtras,
	{ includeAnalytics = false }: { includeAnalytics?: boolean } = {},
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
			status: guest.status,
		})),
		openedAt: invite.openedAt?.toISOString() ?? null,
		...(includeAnalytics
			? {
					lastViewedAt: invite.lastViewedAt?.toISOString() ?? null,
					viewCount: invite.viewCount,
				}
			: {}),
		respondedAt: invite.respondedAt?.toISOString() ?? null,
		createdAt: invite.createdAt.toISOString(),
		updatedAt: invite.updatedAt.toISOString(),
	};
}
