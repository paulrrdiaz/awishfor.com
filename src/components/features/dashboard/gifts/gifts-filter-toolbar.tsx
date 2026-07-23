import { GiftSortSelect } from "./gift-sort-select";
import { GiftStatusFilterChips } from "./gift-status-filter-chips";
import { GiftsSearchInput } from "./gifts-search-input";

export function GiftsFilterToolbar() {
	return (
		<div className="flex flex-wrap items-center gap-3">
			<GiftsSearchInput />
			<GiftStatusFilterChips />
			<GiftSortSelect />
		</div>
	);
}
