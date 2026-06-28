import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { EVENT_TYPE_PRESETS } from "@/config/event-type-presets";
import type { EventType } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";
import type { DashboardWishlistSummaryViewModel } from "@/server/mappers/view-models";

const STATUS_LABELS: Record<string, string> = {
	draft: "Borrador",
	published: "Publicada",
	archived: "Archivada",
};

const STATUS_STYLES: Record<string, string> = {
	draft: "bg-muted text-muted-foreground",
	published: "bg-primary/20 text-secondary",
	archived: "bg-secondary/10 text-secondary",
};

type Props = {
	wishlist: DashboardWishlistSummaryViewModel;
};

export function WishlistCard({ wishlist }: Props) {
	const progress =
		wishlist.totalUnits > 0
			? Math.round((wishlist.purchasedUnits / wishlist.totalUnits) * 100)
			: 0;
	const eventLabel =
		EVENT_TYPE_PRESETS[wishlist.eventType as EventType]?.label ??
		wishlist.eventType;

	return (
		<Link
			className="group block rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
			href={`/dashboard/wishlists/${wishlist.id}`}
		>
			<div className="flex items-start justify-between gap-4">
				<div className="min-w-0">
					<p className="text-muted-foreground text-sm">{eventLabel}</p>
					<h2 className="mt-1 truncate font-heading font-semibold text-xl">
						{wishlist.title}
					</h2>
				</div>
				<span
					className={cn(
						"inline-flex shrink-0 items-center rounded-full px-2.5 py-1 font-medium text-xs",
						STATUS_STYLES[wishlist.status] ?? STATUS_STYLES.draft,
					)}
				>
					{STATUS_LABELS[wishlist.status] ?? wishlist.status}
				</span>
			</div>

			<div className="mt-6">
				<div className="mb-2 flex items-center justify-between gap-3 text-sm">
					<span className="text-muted-foreground">Progreso</span>
					<span className="font-medium">
						{wishlist.purchasedUnits}/{wishlist.totalUnits} unidades
					</span>
				</div>
				<div className="h-2 overflow-hidden rounded-full bg-muted">
					<div
						className="h-full rounded-full bg-primary transition-[width]"
						style={{ width: `${progress}%` }}
					/>
				</div>
				<p className="mt-3 text-muted-foreground text-sm">
					{wishlist.availableGiftCount} disponibles de {wishlist.totalGiftCount}{" "}
					regalos visibles
				</p>
			</div>

			<div className="mt-6 flex items-center justify-between text-sm">
				<span className="text-muted-foreground">
					Creada el{" "}
					{new Intl.DateTimeFormat("es-PE", {
						day: "2-digit",
						month: "short",
						year: "numeric",
					}).format(new Date(wishlist.createdAt))}
				</span>
				<span className="inline-flex items-center gap-1 font-medium text-secondary">
					Abrir
					<ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
				</span>
			</div>
		</Link>
	);
}
