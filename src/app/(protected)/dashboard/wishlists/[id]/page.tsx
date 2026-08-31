import { notFound } from "next/navigation";
import { ActivityFeed } from "@/components/features/dashboard/overview/activity-feed";
import { MetricCards } from "@/components/features/dashboard/overview/metric-cards";
import {
	InvitationProgressPanel,
	PurchaseProgressPanel,
} from "@/components/features/dashboard/overview/progress-panels";
import { ViewTrendPanel } from "@/components/features/dashboard/overview/view-trend-panel";
import { api } from "@/trpc/server";

type Props = {
	params: Promise<{ id: string }>;
};

const DEFAULT_VIEW_WINDOW_DAYS = 30;

export default async function DashboardWishlistOverviewPage({ params }: Props) {
	const { id } = await params;

	let wishlist: Awaited<ReturnType<typeof api.wishlist.overview>>;
	try {
		wishlist = await api.wishlist.overview({
			wishlistId: id,
			viewWindowDays: DEFAULT_VIEW_WINDOW_DAYS,
		});
	} catch {
		notFound();
	}

	return (
		<div className="w-full p-7">
			<div className="space-y-[18px]">
				<MetricCards metrics={wishlist.metrics} />
				<div className="grid gap-[18px] lg:grid-cols-[1.4fr_1fr]">
					<div className="flex flex-col gap-[18px]">
						{wishlist.isOwner && wishlist.viewSeries && (
							<ViewTrendPanel
								initialSeries={wishlist.viewSeries}
								initialWindowDays={DEFAULT_VIEW_WINDOW_DAYS}
								wishlistId={wishlist.id}
							/>
						)}
						<ActivityFeed
							activity={wishlist.activity}
							language={wishlist.language}
						/>
					</div>
					<div className="flex flex-col gap-[18px]">
						<PurchaseProgressPanel
							purchasedUnits={wishlist.metrics.purchasedUnits}
							totalUnits={wishlist.metrics.totalUnits}
						/>
						<InvitationProgressPanel
							openedInvitations={wishlist.metrics.openedInvitations}
							totalInvitations={wishlist.metrics.totalInvitations}
							unopenedInvitations={wishlist.metrics.unopenedInvitations}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
