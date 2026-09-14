import { describe, expect, it } from "vitest";
import type {
	SeatingBoardViewModel,
	SeatingPersonViewModel,
	SeatingTableViewModel,
} from "@/server/mappers/view-models";
import { buildPrintEntries, unseatedPeople } from "./print-entries";

const table = (
	id: string,
	label: string,
	overrides: Partial<SeatingTableViewModel> = {},
): SeatingTableViewModel => ({
	id,
	label,
	name: null,
	shape: "round",
	capacity: 10,
	seated: 0,
	x: 0,
	y: 0,
	sortOrder: 0,
	...overrides,
});

const person = (
	overrides: Partial<SeatingPersonViewModel> &
		Pick<SeatingPersonViewModel, "personId" | "displayName">,
): SeatingPersonViewModel => ({
	partyLabel: overrides.displayName,
	status: "confirmed",
	isUnnamed: false,
	inviteId: `invite_${overrides.personId}`,
	extraGuestId: null,
	inviteUrl: `https://awishfor.com/w/lista/${overrides.personId ?? "x"}`,
	tableId: null,
	seatedAt: null,
	...overrides,
});

const makeBoard = (
	people: SeatingPersonViewModel[],
	tables: SeatingTableViewModel[],
): SeatingBoardViewModel => {
	const seated = people.filter((entry) => entry.tableId !== null).length;
	return {
		wishlistId: "wishlist_1",
		tables,
		people,
		totals: {
			tables: tables.length,
			capacity: tables.reduce((sum, entry) => sum + entry.capacity, 0),
			eligiblePeople: people.length,
			seated,
			unseated: people.length - seated,
			declinedExcluded: 0,
		},
	};
};

describe("buildPrintEntries", () => {
	it("lists only seated people, alphabetically and not grouped by table", () => {
		const board = makeBoard(
			[
				person({
					personId: "p_zoe",
					displayName: "Zoe Ramos",
					tableId: "t2",
				}),
				person({
					personId: "p_ana",
					displayName: "Ana Bravo",
					tableId: "t1",
				}),
				person({ personId: "p_luis", displayName: "Luis Soto" }),
			],
			[table("t1", "Mesa 1"), table("t2", "Mesa 2")],
		);

		const blocks = buildPrintEntries(board);
		const names = blocks.flatMap((block) =>
			block.entries.map((entry) => entry.name),
		);

		expect(names).toEqual(["Ana Bravo", "Zoe Ramos"]);
		expect(names).not.toContain("Luis Soto");
		expect(blocks.map((block) => block.letter)).toEqual(["A", "Z"]);
		expect(blocks[0]?.entries[0]?.tableLabel).toBe("Mesa 1");
	});

	it("indents an unnamed companion beneath their party's primary guest", () => {
		const board = makeBoard(
			[
				person({
					personId: "invite:i_torres",
					displayName: "María Torres",
					partyLabel: "María Torres",
					inviteId: "i_torres",
					tableId: "t1",
				}),
				person({
					personId: "eg_1",
					displayName: "Acompañante",
					partyLabel: "María Torres",
					isUnnamed: true,
					inviteId: "i_torres",
					extraGuestId: "eg_1",
					tableId: "t1",
				}),
				person({
					personId: "invite:i_bravo",
					displayName: "Ana Bravo",
					partyLabel: "Ana Bravo",
					inviteId: "i_bravo",
					tableId: "t1",
				}),
			],
			[table("t1", "Mesa 1")],
		);

		const blocks = buildPrintEntries(board);
		// The companion sorts under M with María, never under A on "Acompañante".
		expect(blocks.map((block) => block.letter)).toEqual(["A", "M"]);
		expect(blocks[1]?.entries).toEqual([
			expect.objectContaining({ name: "María Torres", isIndented: false }),
			expect.objectContaining({
				name: "Acompañante de María Torres",
				isIndented: true,
			}),
		]);
	});
});

describe("unseatedPeople", () => {
	it("names exactly the eligible people without a table", () => {
		const board = makeBoard(
			[
				person({ personId: "p1", displayName: "Ana Bravo", tableId: "t1" }),
				person({ personId: "p2", displayName: "Luis Soto" }),
				person({ personId: "p3", displayName: "Rosa Vidal" }),
			],
			[table("t1", "Mesa 1")],
		);

		expect(unseatedPeople(board).map((entry) => entry.displayName)).toEqual([
			"Luis Soto",
			"Rosa Vidal",
		]);
	});
});
