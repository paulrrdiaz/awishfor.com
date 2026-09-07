import type { DashboardInviteViewModel } from "@/server/mappers/view-models";

type ConfirmedGuestGroup = {
	primaryName: string;
	primaryConfirmed: boolean;
	namedCompanions: string[];
	unnamedCompanions: number;
};

const spanishCollator = new Intl.Collator("es", {
	sensitivity: "base",
	usage: "sort",
});
const spanishListFormatter = new Intl.ListFormat("es", {
	style: "long",
	type: "conjunction",
});

function formatConfirmedPeople(count: number): string {
	return `${count} ${count === 1 ? "persona confirmada" : "personas confirmadas"}`;
}

function confirmedGroupForInvite(
	invite: DashboardInviteViewModel,
): ConfirmedGuestGroup {
	const namedCompanions: string[] = [];
	let unnamedCompanions = 0;

	for (const guest of invite.extraGuests) {
		if (guest.status !== "confirmed") continue;
		const name = guest.name?.trim();
		if (name) namedCompanions.push(name);
		else unnamedCompanions += 1;
	}

	return {
		primaryName: invite.primaryName,
		primaryConfirmed: invite.status === "confirmed",
		namedCompanions,
		unnamedCompanions,
	};
}

function confirmedPeopleInGroup(group: ConfirmedGuestGroup): number {
	return (
		Number(group.primaryConfirmed) +
		group.namedCompanions.length +
		group.unnamedCompanions
	);
}

function formatGroupLine(group: ConfirmedGuestGroup): string {
	if (group.primaryConfirmed) {
		const names = spanishListFormatter.format([
			group.primaryName,
			...group.namedCompanions,
		]);
		return `- ${names}${group.unnamedCompanions ? ` + ${group.unnamedCompanions}` : ""}`;
	}

	const companionCount = group.namedCompanions.length + group.unnamedCompanions;
	const namedCompanions = spanishListFormatter.format(group.namedCompanions);
	const compactNames = `${namedCompanions}${
		group.unnamedCompanions
			? `${namedCompanions ? " + " : ""}${group.unnamedCompanions}`
			: ""
	}`;
	const label =
		compactNames ||
		`${group.unnamedCompanions === 1 ? "Acompañante" : `${group.unnamedCompanions} acompañantes`}`;
	const context = companionCount === 1 ? "acompañante" : "acompañantes";
	return `- ${label} (${context} de ${group.primaryName})`;
}

/**
 * Produces the complete, privacy-conscious confirmed roster for a dashboard
 * invitation snapshot. It deliberately does not deduplicate matching names:
 * invitations may represent different people with the same name.
 */
export function getConfirmedGuestsRoster(
	invites: DashboardInviteViewModel[],
	wishlistTitle: string,
): { confirmedGuests: number; text: string } {
	const groups = invites
		.map(confirmedGroupForInvite)
		.filter((group) => confirmedPeopleInGroup(group) > 0)
		.sort((left, right) =>
			spanishCollator.compare(left.primaryName, right.primaryName),
		);
	const confirmedGuests = groups.reduce(
		(total, group) => total + confirmedPeopleInGroup(group),
		0,
	);
	const groupLines = groups.map(formatGroupLine);

	return {
		confirmedGuests,
		text: [
			`Confirmados · ${wishlistTitle}`,
			formatConfirmedPeople(confirmedGuests),
			...(groupLines.length > 0 ? ["", ...groupLines] : []),
		].join("\n"),
	};
}
