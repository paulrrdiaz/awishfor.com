import { describe, expect, it } from "vitest";
import { mobileChipItemsFor, navItemsFor } from "./wishlist-sections";

describe("mobileChipItemsFor", () => {
	it("leads with Regalos, Invitados, Resumen, Tema for an owner", () => {
		const segments = mobileChipItemsFor(true).map((item) => item.segment);
		expect(segments).toEqual(["gifts", "guests", "", "design"]);
	});

	it("leads with the same order for a collaborator, since none of the four is owner-only", () => {
		const ownerSegments = mobileChipItemsFor(true).map((item) => item.segment);
		const collaboratorSegments = mobileChipItemsFor(false).map(
			(item) => item.segment,
		);
		expect(collaboratorSegments).toEqual(ownerSegments);
	});

	it("omits Colaboradores and Ajustes, which stay reachable only via the sections sheet", () => {
		const segments = mobileChipItemsFor(true).map((item) => item.segment);
		expect(segments).not.toContain("collaborators");
		expect(segments).not.toContain("settings");
	});

	it("carries the same labels the desktop tabs use for the same segments", () => {
		const chips = mobileChipItemsFor(true);
		const desktopTabs = navItemsFor(true);
		for (const chip of chips) {
			const desktopTab = desktopTabs.find(
				(item) => item.segment === chip.segment,
			);
			expect(desktopTab?.label).toBe(chip.label);
		}
	});
});
