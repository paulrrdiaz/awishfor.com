// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { HeroCtas } from "./hero-ctas";

describe("HeroCtas", () => {
	it("smoothly scrolls to the gift section in its own template", async () => {
		const user = userEvent.setup();
		const firstScroll = vi.fn();
		const secondScroll = vi.fn();

		render(
			<>
				<div className="public-theme">
					<HeroCtas showHowItWorks />
					<section
						id="regalos"
						ref={(node) => {
							if (node) node.scrollIntoView = firstScroll;
						}}
					/>
				</div>
				<div className="public-theme">
					<HeroCtas showHowItWorks />
					<section
						id="regalos"
						ref={(node) => {
							if (node) node.scrollIntoView = secondScroll;
						}}
					/>
				</div>
			</>,
		);

		const [, secondGiftLink] = screen.getAllByRole("link", {
			name: "Ver regalos disponibles",
		});
		if (!secondGiftLink) {
			throw new Error("Expected a second template gift link");
		}
		await user.click(secondGiftLink);

		expect(firstScroll).not.toHaveBeenCalled();
		expect(secondScroll).toHaveBeenCalledWith({
			behavior: "smooth",
			block: "start",
		});
	});

	it("respects reduced-motion preferences", async () => {
		const user = userEvent.setup();
		const scrollIntoView = vi.fn();
		vi.spyOn(window, "matchMedia").mockReturnValue({
			matches: true,
		} as MediaQueryList);

		render(
			<div className="public-theme">
				<HeroCtas showHowItWorks />
				<section
					id="regalos"
					ref={(node) => {
						if (node) node.scrollIntoView = scrollIntoView;
					}}
				/>
			</div>,
		);

		await user.click(
			screen.getByRole("link", { name: "Ver regalos disponibles" }),
		);

		expect(scrollIntoView).toHaveBeenCalledWith({
			behavior: "auto",
			block: "start",
		});
	});

	it("renders the secondary control as a button only when enabled", () => {
		const { rerender } = render(<HeroCtas showHowItWorks={false} />);

		expect(
			screen.queryByRole("button", { name: "Cómo funciona" }),
		).not.toBeInTheDocument();

		rerender(<HeroCtas showHowItWorks />);

		expect(
			screen.getByRole("button", { name: "Cómo funciona" }),
		).toBeInTheDocument();
	});

	it("opens the approved steps and returns focus after Entendido", async () => {
		const user = userEvent.setup();
		render(
			<div className="public-theme">
				<HeroCtas showHowItWorks />
			</div>,
		);

		const trigger = screen.getByRole("button", { name: "Cómo funciona" });
		await user.click(trigger);

		await waitFor(() => {
			expect(
				screen.getByRole("heading", { name: "¿Cómo funciona?" }),
			).toBeInTheDocument();
		});
		expect(screen.getByText("Elige un regalo")).toBeInTheDocument();
		expect(screen.getByText("Márcalo como regalado")).toBeInTheDocument();
		expect(screen.getByText("¡Listo!")).toBeInTheDocument();
		expect(
			screen.getByText("Haz clic en el botón y confirma tu regalo."),
		).toBeInTheDocument();
		expect(
			screen.getByText("Explora la lista y elige el regalo que quieres dar."),
		).toBeInTheDocument();
		expect(
			screen.getByText(
				"Queda reservado para que nadie más lo repita — el anfitrión también lo verá.",
			),
		).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "Entendido" }));

		await waitFor(() => {
			expect(
				screen.queryByRole("heading", { name: "¿Cómo funciona?" }),
			).not.toBeInTheDocument();
		});
		expect(document.activeElement).toBe(trigger);
	});

	it("portals only into the triggering public theme", async () => {
		const user = userEvent.setup();
		render(
			<>
				<div className="public-theme" data-theme="first">
					<HeroCtas showHowItWorks />
				</div>
				<div className="public-theme" data-theme="second">
					<HeroCtas showHowItWorks />
				</div>
			</>,
		);

		const [, secondTrigger] = screen.getAllByRole("button", {
			name: "Cómo funciona",
		});
		if (!secondTrigger) throw new Error("Expected a second drawer trigger");
		await user.click(secondTrigger);

		await waitFor(() => {
			const secondTheme = document.querySelector('[data-theme="second"]');
			expect(
				secondTheme?.querySelector('[data-slot="drawer-content"]'),
			).toBeTruthy();
		});
		expect(
			document.querySelector(
				'[data-theme="first"] [data-slot="drawer-content"]',
			),
		).toBeNull();
	});
});
