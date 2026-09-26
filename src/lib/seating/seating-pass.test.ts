import { describe, expect, it } from "vitest";
import {
	type BuildSeatingPassInput,
	buildSeatingPass,
	countdownLabel,
	type SeatingPassTableRow,
	shortName,
	tableNumeral,
} from "@/lib/seating/seating-pass";

// 2026-09-20 12:00 Lima
const now = new Date("2026-09-20T17:00:00.000Z");
const eventIn = (days: number) =>
	new Date(Date.UTC(2026, 8, 20 + days)).toISOString();

const row = (
	inviteId: string,
	extraGuestId: string | null,
	over: {
		inviteStatus?: string;
		primaryName?: string;
		extra?: { status: string; name: string | null } | null;
	} = {},
) => ({
	inviteId,
	extraGuestId,
	invite: {
		status: over.inviteStatus ?? "confirmed",
		primaryName: over.primaryName ?? "Otro Invitado",
	},
	extraGuest: over.extra ?? null,
});

function input(
	over: Partial<BuildSeatingPassInput> = {},
): BuildSeatingPassInput {
	return {
		eventDate: eventIn(3),
		eventTime: "19:00",
		eventLocation: "Casa Daniela, Miraflores",
		showMates: true,
		showMap: true,
		invite: {
			id: "inv1",
			status: "confirmed",
			primaryName: "Lady Díaz",
			extraGuests: [{ id: "x1", name: "Marco", status: "confirmed" }],
		},
		tables: [
			{
				id: "t4",
				name: null,
				sortOrder: 3,
				capacity: 8,
				assignments: [row("inv1", null), row("inv1", "x1")],
			},
		],
		...over,
	};
}

describe("buildSeatingPass gate", () => {
	it.each([
		[6, false],
		[5, true],
		[0, true],
		[-1, true],
	])("days away %i → visible %s", (days, visible) => {
		const pass = buildSeatingPass(input({ eventDate: eventIn(days) }), now);
		expect(pass !== null).toBe(visible);
	});

	it("returns null without an event date", () => {
		expect(buildSeatingPass(input({ eventDate: null }), now)).toBeNull();
	});

	it.each(["pending", "declined"])("returns null for a %s invite", (status) => {
		const base = input();
		expect(
			buildSeatingPass({ ...base, invite: { ...base.invite, status } }, now),
		).toBeNull();
	});

	it("returns null when nobody in the party is seated", () => {
		expect(buildSeatingPass(input({ tables: [] }), now)).toBeNull();
	});
});

describe("buildSeatingPass content", () => {
	it("lists confirmed members with table labels", () => {
		const pass = buildSeatingPass(input(), now);
		expect(pass?.members.map((m) => [m.name, m.label])).toEqual([
			["Lady Díaz", "Mesa 4"],
			["Marco", "Mesa 4"],
		]);
		expect(pass?.headline).toEqual({ label: "Mesa 4", numeral: "4" });
	});

	it("marks partially seated members as Mesa por confirmar", () => {
		const base = input();
		const pass = buildSeatingPass(
			{
				...base,
				tables: [
					{
						...(base.tables[0] as SeatingPassTableRow),
						assignments: [row("inv1", null)],
					},
				],
			},
			now,
		);
		expect(pass?.members[1]?.label).toBe("Mesa por confirmar");
		expect(pass?.tables).toHaveLength(1);
	});

	it("omits a declined companion even with a stale assignment", () => {
		const base = input();
		const pass = buildSeatingPass(
			{
				...base,
				invite: {
					...base.invite,
					extraGuests: [{ id: "x1", name: "Marco", status: "declined" }],
				},
			},
			now,
		);
		expect(pass?.members.map((m) => m.name)).toEqual(["Lady Díaz"]);
		expect(pass?.tables[0]?.memberNames).toEqual(["Lady Díaz"]);
	});

	it("names an unnamed companion Acompañante", () => {
		const base = input();
		const pass = buildSeatingPass(
			{
				...base,
				invite: {
					...base.invite,
					extraGuests: [{ id: "x1", name: null, status: "confirmed" }],
				},
			},
			now,
		);
		expect(pass?.members[1]?.name).toBe("Acompañante");
	});

	it("splits tables ordered by sortOrder with custom labels", () => {
		const base = input();
		const pass = buildSeatingPass(
			{
				...base,
				tables: [
					{
						id: "t7",
						name: "Mesa 7 · niños",
						sortOrder: 6,
						capacity: 4,
						assignments: [row("inv1", "x1")],
					},
					{
						id: "t4",
						name: null,
						sortOrder: 3,
						capacity: 8,
						assignments: [row("inv1", null)],
					},
				],
			},
			now,
		);
		expect(pass?.tables.map((t) => t.label)).toEqual([
			"Mesa 4",
			"Mesa 7 · niños",
		]);
		expect(pass?.tables[1]?.numeral).toBe("Mesa 7 · niños");
	});

	it("tablemates exclude own party and non-confirmed people", () => {
		const base = input();
		const t = base.tables[0] as SeatingPassTableRow;
		const pass = buildSeatingPass(
			{
				...base,
				tables: [
					{
						...t,
						assignments: [
							...t.assignments,
							row("o1", null, { primaryName: "Ana Ríos" }),
							row("o2", null, {
								inviteStatus: "pending",
								primaryName: "Pedro Pendiente",
							}),
							row("o1", "e1", { extra: { status: "confirmed", name: "Luz" } }),
							row("o1", "e2", {
								extra: { status: "declined", name: "Nadie X" },
							}),
							row("o1", "e3", { extra: { status: "confirmed", name: null } }),
						],
					},
				],
			},
			now,
		);
		expect(pass?.tables[0]?.mates).toEqual(["Ana R.", "Luz"]);
	});

	it("yields no tablemates when showMates is off", () => {
		const base = input({ showMates: false });
		const t = base.tables[0] as SeatingPassTableRow;
		const pass = buildSeatingPass(
			{
				...base,
				tables: [
					{
						...t,
						assignments: [
							...t.assignments,
							row("o1", null, { primaryName: "Ana Ríos" }),
						],
					},
				],
			},
			now,
		);
		expect(pass?.tables[0]?.mates).toEqual([]);
	});

	it("hides location when showMap is off or location is blank", () => {
		expect(buildSeatingPass(input(), now)?.location).toBe(
			"Casa Daniela, Miraflores",
		);
		expect(
			buildSeatingPass(input({ showMap: false }), now)?.location,
		).toBeNull();
		expect(
			buildSeatingPass(input({ eventLocation: "  " }), now)?.location,
		).toBeNull();
	});
});

describe("helpers", () => {
	it("countdown label", () => {
		expect(countdownLabel(2)).toBe("Faltan 2 días");
		expect(countdownLabel(1)).toBe("Mañana");
		expect(countdownLabel(0)).toBe("Hoy");
		expect(countdownLabel(-1)).toBeNull();
	});
	it("shortName", () => {
		expect(shortName("Ana Ríos")).toBe("Ana R.");
		expect(shortName("Ana María de la Ríos")).toBe("Ana R.");
		expect(shortName("Luz")).toBe("Luz");
		expect(shortName("  ")).toBeNull();
	});
	it("tableNumeral", () => {
		expect(tableNumeral("Mesa 12")).toBe("12");
		expect(tableNumeral("Novios")).toBe("Novios");
	});
});
