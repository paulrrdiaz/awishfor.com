import type {
	SeatingBoardViewModel,
	SeatingPersonViewModel,
} from "@/server/mappers/view-models";
import { unnamedLabel } from "./seating-copy";

export type PrintEntry = {
	personId: string;
	/** What the reader scans for. */
	name: string;
	tableLabel: string;
	/** Unnamed companions print indented beneath their party's primary guest. */
	isIndented: boolean;
};

export type PrintLetterBlock = {
	letter: string;
	entries: PrintEntry[];
};

const collator = new Intl.Collator("es", { sensitivity: "base" });

const firstLetter = (name: string) => {
	const normalized = name
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "")
		.trim()
		.toUpperCase();
	const letter = normalized[0] ?? "#";
	return /[A-Z]/.test(letter) ? letter : "#";
};

/**
 * One flat alphabetical sequence — deliberately not grouped by table, because
 * the reader is looking for their own name, not for a table.
 *
 * An unnamed companion is *not* alphabetised on "Acompañante": it sorts with
 * its party's primary guest and prints indented beneath them. `design.md` §8 —
 * PRD §10 settles this against the design output, which left it open. Somebody
 * scanning for their own party will never look under A.
 */
export function buildPrintEntries(
	board: SeatingBoardViewModel,
): PrintLetterBlock[] {
	const tableLabels = new Map(
		board.tables.map((table) => [table.id, table.label]),
	);
	const seated = board.people.filter((person) => person.tableId !== null);

	const primaryByInvite = new Map<string, SeatingPersonViewModel>();
	for (const person of board.people) {
		if (person.extraGuestId === null) {
			primaryByInvite.set(person.inviteId, person);
		}
	}

	/** The name a row sorts under — its own, or its party's primary guest. */
	const sortKeyFor = (person: SeatingPersonViewModel) =>
		person.isUnnamed
			? (primaryByInvite.get(person.inviteId)?.displayName ?? person.partyLabel)
			: person.displayName;

	const sorted = [...seated].sort((a, b) => {
		const byKey = collator.compare(sortKeyFor(a), sortKeyFor(b));
		if (byKey !== 0) return byKey;
		// Within a party, the primary guest leads and companions follow.
		if (a.extraGuestId === null) return -1;
		if (b.extraGuestId === null) return 1;
		return collator.compare(a.displayName, b.displayName);
	});

	const blocks = new Map<string, PrintEntry[]>();
	for (const person of sorted) {
		const letter = firstLetter(sortKeyFor(person));
		const entry: PrintEntry = {
			personId: person.personId,
			name: person.isUnnamed
				? unnamedLabel(person.partyLabel)
				: person.displayName,
			tableLabel: tableLabels.get(person.tableId ?? "") ?? "",
			isIndented: person.isUnnamed,
		};
		const existing = blocks.get(letter);
		if (existing) existing.push(entry);
		else blocks.set(letter, [entry]);
	}

	return [...blocks.entries()]
		.sort(([a], [b]) => collator.compare(a, b))
		.map(([letter, entries]) => ({ letter, entries }));
}

export const unseatedPeople = (board: SeatingBoardViewModel) =>
	board.people.filter((person) => person.tableId === null);
