import { WishlistDetailNav } from "@/components/layouts/dashboard/wishlist-detail-nav";

export default async function DashboardWishlistDetailLayout({
	children,
	params,
}: LayoutProps<"/dashboard/wishlists/[id]">) {
	const { id } = await params;

	return (
		<>
			<WishlistDetailNav wishlistId={id} />
			{children}
		</>
	);
}
