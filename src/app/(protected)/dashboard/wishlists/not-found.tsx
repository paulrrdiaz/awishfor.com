import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { GiftEscapedArt } from "@/components/shared/gift-escaped-art";
import { Button } from "@/components/ui/button";

export default function DashboardWishlistNotFound() {
	return (
		<div className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 py-12">
			<GiftEscapedArt size="sm" />
			<EmptyState
				action={
					<Button asChild>
						<Link href="/dashboard/wishlists">Volver a mis wishlists</Link>
					</Button>
				}
				className="mt-2"
				description="Puede que ya no exista o que no tengas acceso a ella."
				title="No encontramos esta wishlist"
			/>
		</div>
	);
}
