// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveLayout } from "@/config/public-layouts";
import type { PublicWishlistViewModel } from "@/server/mappers/view-models";
import { ArchTrioLayout } from "./arch-trio-layout";
import { CollageStaggeredLayout } from "./collage-staggered-layout";

vi.mock("@/components/features/wishlist/public-filters", () => ({
	PublicGiftFilters: () => null,
}));
vi.mock("@/components/shared/gift-list-band", () => ({
	GiftListBand: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock("@/components/shared/progress-summary", () => ({
	ProgressSummary: () => null,
}));
vi.mock("@/components/shared/rsvp-section", () => ({
	RsvpSection: () => null,
}));
vi.mock("@/components/shared/wishlist-thank-you", () => ({
	WishlistThankYou: () => null,
}));
vi.mock("@/components/layouts/public-wishlist/public-layout-shell", () => ({
	PublicLayoutShell: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock("@/lib/gsap/use-motif-tilt", () => ({
	useMotifTilt: () => undefined,
}));
vi.mock("@/components/shared/hero-gallery", () => ({
	HeroCarouselGallery: ({
		alt,
		className,
		images,
	}: {
		alt: string;
		className?: string;
		images: Array<{ url: string }>;
	}) => (
		<div
			className={className}
			data-images={images.map((image) => image.url).join(",")}
			data-testid={`carousel-${alt}`}
		/>
	),
	HeroImageSlot: ({ alt, src }: { alt: string; src: string | null }) => (
		<div data-src={src ?? ""} data-testid={`slot-${alt}`} />
	),
}));

const images = Array.from({ length: 5 }, (_, index) => ({
	url: `https://example.com/image-${index + 1}.jpg`,
}));

function wishlistWithImages(count: number): PublicWishlistViewModel {
	return {
		eventType: "other",
		images: images.slice(0, count),
		motifId: null,
		title: "Celebración",
	} as PublicWishlistViewModel;
}

const layouts = [
	{
		carouselAlt: "Celebración 1",
		Component: ArchTrioLayout,
		layout: resolveLayout("arch-trio"),
		staticAlts: ["Celebración 2", "Celebración 3"],
	},
	{
		carouselAlt: "Celebración destacada",
		Component: CollageStaggeredLayout,
		layout: resolveLayout("collage-staggered"),
		staticAlts: ["Celebración 1", "Celebración 3"],
	},
] as const;

afterEach(cleanup);

describe("hybrid hero image allocation", () => {
	it.each([
		3, 4, 5,
	])("gives %i ordered images exclusive static and carousel roles in both hybrid layouts", (count) => {
		for (const { Component, carouselAlt, layout, staticAlts } of layouts) {
			render(
				<Component
					layout={layout}
					mode="compact"
					wishlist={wishlistWithImages(count)}
				/>,
			);

			expect(screen.getByTestId(`slot-${staticAlts[0]}`)).toHaveAttribute(
				"data-src",
				images[0]?.url,
			);
			expect(screen.getByTestId(`slot-${staticAlts[1]}`)).toHaveAttribute(
				"data-src",
				images[1]?.url,
			);
			expect(screen.getByTestId(`carousel-${carouselAlt}`)).toHaveAttribute(
				"data-images",
				images
					.slice(2, count)
					.map((image) => image.url)
					.join(","),
			);
			cleanup();
		}
	});

	it.each([
		3, 4,
	])("keeps the Arch Trio white responsive frame ring for %i total images", (count) => {
		render(
			<ArchTrioLayout
				layout={resolveLayout("arch-trio")}
				mode="compact"
				wishlist={wishlistWithImages(count)}
			/>,
		);

		expect(screen.getByTestId("carousel-Celebración 1")).toHaveClass(
			"border-[3px]",
			"border-white",
			"sm:border-[5px]",
		);
	});
});
