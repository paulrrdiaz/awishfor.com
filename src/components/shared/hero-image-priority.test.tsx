// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import type { ImgHTMLAttributes } from "react";
import { describe, expect, it, vi } from "vitest";
import { HeroCarouselGallery } from "./hero-gallery";
import { WishlistHero } from "./wishlist-hero";

vi.mock("next/image", () => ({
	default: ({
		alt = "",
		priority,
		fill: _fill,
		...props
	}: ImgHTMLAttributes<HTMLImageElement> & {
		priority?: boolean;
		fill?: boolean;
	}) => (
		// biome-ignore lint/performance/noImgElement: next/image test double
		<img alt={alt} data-priority={priority ? "true" : "false"} {...props} />
	),
}));

const wishlist = {
	heroTitle: "Nuestra boda",
	title: "Lista",
	displayName: "Ana y Luis",
	coverImageUrl: "/cover.jpg",
	eventDate: null,
	eventTime: null,
	eventLocation: null,
};

describe("explicit public hero image priority", () => {
	it("lets a live above-the-fold wishlist opt into priority", () => {
		render(<WishlistHero priority wishlist={wishlist} />);
		expect(screen.getByRole("img")).toHaveAttribute("data-priority", "true");
	});

	it("lets compact or embedded media opt out of preload hints", () => {
		const { rerender } = render(
			<WishlistHero priority={false} wishlist={wishlist} />,
		);
		expect(screen.getByRole("img")).toHaveAttribute("data-priority", "false");

		rerender(
			<HeroCarouselGallery
				alt="Nuestra boda"
				images={["/cover.jpg"]}
				priority={false}
			/>,
		);
		expect(screen.getByRole("img")).toHaveAttribute("data-priority", "false");
	});
});
