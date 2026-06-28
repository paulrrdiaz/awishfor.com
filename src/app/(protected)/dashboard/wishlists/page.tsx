import { WishlistCardGrid } from "@/components/features/dashboard/wishlist-card-grid";
import { api } from "@/trpc/server";

export default async function DashboardWishlistsPage() {
	const wishlists = await api.wishlist.summaryList();

	return (
		<div className="mx-auto w-full max-w-6xl px-4 py-8">
			<div className="mb-8">
				<h1 className="font-heading font-semibold text-3xl">Mis wishlists</h1>
				<p className="mt-2 max-w-2xl text-muted-foreground text-sm">
					Revisa el estado de tus listas, el avance de compras y entra al
					resumen de cada wishlist.
				</p>
			</div>
			<WishlistCardGrid wishlists={wishlists} />
		</div>
	);
}
