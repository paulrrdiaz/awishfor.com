import { notFound } from "next/navigation";
import { CollaboratorsPanel } from "@/components/features/dashboard/collaborators/collaborators-panel";
import { api } from "@/trpc/server";

type Props = {
	params: Promise<{ id: string }>;
};

export default async function DashboardWishlistCollaboratorsPage({
	params,
}: Props) {
	const { id } = await params;

	let wishlist: Awaited<ReturnType<typeof api.wishlist.overview>>;
	try {
		wishlist = await api.wishlist.overview({ wishlistId: id });
	} catch {
		notFound();
	}

	if (!wishlist.isOwner) {
		notFound();
	}

	return (
		<div className="mx-auto w-full max-w-3xl p-7">
			<CollaboratorsPanel wishlistId={id} />
		</div>
	);
}
