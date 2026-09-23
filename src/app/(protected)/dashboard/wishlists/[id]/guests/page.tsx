import { notFound } from "next/navigation";
import type { SearchParams } from "nuqs/server";
import { EventProximityIndicator } from "@/components/features/dashboard/guests/event-proximity-indicator";
import { GuestList } from "@/components/features/dashboard/guests/guest-list";
import { GuestsEmptyState } from "@/components/features/dashboard/guests/guests-empty-state";
import { GuestsFilterToolbar } from "@/components/features/dashboard/guests/guests-filter-toolbar";
import { GuestsFilteredEmptyState } from "@/components/features/dashboard/guests/guests-filtered-empty-state";
import { GuestsHeaderToolbar } from "@/components/features/dashboard/guests/guests-header-toolbar";
import { getConfirmedGuestsRoster } from "@/lib/dashboard/confirmed-guests-roster";
import {
	countDashboardInvitesByStatus,
	filterDashboardInvites,
} from "@/lib/dashboard/guest-filters";
import {
	buildInviteFollowUpMessage,
	deriveInviteFollowUp,
	getEventProximity,
	inviteFollowUpLabel,
} from "@/lib/dashboard/invite-follow-up";
import { toCanonicalWishlistUrl } from "@/lib/wishlist/share";
import { api } from "@/trpc/server";
import { loadGuestsSearchParams } from "./search-params";

type Props = {
	params: Promise<{ id: string }>;
	searchParams: Promise<SearchParams>;
};

export default async function DashboardWishlistGuestsPage({
	params,
	searchParams,
}: Props) {
	const { id } = await params;
	const { q, status } = await loadGuestsSearchParams(searchParams);

	let wishlist: Awaited<ReturnType<typeof api.wishlist.overview>>;
	let invites: Awaited<ReturnType<typeof api.invite.list>>;
	try {
		[wishlist, invites] = await Promise.all([
			api.wishlist.overview({ wishlistId: id }),
			api.invite.list({ wishlistId: id }),
		]);
	} catch {
		notFound();
	}

	const now = new Date();
	const eventProximity = getEventProximity(wishlist.eventDate, now);
	const invitesWithUrl = invites.map((invite) => {
		const inviteUrl = toCanonicalWishlistUrl(
			`/w/${wishlist.slug}/${invite.slug}`,
		);
		const followUp = deriveInviteFollowUp({
			status: invite.status,
			viewRecency: invite.viewRecency,
			lastFollowUpKind: invite.lastFollowUpKind,
			eventDate: wishlist.eventDate,
			rsvpDeadline: wishlist.rsvpDeadline,
			now,
		});
		return {
			...invite,
			inviteUrl,
			...(followUp
				? {
						followUp: {
							...followUp,
							label: inviteFollowUpLabel(followUp.kind),
							message: buildInviteFollowUpMessage({
								...followUp,
								guestName: invite.primaryName,
								inviteUrl,
								eventType: wishlist.eventType,
								eventDate: wishlist.eventDate,
								eventTime: wishlist.eventTime,
								eventLocation: wishlist.eventLocation,
								rsvpDeadline: wishlist.rsvpDeadline,
								now,
							}),
						},
					}
				: {}),
		};
	});
	const totalGuests = invites.reduce(
		(total, invite) => total + invite.partySize,
		0,
	);
	const inviteCounts = countDashboardInvitesByStatus(invites);
	const { confirmedGuests, text: confirmedGuestsRoster } =
		getConfirmedGuestsRoster(invites, wishlist.title);
	const filteredInvites = filterDashboardInvites(invitesWithUrl, { q, status });

	return (
		<div className="w-full space-y-5 p-7">
			<GuestsHeaderToolbar
				confirmedGuests={confirmedGuests}
				confirmedGuestsRoster={confirmedGuestsRoster}
				pendingInvitations={inviteCounts.pending}
				totalGuests={totalGuests}
				wishlistId={id}
			/>
			{eventProximity && <EventProximityIndicator proximity={eventProximity} />}

			{invites.length > 0 && <GuestsFilterToolbar counts={inviteCounts} />}

			{invites.length === 0 ? (
				<GuestsEmptyState wishlistId={id} />
			) : filteredInvites.length === 0 ? (
				<GuestsFilteredEmptyState />
			) : (
				<GuestList
					invites={filteredInvites}
					isOwner={wishlist.isOwner}
					wishlistId={id}
				/>
			)}
		</div>
	);
}
