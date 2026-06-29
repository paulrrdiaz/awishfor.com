import { notFound } from "next/navigation";
import { WishlistDetailNav } from "@/components/layouts/dashboard/wishlist-detail-nav";
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
		<>
			<WishlistDetailNav
				publicUrlPath={wishlist.publicUrlPath}
				slug={wishlist.slug}
				status={wishlist.status}
				title={wishlist.title}
				wishlistId={id}
			/>
			{children}
		</>
	);
}
