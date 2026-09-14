import { describe, expect, it } from "vitest";
import type { SeatingPersonViewModel } from "@/server/mappers/view-models";
import {
	seatBubbleLayout,
	seatFullLabel,
	seatInitials,
	seatShortLabel,
	seatStatusLabel,
	tableAriaLabel,
	tableGeometry,
} from "./seating-geometry";

const person = (
	displayName: string,
	overrides: Partial<SeatingPersonViewModel> = {},
): SeatingPersonViewModel => ({
	personId: `p_${displayName}`,
	displayName,
	partyLabel: displayName,
	status: "confirmed",
	isUnnamed: false,
	inviteId: `i_${displayName}`,
	extraGuestId: null,
	inviteUrl: `https://awishfor.com/w/lista/${overrides.personId ?? "x"}`,
	tableId: "t1",
	seatedAt: null,
	...overrides,
});

const people = (count: number) =>
	Array.from({ length: count }, (_unused, index) => person(`Invitado${index}`));

describe("seatShortLabel", () => {
	it("uses the first name, which is what a host scans for", () => {
		expect(seatShortLabel(person("María Fernanda Torres"))).toBe("María");
	});

	it("marks an unnamed companion rather than showing a blank bubble", () => {
		expect(
			seatShortLabel(
				person("Acompañante", {
					isUnnamed: true,
					partyLabel: "Familia Quispe",
				}),
			),
		).toBe("Acomp.");
		expect(
			seatFullLabel(
				person("Acompañante", {
					isUnnamed: true,
					partyLabel: "Familia Quispe",
				}),
			),
		).toBe("Acompañante de Familia Quispe");
	});
});

describe("seatInitials", () => {
	it("takes at most two initials", () => {
		expect(seatInitials(person("María Fernanda Torres"))).toBe("MF");
		expect(seatInitials(person("Renee"))).toBe("R");
	});

	it("marks an unnamed companion as a plus-one", () => {
		expect(seatInitials(person("Acompañante", { isUnnamed: true }))).toBe("+1");
	});
});

describe("seatBubbleLayout", () => {
	const round = (capacity: number) => ({ shape: "round", capacity });
	const rect = (capacity: number) => ({ shape: "rectangular", capacity });

	it("renders one bubble per seated person, not per seat", () => {
		const layout = seatBubbleLayout(round(10), people(3));
		expect(layout.bubbles).toHaveLength(3);
	});

	it("keeps a person's position stable when somebody else leaves", () => {
		const all = people(4);
		const before = seatBubbleLayout(round(10), all);
		// Drop the last person; the first three must not shuffle around the rim.
		const after = seatBubbleLayout(round(10), all.slice(0, 3));

		for (let index = 0; index < 3; index += 1) {
			expect(after.bubbles[index]?.x).toBeCloseTo(
				before.bubbles[index]?.x ?? Number.NaN,
			);
			expect(after.bubbles[index]?.y).toBeCloseTo(
				before.bubbles[index]?.y ?? Number.NaN,
			);
		}
	});

	it("shows names while they fit and degrades before they collide", () => {
		expect(seatBubbleLayout(round(6), people(6)).mode).toBe("name");
		// The common case: a round table for ten still shows first names.
		expect(seatBubbleLayout(round(10), people(10)).mode).toBe("name");
		expect(seatBubbleLayout(round(12), people(12)).mode).toBe("name");
		expect(seatBubbleLayout(round(16), people(16)).mode).toBe("initials");
		expect(seatBubbleLayout(round(20), people(20)).mode).toBe("initials");
		expect(seatBubbleLayout(rect(10), people(10)).mode).toBe("name");
	});

	it("never places two bubbles on top of each other", () => {
		for (const capacity of [2, 5, 8, 10, 12, 16, 20]) {
			const layout = seatBubbleLayout(round(capacity), people(capacity));
			const seen = new Set<string>();
			for (const bubble of layout.bubbles) {
				const key = `${Math.round(bubble.x)}:${Math.round(bubble.y)}`;
				expect(seen.has(key)).toBe(false);
				seen.add(key);
			}
		}
	});

	it("splits a rectangular table between its two long edges", () => {
		const { height } = tableGeometry(rect(8));
		const layout = seatBubbleLayout(rect(8), people(8));
		const above = layout.bubbles.filter((bubble) => bubble.y < 0).length;
		const below = layout.bubbles.filter((bubble) => bubble.y > height).length;

		expect(above).toBe(4);
		expect(below).toBe(4);
	});

	it("carries the person's status so a pending guest reads differently", () => {
		const layout = seatBubbleLayout(round(4), [
			person("Marvin", { status: "pending" }),
		]);
		expect(layout.bubbles[0]?.status).toBe("pending");
		expect(layout.bubbles[0]?.statusLabel).toBe("Pendiente de respuesta");
	});

	it("carries what the tooltip and the copy action need", () => {
		const [bubble] = seatBubbleLayout(round(6), [
			person("Luis Santos", {
				partyLabel: "Familia Santos",
				inviteUrl: "https://awishfor.com/w/boda/luis-santos",
				status: "confirmed",
			}),
		]).bubbles;

		expect(bubble).toMatchObject({
			title: "Luis Santos",
			partyLabel: "Familia Santos",
			statusLabel: "Confirmado",
			inviteUrl: "https://awishfor.com/w/boda/luis-santos",
		});
	});

	it("gives a companion the same invitation link as their party", () => {
		const url = "https://awishfor.com/w/boda/familia-quispe";
		const layout = seatBubbleLayout(round(6), [
			person("Rosa Quispe", { inviteUrl: url }),
			person("Acompañante", { isUnnamed: true, inviteUrl: url }),
		]);

		expect(layout.bubbles.map((bubble) => bubble.inviteUrl)).toEqual([
			url,
			url,
		]);
	});

	it("returns nothing for an empty table", () => {
		expect(seatBubbleLayout(round(10), []).bubbles).toEqual([]);
	});
});

describe("seatStatusLabel", () => {
	it("spells the RSVP state out for the tooltip", () => {
		expect(seatStatusLabel("confirmed")).toBe("Confirmado");
		expect(seatStatusLabel("pending")).toBe("Pendiente de respuesta");
		expect(seatStatusLabel("declined")).toBe("No asistirá");
	});
});

describe("tableAriaLabel", () => {
	it("names who is seated, so the bubbles are not the only way to read it", () => {
		const label = tableAriaLabel(
			{ label: "Mesa 1", seated: 2, capacity: 10 },
			"open",
			"round",
			[person("Luis Santos"), person("Renee")],
		);

		expect(label).toBe(
			"Mesa 1, 2 de 10 asientos ocupados, redonda. Sentados: Luis Santos, Renee",
		);
	});

	it("omits the roster when nobody is seated", () => {
		expect(
			tableAriaLabel(
				{ label: "Mesa 2", seated: 0, capacity: 8 },
				"empty",
				"round",
			),
		).toBe("Mesa 2, 0 de 8 asientos ocupados, vacía");
	});
});
