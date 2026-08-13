// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WishlistFooter } from "@/components/shared/wishlist-footer";
import { resolveMotif } from "@/config/motifs";

const motif = resolveMotif("bear-cloud");
if (!motif) {
	throw new Error("bear-cloud motif not found in catalog");
}

/**
 * Strips every decorative motif node (aria-hidden, `.mot`, `.stk`, `.mband`,
 * `.mdiv`, `.seal`) from a subtree and returns the remaining outerHTML,
 * `className`s included. jsdom has no layout engine and no compiled
 * Tailwind, so `getComputedStyle` returns nothing useful here — comparing
 * the surviving markup (including its classes) is what actually catches an
 * existing element being restyled to make room for a motif.
 */
function stripMotifNodes(container: HTMLElement): string {
	const clone = container.cloneNode(true) as HTMLElement;
	for (const el of Array.from(
		clone.querySelectorAll(
			'[aria-hidden="true"], .mot, .stk, .mband, .mdiv, .seal',
		),
	)) {
		el.remove();
	}
	return clone.innerHTML;
}

describe("motif additivity", () => {
	it("WishlistFooter: the motif band is additive, existing footer content is unchanged", () => {
		const without = render(<WishlistFooter wishlistSlug="mi-lista" />);
		const withoutHtml = stripMotifNodes(without.container);
		without.unmount();

		const withMotif = render(
			<WishlistFooter
				motif={motif}
				motifTreatment="scene"
				wishlistSlug="mi-lista"
			/>,
		);
		const withHtml = stripMotifNodes(withMotif.container);

		expect(withHtml).toBe(withoutHtml);
	});

	it("WishlistFooter's non-band markup is unchanged by the band treatment", () => {
		const scene = render(
			<WishlistFooter
				motif={motif}
				motifTreatment="scene"
				wishlistSlug="mi-lista"
			/>,
		);
		const sceneHtml = stripMotifNodes(scene.container);
		scene.unmount();

		const band = render(
			<WishlistFooter
				motif={motif}
				motifTreatment="band"
				wishlistSlug="mi-lista"
			/>,
		);
		const bandHtml = stripMotifNodes(band.container);

		expect(bandHtml).toBe(sceneHtml);
	});
});
