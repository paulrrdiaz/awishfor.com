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
});
