import { notFound } from "next/navigation";
import { WishlistSectionRail } from "@/components/layouts/dashboard/wishlist-section-rail";
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

	return (
		<div className="flex min-h-0 flex-1 flex-col">
			<WishlistTopbar
				publicUrlPath={wishlist.publicUrlPath}
				status={wishlist.status}
				title={wishlist.title}
				wishlistId={id}
			/>
			<div className="flex min-h-0 flex-1 flex-col md:flex-row">
				<WishlistSectionRail wishlistId={id} />
				<div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
					<WishlistTitleBlock
						publicUrlPath={wishlist.publicUrlPath}
						slug={wishlist.slug}
						title={wishlist.title}
					/>
					{children}
				</div>
			</div>
		</div>
	);
}
