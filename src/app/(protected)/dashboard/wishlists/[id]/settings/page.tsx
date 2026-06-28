import { notFound } from "next/navigation";
import { WishlistSettingsForm } from "@/components/features/dashboard/settings/wishlist-settings-form";
import { api } from "@/trpc/server";

type Props = {
	params: Promise<{ id: string }>;
};

export default async function DashboardWishlistSettingsPage({ params }: Props) {
	const { id } = await params;

	let wishlist: Awaited<ReturnType<typeof api.wishlist.getById>>;
	try {
		wishlist = await api.wishlist.getById({ id });
	} catch {
		notFound();
	}

	return <WishlistSettingsForm wishlist={wishlist} />;
}
