import { notFound } from "next/navigation";
import { MetricCards } from "@/components/features/dashboard/overview/metric-cards";
import { PublishButton } from "@/components/features/dashboard/overview/publish-button";
import { PublishReadinessChecklist } from "@/components/features/dashboard/overview/publish-readiness-checklist";
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
				<div className="grid gap-[18px] lg:grid-cols-[1.3fr_1fr]">
					<div className="space-y-[18px]">
						<RecentPurchases
							language={wishlist.language}
							purchases={wishlist.recentPurchases}
						/>
					</div>
					<div className="space-y-[18px]">
						<PublishReadinessChecklist readiness={wishlist.readiness} />
						<PublishButton wishlist={wishlist} />
					</div>
				</div>
			</div>
		</div>
	);
}
