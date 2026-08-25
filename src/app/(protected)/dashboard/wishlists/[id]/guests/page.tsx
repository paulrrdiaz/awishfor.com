import { notFound } from "next/navigation";
import type { SearchParams } from "nuqs/server";
import { GuestList } from "@/components/features/dashboard/guests/guest-list";
import { GuestsEmptyState } from "@/components/features/dashboard/guests/guests-empty-state";
import { GuestsFilterToolbar } from "@/components/features/dashboard/guests/guests-filter-toolbar";
import { GuestsFilteredEmptyState } from "@/components/features/dashboard/guests/guests-filtered-empty-state";
import { GuestsHeaderToolbar } from "@/components/features/dashboard/guests/guests-header-toolbar";
import {
	countDashboardInvitesByStatus,
	filterDashboardInvites,
} from "@/lib/dashboard/guest-filters";
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

	const invitesWithUrl = invites.map((invite) => ({
		...invite,
		inviteUrl: toCanonicalWishlistUrl(`/w/${wishlist.slug}/${invite.slug}`),
	}));
	const totalGuests = invites.reduce(
		(total, invite) => total + invite.partySize,
		0,
	);
	const inviteCounts = countDashboardInvitesByStatus(invites);
	const filteredInvites = filterDashboardInvites(invitesWithUrl, { q, status });

	return (
		<div className="w-full space-y-5 px-7 pt-1 pb-5">
			<GuestsHeaderToolbar
				totalGuests={totalGuests}
				totalInvites={invites.length}
				wishlistId={id}
			/>

			{invites.length > 0 && <GuestsFilterToolbar counts={inviteCounts} />}

			{invites.length === 0 ? (
				<GuestsEmptyState wishlistId={id} />
			) : filteredInvites.length === 0 ? (
				<GuestsFilteredEmptyState />
			) : (
				<GuestList invites={filteredInvites} wishlistId={id} />
			)}
		</div>
	);
}
