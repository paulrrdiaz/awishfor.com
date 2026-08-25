// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CalendarSaveControl } from "./calendar-save-control";

const PROPS = {
	title: "Boda de Ana y Luis",
	eventDate: "2026-10-17",
	eventTime: "14:30",
	endTime: null,
	location: "Barranco, Lima",
	description: "Una tarde para celebrar juntos.",
	inviteUrl: "https://awishfor.com/w/boda/ana",
};

afterEach(() => {
	vi.restoreAllMocks();
});

describe("CalendarSaveControl", () => {
	it("exposes accessible Google Calendar and iCalendar actions", () => {
		render(<CalendarSaveControl {...PROPS} />);
		const trigger = screen.getByRole("button", {
			name: "Guardar en mi calendario",
		});

		expect(trigger).toHaveAttribute("aria-expanded", "false");
		fireEvent.click(trigger);
		expect(
			screen.getByRole("menuitem", { name: "Abrir en Google Calendar" }),
		).toHaveAttribute("href", expect.stringContaining("calendar.google.com"));
		expect(
			screen.getByRole("menuitem", {
				name: "Descargar .ics para Apple, Outlook y otros calendarios",
			}),
		).toBeVisible();
	});

	it("downloads the generated iCalendar file", () => {
		const createObjectUrl = vi
			.spyOn(URL, "createObjectURL")
			.mockReturnValue("blob:calendar");
		const revokeObjectUrl = vi.spyOn(URL, "revokeObjectURL");
		const anchorClick = vi
			.spyOn(HTMLAnchorElement.prototype, "click")
			.mockImplementation(() => undefined);

		render(<CalendarSaveControl {...PROPS} />);
		fireEvent.click(
			screen.getByRole("button", { name: "Guardar en mi calendario" }),
		);
		fireEvent.click(
			screen.getByRole("menuitem", {
				name: "Descargar .ics para Apple, Outlook y otros calendarios",
			}),
		);

		expect(createObjectUrl).toHaveBeenCalledWith(expect.any(Blob));
		expect(anchorClick).toHaveBeenCalledOnce();
		expect(revokeObjectUrl).toHaveBeenCalledWith("blob:calendar");
	});

	it("closes the action menu when the guest clicks outside it", () => {
		render(<CalendarSaveControl {...PROPS} />);
		fireEvent.click(
			screen.getByRole("button", { name: "Guardar en mi calendario" }),
		);

		expect(screen.getByRole("menu")).toBeVisible();
		fireEvent.pointerDown(document.body);

		expect(screen.queryByRole("menu")).toBeNull();
	});

	it("uses semantic tokens and safe-area-aware fixed placement", () => {
		const { container } = render(<CalendarSaveControl {...PROPS} />);
		const fixedContainer = container.firstElementChild as HTMLElement;
		const trigger = screen.getByRole("button", {
			name: "Guardar en mi calendario",
		});

		expect(fixedContainer.className).toContain("fixed");
		expect(fixedContainer.className).toContain("safe-area-inset-bottom");
		fireEvent.click(trigger);
		expect(fixedContainer.className).toContain(
			"right-[max(1rem,env(safe-area-inset-right))]",
		);
		expect(screen.getByRole("menu").className).toContain("right-0");
		expect(trigger.className).toContain("bg-card");
		expect(trigger.className).toContain("border-border");
		expect(trigger.className).toContain("focus-visible:ring-ring");
		expect(trigger.className).not.toMatch(
			/(?:bg|text|border)-(?:slate|gray|white|black|red|blue|green)-/,
		);
	});
});
