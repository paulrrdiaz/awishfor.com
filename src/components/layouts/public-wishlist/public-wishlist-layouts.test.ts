// @vitest-environment node
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const LAYOUT_FILES = [
	"carousel-hero-layout.tsx",
	"scrapbook-polaroids-layout.tsx",
	"portrait-frame-split-layout.tsx",
	"arch-hero-party-layout.tsx",
	"arch-trio-layout.tsx",
	"overlap-duo-layout.tsx",
	"split-image-right-layout.tsx",
	"collage-staggered-layout.tsx",
	"magazine-editorial-layout.tsx",
];

const layoutPath = (file: string) => resolve(import.meta.dirname, file);

describe("public wishlist drawer integration", () => {
	it("passes the enabled setting through every non-compact hero CTA", async () => {
		for (const file of LAYOUT_FILES) {
			const source = await readFile(layoutPath(file), "utf8");
			expect(source).toContain("showHowItWorks={wishlist.showHowItWorks}");
			expect(source).toContain('mode === "compact"');
		}
	});

	it("keeps the shared body free of the retired inline section", async () => {
		const source = await readFile(
			resolve(import.meta.dirname, "../../shared/public-wishlist-body.tsx"),
			"utf8",
		);

		expect(source).not.toContain("HowItWorks");
		expect(source).not.toContain("como-funciona");
	});
});
