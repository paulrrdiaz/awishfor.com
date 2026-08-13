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

	it("clips the multi-image viewport to className when viewportClassName is omitted", () => {
		const { container } = render(
			<HeroCarouselGallery
				alt="Celebración"
				className="test-frame"
				images={images}
				priority={false}
			/>,
		);

		const viewport = container.querySelector('[data-slot="carousel-content"]');
		expect(viewport).toHaveClass("h-full", "overflow-hidden");
		expect(viewport).not.toHaveClass("test-frame");
	});

	it("clips the single-image fallback to className when viewportClassName is omitted", () => {
		const { container } = render(
			<HeroCarouselGallery
				alt="Celebración"
				className="test-frame"
				images={images.slice(0, 1)}
				priority={false}
			/>,
		);

		expect(container.querySelector(".relative.overflow-hidden")).toHaveClass(
			"test-frame",
		);
	});

	it("clips to viewportClassName instead of className when both are given", () => {
		const { container } = render(
			<HeroCarouselGallery
				alt="Celebración"
				className="test-frame"
				images={images}
				priority={false}
				viewportClassName="test-viewport"
			/>,
		);

		const viewport = container.querySelector('[data-slot="carousel-content"]');
		expect(viewport).toHaveClass("test-viewport");
		expect(viewport).not.toHaveClass("test-frame");
	});

	// Regression coverage for arch-trio's actual geometry: the root fills the
	// 240x280 arc box (`absolute inset-0`) while the viewport is a smaller,
	// offset circle (`absolute top-4 left-0 size-[172px] rounded-full`).
	// `inset-0` and `top-4 left-0` conflict in the same tailwind-merge group,
	// so this proves the viewport's positioning wins instead of silently
	// losing to the root's.
	const archTrioRootClassName = "absolute inset-0 z-[2]";
	const archTrioViewportClassName =
		"absolute top-4 left-0 size-[172px] rounded-full";

	it("arch-trio geometry: viewport positioning wins over the root's inset-0 (multi-image)", () => {
		const { container } = render(
			<HeroCarouselGallery
				alt="Trío"
				className={archTrioRootClassName}
				images={images}
				priority={false}
				viewportClassName={archTrioViewportClassName}
			/>,
		);

		const viewport = container.querySelector('[data-slot="carousel-content"]');
		expect(viewport).toHaveClass(
			"top-4",
			"left-0",
			"size-[172px]",
			"rounded-full",
		);
		expect(viewport).not.toHaveClass("inset-0");
	});

	it("arch-trio geometry: viewportClassName fully replaces className in the fallback (0 images, placeholder)", () => {
		const { container } = render(
			<HeroCarouselGallery
				alt="Trío"
				className={archTrioRootClassName}
				images={[]}
				priority={false}
				viewportClassName={archTrioViewportClassName}
			/>,
		);

		const placeholder = container.querySelector("[aria-hidden]");
		expect(placeholder).toHaveClass(
			"top-4",
			"left-0",
			"size-[172px]",
			"rounded-full",
		);
		expect(placeholder).not.toHaveClass("inset-0", "z-[2]");
	});
});
