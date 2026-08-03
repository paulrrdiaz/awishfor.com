import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const ORPHANED_HOOK_PATTERN =
	/data-reveal|data-reveal-stagger|data-float|data-float-rev|data-float-3|data-glow/;

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
});
