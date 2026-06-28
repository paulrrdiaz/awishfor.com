import { notFound } from "next/navigation";
import { WishlistDesignEditor } from "@/components/features/dashboard/design/wishlist-design-editor";
import { api } from "@/trpc/server";

type Props = {
	params: Promise<{ id: string }>;
};

export default async function DashboardWishlistDesignPage({ params }: Props) {
	const { id } = await params;

	let wishlist: Awaited<ReturnType<typeof api.wishlist.getById>>;
	try {
		wishlist = await api.wishlist.getById({ id });
	} catch {
		notFound();
	}

	return <WishlistDesignEditor wishlist={wishlist} />;
}
