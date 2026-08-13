// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { Carousel, CarouselContent, CarouselItem } from "./carousel";

describe("CarouselContent", () => {
	beforeAll(() => {
		vi.stubGlobal(
			"IntersectionObserver",
			class IntersectionObserver {
				observe() {}
				unobserve() {}
				disconnect() {}
			},
		);
	});

	it("fills a height-constrained carousel viewport", () => {
		const { container } = render(
			<Carousel className="h-96">
				<CarouselContent>
					<CarouselItem>Slide</CarouselItem>
				</CarouselContent>
			</Carousel>,
		);

		expect(
			container.querySelector('[data-slot="carousel-content"]'),
		).toHaveClass("h-full");
	});

	it("clips the viewport to its default shape when viewportClassName is omitted", () => {
		const { container } = render(
			<Carousel className="h-96">
				<CarouselContent>
					<CarouselItem>Slide</CarouselItem>
				</CarouselContent>
			</Carousel>,
		);

		expect(
			container.querySelector('[data-slot="carousel-content"]'),
		).toHaveClass("h-full", "overflow-hidden");
	});

	it("merges viewportClassName into the viewport element", () => {
		const { container } = render(
			<Carousel className="h-96">
				<CarouselContent viewportClassName="rounded-full size-[172px]">
					<CarouselItem>Slide</CarouselItem>
				</CarouselContent>
			</Carousel>,
		);

		const viewport = container.querySelector('[data-slot="carousel-content"]');
		expect(viewport).toHaveClass("rounded-full", "size-[172px]");
		expect(
			viewport?.querySelector('[data-slot="carousel-item"]'),
		).not.toBeNull();
	});
});
