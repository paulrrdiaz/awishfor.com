import { notFound } from "next/navigation";
import type { SearchParams } from "nuqs/server";
import { GiftGroup } from "@/components/features/dashboard/gifts/gift-group";
import { GiftsEmptyState } from "@/components/features/dashboard/gifts/gifts-empty-state";
import { GiftsFilterToolbar } from "@/components/features/dashboard/gifts/gifts-filter-toolbar";
import { GiftsFilteredEmptyState } from "@/components/features/dashboard/gifts/gifts-filtered-empty-state";
import { GiftsHeaderToolbar } from "@/components/features/dashboard/gifts/gifts-header-toolbar";
import { filterAndSortDashboardGifts } from "@/lib/dashboard/gift-filters";
import { api } from "@/trpc/server";
import { loadGiftsSearchParams } from "./search-params";

type Props = {
	params: Promise<{ id: string }>;
	searchParams: Promise<SearchParams>;
};

export default async function DashboardWishlistGiftsPage({
	params,
	searchParams,
}: Props) {
	const { id } = await params;
	const { q, filter, sort } = await loadGiftsSearchParams(searchParams);

	let grouped: Awaited<ReturnType<typeof api.gift.list>>;
	try {
		grouped = await api.gift.list({ wishlistId: id });
	} catch {
		notFound();
	}

	const categories = await api.category.list({ wishlistId: id });
	const categoriesById = Object.fromEntries(
		categories.map((category) => [category.id, category.name]),
	);

	const allGifts = [
		...grouped.available,
		...grouped.purchased,
		...grouped.hidden,
	];
	const totalGifts = allGifts.length;
	const filteredGifts = filterAndSortDashboardGifts(allGifts, {
		q,
		filter,
		sort,
	});
	const isFiltered = q !== "" || filter !== "todos";
	const sortable = sort === "manual" && !isFiltered;

	return (
		<div className="mx-auto w-full max-w-4xl space-y-5 px-4 py-8">
			<GiftsHeaderToolbar
				sortable={sortable}
				totalGifts={totalGifts}
				wishlistId={id}
			/>

			{totalGifts > 0 && <GiftsFilterToolbar />}

			{totalGifts === 0 ? (
				<GiftsEmptyState wishlistId={id} />
			) : filteredGifts.length === 0 ? (
				<GiftsFilteredEmptyState />
			) : (
				<GiftGroup
					categoriesById={categoriesById}
					gifts={filteredGifts}
					sortable={sortable}
					wishlistId={id}
				/>
			)}
		</div>
	);
}
