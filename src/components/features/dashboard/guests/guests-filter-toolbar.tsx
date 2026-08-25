import type { DashboardInviteFilterCounts } from "@/lib/dashboard/guest-filters";
import { GuestStatusFilterChips } from "./guest-status-filter-chips";
import { GuestsSearchInput } from "./guests-search-input";

type Props = {
	counts: DashboardInviteFilterCounts;
};

export function GuestsFilterToolbar({ counts }: Props) {
	return (
		<div className="flex flex-wrap items-center gap-3">
			<GuestsSearchInput />
			<GuestStatusFilterChips counts={counts} />
		</div>
	);
}
