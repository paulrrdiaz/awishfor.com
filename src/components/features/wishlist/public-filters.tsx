"use client";

import { useMemo, useState } from "react";
import type { PublicLayoutPreset } from "@/config/public-layouts";
import {
	buildCategoryFilters,
	countByStatusFilter,
	DEFAULT_FILTER,
	DEFAULT_SORT_MODE,
	filterGifts,
	type GiftFilter,
	type GiftSortMode,
	sortGifts,
} from "@/lib/wishlist/gift-filters";
import type {
	PublicCategoryViewModel,
	PublicGiftViewModel,
} from "@/server/mappers/view-models";
import { GiftGrid } from "./gift-grid";
import { GiftList } from "./gift-list";

type Props = {
	gifts: PublicGiftViewModel[];
	categories: PublicCategoryViewModel[];
	layout: PublicLayoutPreset;
	actionsEnabled?: boolean;
};

type EmptyStateCopy = { copy: string; ctaLabel: string };

const FALLBACK_EMPTY_STATE: EmptyStateCopy = {
	copy: "No hay regalos que coincidan con este filtro.",
	ctaLabel: "Ver todos los regalos",
};

const EMPTY_STATE_COPY: Record<string, EmptyStateCopy> = {
	available: {
		copy: "No hay regalos disponibles para regalar en este momento.",
		ctaLabel: "Ver todos los regalos",
	},
	purchased: {
		copy: "Aún no se ha comprado ningún regalo.",
		ctaLabel: "Ver todos los regalos",
	},
	infaltable: {
		copy: "No hay regalos infaltables en esta lista.",
		ctaLabel: "Ver todos los regalos",
	},
	category: {
		copy: "No hay regalos en esta categoría.",
		ctaLabel: "Ver todos los regalos",
	},
};

function isFilterActive(active: GiftFilter, filter: GiftFilter): boolean {
	if (active.kind !== filter.kind) return false;
	if (active.kind === "status" && filter.kind === "status")
		return active.value === filter.value;
	if (active.kind === "category" && filter.kind === "category")
		return active.categoryId === filter.categoryId;
	return false;
}

export function PublicGiftFilters({
	gifts,
	categories,
	layout,
	actionsEnabled = false,
}: Props) {
	const [activeFilter, setActiveFilter] = useState<GiftFilter>(DEFAULT_FILTER);
	const [sortMode, setSortMode] = useState<GiftSortMode>(DEFAULT_SORT_MODE);

	const counts = useMemo(() => countByStatusFilter(gifts), [gifts]);
	const categoryFilters = useMemo(
		() => buildCategoryFilters(categories, gifts),
		[categories, gifts],
	);

	const filteredGifts = useMemo(() => {
		const filtered = filterGifts(gifts, activeFilter);
		return sortGifts(filtered, sortMode);
	}, [gifts, activeFilter, sortMode]);

	const isEmpty = filteredGifts.length === 0;
	const isAllFilter =
		activeFilter.kind === "status" && activeFilter.value === "all";

	const emptyStateKey =
		activeFilter.kind === "category" ? "category" : activeFilter.value;
	const emptyState = EMPTY_STATE_COPY[emptyStateKey] ?? FALLBACK_EMPTY_STATE;

	function setStatusFilter(
		value: "all" | "available" | "purchased" | "infaltable",
	) {
		setActiveFilter({ kind: "status", value });
	}

	function setCategoryFilter(categoryId: string) {
		setActiveFilter({ kind: "category", categoryId });
	}

	const chipBase =
		"rounded-full px-3 py-1 text-sm font-medium transition-colors cursor-pointer border";

	function chipStyle(active: boolean): React.CSSProperties {
		return active
			? {
					backgroundColor: "var(--public-accent)",
					color: "var(--public-bg)",
					borderColor: "var(--public-accent)",
				}
			: {
					backgroundColor: "transparent",
					color: "var(--public-text)",
					borderColor: "var(--public-border)",
				};
	}

	return (
		<div>
			{/* Filter chips row */}
			<div className="flex flex-wrap items-center gap-2 pb-4">
				<button
					className={chipBase}
					onClick={() => setStatusFilter("all")}
					style={chipStyle(
						isFilterActive(activeFilter, { kind: "status", value: "all" }),
					)}
					type="button"
				>
					Todos ({counts.all})
				</button>
				<button
					className={chipBase}
					onClick={() => setStatusFilter("available")}
					style={chipStyle(
						isFilterActive(activeFilter, {
							kind: "status",
							value: "available",
						}),
					)}
					type="button"
				>
					Disponibles ({counts.available})
				</button>
				<button
					className={chipBase}
					onClick={() => setStatusFilter("purchased")}
					style={chipStyle(
						isFilterActive(activeFilter, {
							kind: "status",
							value: "purchased",
						}),
					)}
					type="button"
				>
					Comprados ({counts.purchased})
				</button>
				<button
					className={chipBase}
					onClick={() => setStatusFilter("infaltable")}
					style={chipStyle(
						isFilterActive(activeFilter, {
							kind: "status",
							value: "infaltable",
						}),
					)}
					type="button"
				>
					Infaltables ({counts.infaltable})
				</button>

				{categoryFilters.map((cat) => (
					<button
						className={chipBase}
						key={cat.id}
						onClick={() => setCategoryFilter(cat.id)}
						style={chipStyle(
							isFilterActive(activeFilter, {
								kind: "category",
								categoryId: cat.id,
							}),
						)}
						type="button"
					>
						{cat.name}
					</button>
				))}

				{/* Sort dropdown pushed to the end */}
				<div className="ml-auto">
					<select
						className="rounded-lg border px-3 py-1 text-sm"
						onChange={(e) => setSortMode(e.target.value as GiftSortMode)}
						style={{
							borderColor: "var(--public-border)",
							backgroundColor: "var(--public-surface)",
							color: "var(--public-text)",
						}}
						value={sortMode}
					>
						<option value="recommended">Recomendado</option>
						<option value="price-asc">Precio: menor a mayor</option>
						<option value="price-desc">Precio: mayor a menor</option>
					</select>
				</div>
			</div>

			{/* Gift list or empty state */}
			{isEmpty ? (
				<div className="flex flex-col items-center gap-4 py-16 text-center">
					<p style={{ color: "var(--public-text-muted)" }}>
						{isAllFilter ? "Esta lista aún no tiene regalos." : emptyState.copy}
					</p>
					{!isAllFilter && (
						<button
							className="rounded-full border px-4 py-2 font-medium text-sm transition-colors"
							onClick={() => setStatusFilter("all")}
							style={{
								borderColor: "var(--public-accent)",
								color: "var(--public-accent)",
							}}
							type="button"
						>
							{emptyState.ctaLabel}
						</button>
					)}
				</div>
			) : layout.id === "minimal" ? (
				<GiftList
					actionsEnabled={actionsEnabled}
					giftCardStyle={layout.giftCardStyle}
					gifts={filteredGifts}
				/>
			) : (
				<GiftGrid
					actionsEnabled={actionsEnabled}
					giftCardStyle={layout.giftCardStyle}
					giftColumns={layout.giftColumns}
					gifts={filteredGifts}
				/>
			)}
		</div>
	);
}
