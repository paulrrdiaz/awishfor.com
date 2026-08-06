// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HeroCarouselGallery } from "./hero-gallery";

const images = [
	{ url: "https://example.com/cover-1.jpg" },
	{ url: "https://example.com/cover-2.jpg" },
];

describe("HeroCarouselGallery", () => {
	it("renders reusable compact controls without the gallery caption", () => {
		const { container } = render(
			<HeroCarouselGallery
				alt="Celebración"
				controlsVariant="compact"
				images={images}
				priority={false}
				startIndex={1}
			/>,
		);

		expect(screen.getByRole("button", { name: "Foto anterior" })).toBeVisible();
		expect(
			screen.getByRole("button", { name: "Foto siguiente" }),
		).toBeVisible();
		expect(screen.queryByText(/Galería · foto/)).not.toBeInTheDocument();
		expect(
			container.querySelectorAll('[aria-roledescription="slide"]'),
		).toHaveLength(2);
	});

	it("renders a single image without carousel controls", () => {
		render(
			<HeroCarouselGallery
				alt="Celebración"
				images={images.slice(0, 1)}
				priority={false}
			/>,
		);

		expect(
			screen.queryByRole("button", { name: "Foto anterior" }),
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: "Foto siguiente" }),
		).not.toBeInTheDocument();
	});
});
