// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type {
	SeatingPassMemberViewModel,
	SeatingPassTableViewModel,
	SeatingPassViewModel,
} from "@/server/mappers/view-models";
import { SAMPLE_SEATING_PASS } from "./sample";
import { SeatingPass } from "./seating-pass";

const noMates: SeatingPassViewModel = {
	...SAMPLE_SEATING_PASS,
	tables: SAMPLE_SEATING_PASS.tables.map((table) => ({ ...table, mates: [] })),
};

describe.each([
	"pass",
	"ring",
] as const)("SeatingPass %s variant", (variant) => {
	it("renders the party and their table labels", () => {
		render(<SeatingPass pass={SAMPLE_SEATING_PASS} variant={variant} />);
		expect(screen.getAllByText(/Mesa 4/).length).toBeGreaterThan(0);
		expect(screen.getAllByText(/Mesa 7 · niños/).length).toBeGreaterThan(0);
		expect(screen.getAllByText(/Sofía/).length).toBeGreaterThan(0);
		expect(screen.getByText("Faltan 3 días")).toBeInTheDocument();
	});

	it("shows tablemates only when present", () => {
		const { rerender } = render(
			<SeatingPass pass={SAMPLE_SEATING_PASS} variant={variant} />,
		);
		expect(screen.getByText(/Ana R\., Pedro R\./)).toBeInTheDocument();
		rerender(<SeatingPass pass={noMates} variant={variant} />);
		expect(screen.queryByText(/También|también/)).not.toBeInTheDocument();
		expect(screen.queryByText(/Ana R\./)).not.toBeInTheDocument();
	});

	it("shows venue links for the location and hides them without one", () => {
		const { rerender } = render(
			<SeatingPass pass={SAMPLE_SEATING_PASS} variant={variant} />,
		);
		const maps = screen
			.getAllByRole("link")
			.find((link) => link.getAttribute("href")?.includes("google.com/maps"));
		expect(maps).toHaveAttribute("target", "_blank");
		expect(
			screen
				.getAllByRole("link")
				.some((link) => link.getAttribute("href")?.includes("waze.com")),
		).toBe(true);
		rerender(
			<SeatingPass
				pass={{ ...SAMPLE_SEATING_PASS, location: null }}
				variant={variant}
			/>,
		);
		expect(screen.queryAllByRole("link")).toHaveLength(0);
	});
});

describe("SeatingPass ring specifics", () => {
	it("caps dots at 12 and shows the real size for large tables", () => {
		const big: SeatingPassViewModel = {
			...SAMPLE_SEATING_PASS,
			tables: [
				{
					...(SAMPLE_SEATING_PASS.tables[0] as SeatingPassTableViewModel),
					capacity: 20,
				},
			],
			members: SAMPLE_SEATING_PASS.members.slice(0, 2),
		};
		const { container } = render(<SeatingPass pass={big} variant="ring" />);
		expect(container.querySelectorAll("[data-seat]")).toHaveLength(12);
		expect(container.querySelectorAll('[data-filled="true"]')).toHaveLength(2);
		expect(screen.getByText("Mesa de 20")).toBeInTheDocument();
		expect(
			screen.getByRole("img", {
				name: "Mesa 4: 2 de 20 lugares son de tu grupo",
			}),
		).toBeInTheDocument();
	});

	it("shows an unseated member in a trailing Mesa por confirmar row", () => {
		const partial: SeatingPassViewModel = {
			...SAMPLE_SEATING_PASS,
			members: [
				SAMPLE_SEATING_PASS.members[0] as SeatingPassMemberViewModel,
				{ id: "m", name: "Marco", label: "Mesa por confirmar", tableId: null },
			],
			tables: [
				{
					...(SAMPLE_SEATING_PASS.tables[0] as SeatingPassTableViewModel),
					memberNames: ["Lady Díaz"],
				},
			],
		};
		render(<SeatingPass pass={partial} variant="ring" />);
		expect(screen.getByText("Mesa por confirmar")).toBeInTheDocument();
	});
});

describe("SeatingPass pass specifics", () => {
	it("shows the numeral for 'Mesa N' and the label otherwise", () => {
		const { rerender } = render(
			<SeatingPass pass={SAMPLE_SEATING_PASS} variant="pass" />,
		);
		expect(screen.getByText("4")).toBeInTheDocument();
		rerender(
			<SeatingPass
				pass={{
					...SAMPLE_SEATING_PASS,
					headline: { label: "Novios", numeral: "Novios" },
				}}
				variant="pass"
			/>,
		);
		expect(screen.getByText("Novios")).toBeInTheDocument();
	});
});
