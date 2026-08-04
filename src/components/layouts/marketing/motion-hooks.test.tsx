import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const ORPHANED_HOOK_PATTERN =
	/data-reveal|data-reveal-stagger|data-float|data-float-rev|data-float-3|data-glow/;
const MOTION_CLASS_PATTERN = /\b(m-(?:parallax|scroll-rise))\b/g;
const GUEST_FINDER_IMAGE = "/assets/hero/buscas-la-lista-de-alguien.jpg";

async function marketingComponentFiles() {
	const dir = resolve(process.cwd(), "src/components/layouts/marketing");
	const entries = await readdir(dir);
	return entries
		.filter((name) => name.endsWith(".tsx") && !name.endsWith(".test.tsx"))
		.map((name) => resolve(dir, name));
}

describe("marketing motion hooks", () => {
	it("leaves no orphaned reveal/float/glow attribute in any marketing section", async () => {
		const files = await marketingComponentFiles();
		for (const file of files) {
			const source = await readFile(file, "utf8");
			expect(source, file).not.toMatch(ORPHANED_HOOK_PATTERN);
		}
	});

	it("leaves no orphaned attribute in the marketing 404 page", async () => {
		const source = await readFile(
			resolve(process.cwd(), "src/app/not-found.tsx"),
			"utf8",
		);
		expect(source).not.toMatch(ORPHANED_HOOK_PATTERN);
	});

	it("defines every marketing motion class used by a section", async () => {
		const stylesheet = await readFile(
			resolve(process.cwd(), "src/styles/marketing.css"),
			"utf8",
		);
		const files = await marketingComponentFiles();

		for (const file of files) {
			const source = await readFile(file, "utf8");
			const motionClasses = source.matchAll(MOTION_CLASS_PATTERN);
			for (const match of motionClasses) {
				expect(stylesheet, `${file}: ${match[1]}`).toContain(`.${match[1]}`);
			}
		}
	});

	it("keeps the client guest finder motion hook byte-stable", async () => {
		const guestFinder = await readFile(
			resolve(
				process.cwd(),
				"src/components/layouts/marketing/guest-finder.tsx",
			),
			"utf8",
		);
		const stylesheet = await readFile(
			resolve(process.cwd(), "src/styles/marketing.css"),
			"utf8",
		);

		expect(guestFinder).toContain(`src="${GUEST_FINDER_IMAGE}"`);
		expect(stylesheet).toContain(`img[src="${GUEST_FINDER_IMAGE}"]`);
	});
});
