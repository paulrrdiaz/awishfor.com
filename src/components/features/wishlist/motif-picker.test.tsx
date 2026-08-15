// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MotifPicker } from "./motif-picker";

function noop() {}

describe("MotifPicker", () => {
	it("renders nothing for an ungated event type", () => {
		const { container } = render(
			<MotifPicker
				eventType="wedding"
				motifId={null}
				motifPalette={null}
				motifTreatment={null}
				onSelectMotif={noop}
				onSelectPalette={noop}
				onSelectTreatment={noop}
				themeId="crema-elegante"
			/>,
		);
		expect(container).toBeEmptyDOMElement();
	});

	it("renders for baby_shower and birthday", () => {
		const { container: babyShower } = render(
			<MotifPicker
				eventType="baby_shower"
				motifId={null}
				motifPalette={null}
				motifTreatment={null}
				onSelectMotif={noop}
				onSelectPalette={noop}
				onSelectTreatment={noop}
				themeId="cielo-suave"
			/>,
		);
		expect(babyShower).not.toBeEmptyDOMElement();

		const { container: birthday } = render(
			<MotifPicker
				eventType="birthday"
				motifId={null}
				motifPalette={null}
				motifTreatment={null}
				onSelectMotif={noop}
				onSelectPalette={noop}
				onSelectTreatment={noop}
				themeId="lavanda-fiesta"
			/>,
		);
		expect(birthday).not.toBeEmptyDOMElement();
	});

	it("offers all nine sets for baby_shower", () => {
		render(
			<MotifPicker
				eventType="baby_shower"
				motifId={null}
				motifPalette={null}
				motifTreatment={null}
				onSelectMotif={noop}
				onSelectPalette={noop}
				onSelectTreatment={noop}
				themeId="cielo-suave"
			/>,
		);
		// "Sin motivo" + 9 motif sets
		expect(screen.getAllByRole("button", { pressed: false }).length + 1).toBe(
			10,
		);
	});

	it("offers exactly four sets for birthday", () => {
		render(
			<MotifPicker
				eventType="birthday"
				motifId={null}
				motifPalette={null}
				motifTreatment={null}
				onSelectMotif={noop}
				onSelectPalette={noop}
				onSelectTreatment={noop}
				themeId="lavanda-fiesta"
			/>,
		);
		expect(screen.getByText("Unicornio y arcoíris")).toBeInTheDocument();
		expect(screen.getByText("Elefante y globo")).toBeInTheDocument();
		expect(screen.getByText("Luna y estrellas")).toBeInTheDocument();
		expect(screen.getByText("Lazos y flores")).toBeInTheDocument();
		expect(screen.queryByText("Osito y nube")).not.toBeInTheDocument();
	});

	it("defaults to 'Sin motivo' selected when motifId is null", () => {
		render(
			<MotifPicker
				eventType="baby_shower"
				motifId={null}
				motifPalette={null}
				motifTreatment={null}
				onSelectMotif={noop}
				onSelectPalette={noop}
				onSelectTreatment={noop}
				themeId="cielo-suave"
			/>,
		);
		expect(screen.getByRole("button", { name: /sin motivo/i })).toHaveAttribute(
			"aria-pressed",
			"true",
		);
	});

	it("calls onSelectMotif with null when 'Sin motivo' is chosen", async () => {
		const onSelectMotif = vi.fn();
		render(
			<MotifPicker
				eventType="baby_shower"
				motifId="bear-cloud"
				motifPalette={null}
				motifTreatment={null}
				onSelectMotif={onSelectMotif}
				onSelectPalette={noop}
				onSelectTreatment={noop}
				themeId="cielo-suave"
			/>,
		);
		screen.getByRole("button", { name: /sin motivo/i }).click();
		expect(onSelectMotif).toHaveBeenCalledWith(null);
	});

	it("shows Spanish treatment labels bound to English stored values", () => {
		render(
			<MotifPicker
				eventType="baby_shower"
				motifId="bear-cloud"
				motifPalette="fixed"
				motifTreatment="scene"
				onSelectMotif={noop}
				onSelectPalette={noop}
				onSelectTreatment={noop}
				themeId="cielo-suave"
			/>,
		);
		const scene = screen.getByRole("button", { name: "Escena" });
		const band = screen.getByRole("button", { name: "Banda" });
		expect(scene).toHaveAttribute("aria-pressed", "true");
		expect(band).toHaveAttribute("aria-pressed", "false");
	});

	it("hides treatment and palette controls until a motif is chosen", () => {
		render(
			<MotifPicker
				eventType="baby_shower"
				motifId={null}
				motifPalette={null}
				motifTreatment={null}
				onSelectMotif={noop}
				onSelectPalette={noop}
				onSelectTreatment={noop}
				themeId="cielo-suave"
			/>,
		);
		expect(screen.queryByText("Tratamiento")).not.toBeInTheDocument();
		expect(screen.queryByText("Paleta")).not.toBeInTheDocument();
	});
});
