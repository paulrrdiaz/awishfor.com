"use client";

import { Gift, Plus } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
	DashboardWishlistSummaryViewModel,
	SharedDashboardWishlistSummaryViewModel,
} from "@/server/mappers/view-models";
import { WishlistCard } from "./wishlist-card";

type WishlistFilter = "active" | "draft" | "published" | "archived";

const FILTERS: { id: WishlistFilter; label: string }[] = [
	{ id: "active", label: "Activas" },
	{ id: "draft", label: "Borradores" },
	{ id: "published", label: "Publicadas" },
	{ id: "archived", label: "Archivadas" },
];

type Props = {
	owned: DashboardWishlistSummaryViewModel[];
	shared: SharedDashboardWishlistSummaryViewModel[];
};

function matchesFilter(
	wishlist: DashboardWishlistSummaryViewModel,
	filter: WishlistFilter,
) {
	if (filter === "active") return wishlist.status !== "archived";
	return wishlist.status === filter;
}

export function WishlistCardGrid({ owned, shared }: Props) {
	const [activeFilter, setActiveFilter] = useState<WishlistFilter>("active");
	const filteredWishlists = useMemo(
		() => owned.filter((wishlist) => matchesFilter(wishlist, activeFilter)),
		[owned, activeFilter],
	);

	if (owned.length === 0 && shared.length === 0) {
		return (
			<EmptyState
				action={
					<Button asChild>
						<Link href="/create">
							<Plus />
							Crear wishlist
						</Link>
					</Button>
				}
				className="rounded-xl border border-border border-dashed bg-card px-6"
				description="Crea tu primera wishlist…"
				title="Aún no tienes wishlists"
			/>
		);
	}

	return (
		<div className="space-y-10">
			<div className="space-y-6">
				<div className="flex flex-wrap gap-2">
					{FILTERS.map((filter) => (
						<button
							className={cn(
								"h-8 rounded-lg border border-border px-3 font-medium text-sm transition hover:bg-muted",
								activeFilter === filter.id
									? "border-secondary bg-secondary text-secondary-foreground"
									: "bg-card text-muted-foreground",
							)}
							key={filter.id}
							onClick={() => setActiveFilter(filter.id)}
							type="button"
						>
							{filter.label}
						</button>
					))}
				</div>

				{filteredWishlists.length === 0 ? (
					<div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-border border-dashed bg-card px-6 text-center">
						<Gift className="mb-3 size-8 text-muted-foreground" />
						<h2 className="font-heading font-semibold text-xl">
							No hay wishlists en este filtro
						</h2>
						<p className="mt-2 text-muted-foreground text-sm">
							Cambia de filtro para revisar tus otras listas.
						</p>
					</div>
				) : (
					<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
						{filteredWishlists.map((wishlist) => (
							<WishlistCard key={wishlist.id} wishlist={wishlist} />
						))}
					</div>
				)}
			</div>

			{shared.length > 0 && (
				<div className="space-y-4">
					<div>
						<h2 className="font-heading font-semibold text-xl">
							Compartidas conmigo
						</h2>
						<p className="mt-1 text-muted-foreground text-sm">
							Wishlists de otras personas en las que colaboras.
						</p>
					</div>
					<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
						{shared.map((wishlist) => (
							<WishlistCard
								key={wishlist.id}
								ownerName={wishlist.ownerName}
								wishlist={wishlist}
							/>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
