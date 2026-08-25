import type { DashboardInviteViewModel } from "@/server/mappers/view-models";

export const DASHBOARD_INVITE_FILTERS = [
	"all",
	"pending",
	"confirmed",
	"declined",
] as const;

export type DashboardInviteFilter = (typeof DASHBOARD_INVITE_FILTERS)[number];

export const DEFAULT_DASHBOARD_INVITE_FILTER: DashboardInviteFilter = "all";

export type DashboardInviteFilterCounts = Record<DashboardInviteFilter, number>;

export function normalizeGuestSearchText(value: string): string {
	return value
		.trim()
		.toLocaleLowerCase()
		.normalize("NFD")
		.replace(/\p{M}/gu, "");
}

export function normalizeGuestPhone(value: string): string {
	return value.replace(/\D/g, "");
}

function hasSearchableText(value: string): boolean {
	return /[\p{L}\p{N}]/u.test(value);
}

function matchesSearch(
	invite: DashboardInviteViewModel,
	term: string,
): boolean {
	const normalizedTerm = normalizeGuestSearchText(term);
	if (!hasSearchableText(normalizedTerm)) return true;

	const textFields = [
		invite.primaryName,
		invite.primaryEmail,
		...invite.extraGuests.map((guest) => guest.name),
	];
	const matchesText = textFields.some(
		(value) =>
			value !== null &&
			normalizeGuestSearchText(value).includes(normalizedTerm),
	);
	const phoneTerm = normalizeGuestPhone(term);
	const matchesPhone =
		phoneTerm !== "" &&
		invite.primaryPhone !== null &&
		normalizeGuestPhone(invite.primaryPhone).includes(phoneTerm);

	return matchesText || matchesPhone;
}

function matchesFilter(
	invite: DashboardInviteViewModel,
	filter: DashboardInviteFilter,
): boolean {
	return filter === "all" || invite.status === filter;
}

export function filterDashboardInvites<T extends DashboardInviteViewModel>(
	invites: T[],
	{
		q = "",
		status = DEFAULT_DASHBOARD_INVITE_FILTER,
	}: { q?: string; status?: DashboardInviteFilter },
): T[] {
	return invites.filter(
		(invite) => matchesSearch(invite, q) && matchesFilter(invite, status),
	);
}

export function countDashboardInvitesByStatus(
	invites: DashboardInviteViewModel[],
): DashboardInviteFilterCounts {
	return invites.reduce<DashboardInviteFilterCounts>(
		(counts, invite) => {
			counts.all += 1;
			if (invite.status === "pending") counts.pending += 1;
			if (invite.status === "confirmed") counts.confirmed += 1;
			if (invite.status === "declined") counts.declined += 1;
			return counts;
		},
		{ all: 0, pending: 0, confirmed: 0, declined: 0 },
	);
}
