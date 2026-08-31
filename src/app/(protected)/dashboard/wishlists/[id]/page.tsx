import { notFound } from "next/navigation";
import { MetricCards } from "@/components/features/dashboard/overview/metric-cards";
import { RecentPurchases } from "@/components/features/dashboard/overview/recent-purchases";
import { api } from "@/trpc/server";

type Props = {
	params: Promise<{ id: string }>;
};

export default async function DashboardWishlistOverviewPage({ params }: Props) {
	const { id } = await params;

	let wishlist: Awaited<ReturnType<typeof api.wishlist.overview>>;
	try {
		wishlist = await api.wishlist.overview({ wishlistId: id });
	} catch {
		notFound();
	}

	return (
		<div className="w-full p-7">
			<div className="space-y-[18px]">
				<MetricCards metrics={wishlist.metrics} />
				<RecentPurchases
					language={wishlist.language}
					purchases={wishlist.recentPurchases}
				/>
			</div>
		</div>
	);
}
