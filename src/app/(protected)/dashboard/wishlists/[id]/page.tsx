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
		<div className="mx-auto w-full max-w-6xl px-4 py-8">
			<div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
				<div>
					<p className="text-muted-foreground text-sm">Resumen de wishlist</p>
					<h1 className="mt-1 font-heading font-semibold text-3xl">
						{wishlist.title}
					</h1>
				</div>
				<div className="rounded-full bg-muted px-3 py-1 font-medium text-muted-foreground text-sm">
					{wishlist.status === "published"
						? "Publicada"
						: wishlist.status === "archived"
							? "Archivada"
							: "Borrador"}
				</div>
			</div>

			<div className="space-y-6">
				<MetricCards metrics={wishlist.metrics} />
				<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.7fr)]">
					<div className="space-y-6">
						<RecentPurchases
							language={wishlist.language}
							purchases={wishlist.recentPurchases}
						/>
					</div>
					<div className="space-y-6">
						<PublishReadinessChecklist readiness={wishlist.readiness} />
						<PublishButton wishlist={wishlist} />
					</div>
				</div>
			</div>
		</div>
	);
}
