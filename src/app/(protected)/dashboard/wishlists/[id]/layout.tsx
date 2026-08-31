import { notFound } from "next/navigation";
import { MobileWishlistActionBar } from "@/components/layouts/dashboard/mobile/mobile-wishlist-action-bar";
import { MobileWishlistTopChrome } from "@/components/layouts/dashboard/mobile/mobile-wishlist-top-chrome";
import { WishlistSectionTabs } from "@/components/layouts/dashboard/wishlist-section-tabs";
import type { SectionBadges } from "@/components/layouts/dashboard/wishlist-sections";
import { WishlistStatusStrip } from "@/components/layouts/dashboard/wishlist-status-strip";
import { WishlistTitleBlock } from "@/components/layouts/dashboard/wishlist-title-block";
import { WishlistTopbar } from "@/components/layouts/dashboard/wishlist-topbar";
import { api } from "@/trpc/server";

export default async function DashboardWishlistDetailLayout({
	children,
	params,
}: LayoutProps<"/dashboard/wishlists/[id]">) {
	const { id } = await params;
	let wishlist: Awaited<ReturnType<typeof api.wishlist.overview>>;
	try {
		wishlist = await api.wishlist.overview({ wishlistId: id });
	} catch {
		notFound();
	}

	const badges: SectionBadges = {
		gifts: { count: wishlist.metrics.totalGifts },
		guests: {
			count: wishlist.metrics.pendingInvitations,
			variant: "warning",
		},
	};

	return (
		<div className="flex min-h-0 flex-1 flex-col">
			<div className="hidden md:block">
				<WishlistTopbar
					isOwner={wishlist.isOwner}
					publicUrlPath={wishlist.publicUrlPath}
					status={wishlist.status}
					title={wishlist.title}
					wishlistId={id}
				/>
			</div>
			<WishlistStatusStrip
				eventType={wishlist.eventType}
				isOwner={wishlist.isOwner}
				publicUrlPath={wishlist.publicUrlPath}
				readiness={wishlist.readiness}
				status={wishlist.status}
				totalViews={wishlist.metrics.totalViews}
				wishlistId={id}
			/>
			<div className="hidden md:block">
				<WishlistTitleBlock title={wishlist.title} />
			</div>
			<div className="hidden md:block">
				<WishlistSectionTabs
					badges={badges}
					isOwner={wishlist.isOwner}
					wishlistId={id}
				/>
			</div>
			<MobileWishlistTopChrome
				badges={badges}
				isOwner={wishlist.isOwner}
				publicUrlPath={wishlist.publicUrlPath}
				status={wishlist.status}
				title={wishlist.title}
				totalGuests={wishlist.metrics.totalGuests}
				totalInvitations={wishlist.metrics.totalInvitations}
				wishlistId={id}
			/>
			<div className="min-h-0 min-w-0 flex-1 overflow-y-auto">{children}</div>
			<MobileWishlistActionBar
				pendingInvitations={wishlist.metrics.pendingInvitations}
				wishlistId={id}
			/>
		</div>
	);
}
