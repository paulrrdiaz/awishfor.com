"use client";

import { MobileRootTitleBar } from "@/components/layouts/dashboard/mobile/mobile-root-title-bar";
import { formatRelativeDaysLabel } from "@/lib/dashboard/home-format";
import { api } from "@/trpc/react";
import { AllClearPanel } from "./all-clear-panel";
import { FirstRunPanel } from "./first-run-panel";
import { HomeErrorPanel } from "./home-error-panel";
import { HomeHeader } from "./home-header";
import { HomeSkeleton } from "./home-skeleton";
import { HomeSummaryCard } from "./home-summary-card";
import { InicioTopbar } from "./inicio-topbar";
import { PendingActionsPanel } from "./pending-actions-panel";

function pendingActionsSubtitle(count: number): string {
	return count === 1
		? "Tienes 1 acción para mantener tus wishlists al día"
		: `Tienes ${count} acciones para mantener tus wishlists al día`;
}

function allClearSubtitle(
	upcomingEvent: { eventDate: string | null } | null,
): string {
	if (!upcomingEvent?.eventDate) {
		return "No tienes acciones pendientes por ahora.";
	}
	return `No hay nada urgente: tu próximo evento es ${formatRelativeDaysLabel(upcomingEvent.eventDate)}`;
}

export function DashboardHomePage() {
	const { data, isLoading, isError, refetch } = api.wishlist.home.useQuery();

	return (
		<div className="flex min-h-0 flex-1 flex-col">
			<div className="hidden md:block">
				<InicioTopbar />
			</div>
			<MobileRootTitleBar title="Inicio" />

			<div className="min-h-0 flex-1 overflow-y-auto">
				<div className="mx-auto max-w-[1080px] px-4 py-5 md:px-10 md:py-8">
					{isLoading && <HomeSkeleton />}

					{!isLoading && isError && (
						<>
							<HomeHeader subtitle="No pudimos calcular tus acciones de hoy." />
							<div className="mt-6">
								<HomeErrorPanel onRetry={() => void refetch()} />
							</div>
						</>
					)}

					{!isLoading &&
						!isError &&
						data &&
						data.summary.activeWishlists === 0 && (
							<>
								<HomeHeader
									showCreateButton={false}
									subtitle="Empieza por tu primera wishlist: se arma en unos minutos."
								/>
								<div className="mt-6">
									<FirstRunPanel />
								</div>
							</>
						)}

					{!isLoading &&
						!isError &&
						data &&
						data.summary.activeWishlists > 0 &&
						data.nextStep === null && (
							<>
								<HomeHeader subtitle={allClearSubtitle(data.upcomingEvent)} />
								<div className="mt-6 grid grid-cols-1 gap-6 md:mt-7 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] md:gap-8">
									<AllClearPanel upcomingEvent={data.upcomingEvent} />
									<HomeSummaryCard summary={data.summary} />
								</div>
							</>
						)}

					{!isLoading && !isError && data && data.nextStep !== null && (
						<>
							<HomeHeader
								subtitle={pendingActionsSubtitle(data.actions.length)}
							/>
							<div className="mt-6 grid grid-cols-1 gap-6 md:mt-7 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] md:gap-8">
								<PendingActionsPanel
									nextStep={data.nextStep}
									subsequentActions={data.subsequentActions}
								/>
								<HomeSummaryCard summary={data.summary} />
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
