// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LayoutPicker } from "@/components/features/wishlist/layout-picker";
import { getAllLayouts } from "@/config/public-layouts";

const LAYOUTS = getAllLayouts();

describe("LayoutPicker", () => {
	describe("compact presentation (default)", () => {
		it("shows the current selection as a trigger without rendering the full grid", () => {
			render(
				<LayoutPicker
					onSelect={vi.fn()}
					options={LAYOUTS}
					selected="carousel-hero"
				/>,
			);

			expect(screen.getByText("Carrusel Principal")).toBeTruthy();
			expect(screen.getByText("Cambiar")).toBeTruthy();
			expect(screen.queryByText("Editorial Revista")).toBeNull();
		});

		it("falls back to the default layout when selection is missing", () => {
			render(
				<LayoutPicker onSelect={vi.fn()} options={LAYOUTS} selected={null} />,
			);

			expect(screen.getByText("Editorial Revista")).toBeTruthy();
		});

		it("opens the modal grid and reports the selected id", async () => {
			const onSelect = vi.fn();
			const user = userEvent.setup();
			render(
				<LayoutPicker onSelect={onSelect} options={LAYOUTS} selected={null} />,
			);

			await user.click(screen.getByRole("button", { name: /cambiar/i }));
			await user.click(screen.getByRole("button", { name: /trío en arco/i }));

			expect(onSelect).toHaveBeenCalledWith("arch-trio");
		});
	});

	describe("inline presentation", () => {
		it("renders all nine layout thumbnails in place with no trigger or modal", () => {
			render(
				<LayoutPicker
					onSelect={vi.fn()}
					options={LAYOUTS}
					selected="magazine-editorial"
					variant="inline"
				/>,
			);

			expect(screen.queryByText("Cambiar")).toBeNull();
			for (const layout of LAYOUTS) {
				expect(screen.getByText(layout.label)).toBeTruthy();
			}
		});

		it("reports the selected layout id the same way as the compact presentation", async () => {
			const onSelect = vi.fn();
			const user = userEvent.setup();
			render(
				<LayoutPicker
					onSelect={onSelect}
					options={LAYOUTS}
					selected={null}
					variant="inline"
				/>,
			);

			await user.click(screen.getByRole("button", { name: /trío en arco/i }));

			expect(onSelect).toHaveBeenCalledWith("arch-trio");
		});
	});
});
