"use client";

import { useMemo, useState } from "react";
import { PurchaseGiftModal } from "@/components/features/wishlist/purchase-gift-modal";
import { EmptyState } from "@/components/shared/empty-state";
import { GiftGrid } from "@/components/shared/gift-grid";
import { GiftList } from "@/components/shared/gift-list";
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

type Props = {
	gifts: PublicGiftViewModel[];
	categories: PublicCategoryViewModel[];
	layout: PublicLayoutPreset;
	actionsEnabled?: boolean;
};

type EmptyStateCopy = { copy: string; ctaLabel: string };
type EmptyStateConfig = EmptyStateCopy & {
	resetTo: GiftFilter;
};

const FALLBACK_EMPTY_STATE: EmptyStateConfig = {
	copy: "No hay regalos que coincidan con este filtro.",
	ctaLabel: "Ver todos los regalos",
	resetTo: DEFAULT_FILTER,
};

const EMPTY_STATE_COPY: Record<string, EmptyStateConfig> = {
	available: {
		copy: "Todos los regalos disponibles ya fueron marcados como comprados.",
		ctaLabel: "Ver todos los regalos",
		resetTo: DEFAULT_FILTER,
	},
	purchased: {
		copy: "Aún no hay regalos marcados como comprados.",
		ctaLabel: "Ver regalos disponibles",
		resetTo: { kind: "status", value: "available" },
	},
	infaltable: {
		copy: "No hay regalos marcados como infaltables en esta lista.",
		ctaLabel: "Ver todos los regalos",
		resetTo: DEFAULT_FILTER,
	},
	category: {
		copy: "No hay regalos en esta categoría.",
		ctaLabel: "Ver todos los regalos",
		resetTo: DEFAULT_FILTER,
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
	const [selectedGift, setSelectedGift] = useState<PublicGiftViewModel | null>(
		null,
	);

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
		"shrink-0 snap-start rounded-full border px-3 py-1 text-sm font-medium transition-colors cursor-pointer";

	function chipClass(active: boolean): string {
		return active
			? "border-foreground bg-foreground text-background"
			: "border-border bg-transparent text-foreground hover:bg-foreground/5";
	}

	return (
		<div>
			<div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-start">
				<fieldset
					aria-label="Filtros de regalos"
					className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1"
				>
					{(
						[
							{
								label: `Todos (${counts.all})`,
								filter: { kind: "status", value: "all" } as const,
								onClick: () => setStatusFilter("all"),
							},
							{
								label: `Disponibles (${counts.available})`,
								filter: { kind: "status", value: "available" } as const,
								onClick: () => setStatusFilter("available"),
							},
							{
								label: `Comprados (${counts.purchased})`,
								filter: { kind: "status", value: "purchased" } as const,
								onClick: () => setStatusFilter("purchased"),
							},
							{
								label: `Infaltables (${counts.infaltable})`,
								filter: { kind: "status", value: "infaltable" } as const,
								onClick: () => setStatusFilter("infaltable"),
							},
						] satisfies Array<{
							label: string;
							filter: GiftFilter;
							onClick: () => void;
						}>
					).map((chip) => {
						const active = isFilterActive(activeFilter, chip.filter);
						return (
							<button
								aria-pressed={active}
								className={`${chipBase} ${chipClass(active)}`}
								key={chip.label}
								onClick={chip.onClick}
								type="button"
							>
								{chip.label}
							</button>
						);
					})}

					{categoryFilters.map((cat) => {
						const active = isFilterActive(activeFilter, {
							kind: "category",
							categoryId: cat.id,
						});
						return (
							<button
								aria-pressed={active}
								className={`${chipBase} ${chipClass(active)}`}
								key={cat.id}
								onClick={() => setCategoryFilter(cat.id)}
								type="button"
							>
								{cat.name}
							</button>
						);
					})}
				</fieldset>

				<div className="sm:ml-auto">
					<select
						className="rounded-lg border border-border bg-card px-3 py-1 text-card-foreground text-sm"
						onChange={(e) => setSortMode(e.target.value as GiftSortMode)}
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
				<EmptyState
					action={
						!isAllFilter && (
							<button
								className="public-btn border border-primary px-4 py-2 text-primary text-sm transition-colors hover:bg-primary/10"
								onClick={() => setActiveFilter(emptyState.resetTo)}
								type="button"
							>
								{emptyState.ctaLabel}
							</button>
						)
					}
					description={isAllFilter ? undefined : emptyState.copy}
					title={
						isAllFilter
							? "Esta lista aún no tiene regalos."
							: "No hay regalos para mostrar."
					}
				/>
			) : layout.id === "minimal" ? (
				<GiftList
					actionsEnabled={actionsEnabled}
					giftCardStyle={layout.giftCardStyle}
					gifts={filteredGifts}
					onGiftAction={setSelectedGift}
				/>
			) : (
				<GiftGrid
					actionsEnabled={actionsEnabled}
					giftCardStyle={layout.giftCardStyle}
					giftColumns={layout.giftColumns}
					gifts={filteredGifts}
					onGiftAction={setSelectedGift}
				/>
			)}
			{actionsEnabled && selectedGift && (
				<PurchaseGiftModal
					gift={selectedGift}
					onOpenChange={(open) => {
						if (!open) setSelectedGift(null);
					}}
					open
				/>
			)}
		</div>
	);
}
