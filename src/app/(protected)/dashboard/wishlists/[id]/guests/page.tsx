import { notFound } from "next/navigation";
import { GuestList } from "@/components/features/dashboard/guests/guest-list";
import { GuestsEmptyState } from "@/components/features/dashboard/guests/guests-empty-state";
import { GuestsHeaderToolbar } from "@/components/features/dashboard/guests/guests-header-toolbar";
import { toCanonicalWishlistUrl } from "@/lib/wishlist/share";
import { api } from "@/trpc/server";

type Props = {
	params: Promise<{ id: string }>;
};

export default async function DashboardWishlistGuestsPage({ params }: Props) {
	const { id } = await params;

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

	return (
		<div className="mx-auto w-full max-w-4xl space-y-5 px-4 py-8">
			<GuestsHeaderToolbar totalInvites={invites.length} wishlistId={id} />

			{invites.length === 0 ? (
				<GuestsEmptyState wishlistId={id} />
			) : (
				<GuestList invites={invitesWithUrl} wishlistId={id} />
			)}
		</div>
	);
}
