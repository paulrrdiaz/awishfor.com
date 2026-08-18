import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (path: string) =>
	readFileSync(resolve(process.cwd(), path), "utf8");

describe("scoped Clerk provider boundaries", () => {
	it("keeps Clerk client UI out of the anonymous root and public wishlist", () => {
		expect(read("src/app/layout.tsx")).not.toContain("ClerkProvider");
		expect(read("src/app/w/layout.tsx")).not.toContain("ClerkProvider");
		expect(read("src/app/w/layout.tsx")).not.toContain(
			"ClerkApplicationLayout",
		);
	});

	it("wraps the auth, creation, and protected application route groups", () => {
		const wrapper = read(
			"src/components/providers/clerk-application-layout.tsx",
		);
		expect(wrapper).toContain("<ClerkProvider>");
		expect(wrapper).toContain("<ApplicationLayout>");

		for (const layout of [
			"src/app/(auth)/layout.tsx",
			"src/app/(protected)/layout.tsx",
			"src/app/create/layout.tsx",
		]) {
			expect(read(layout)).toContain("<ClerkApplicationLayout>");
		}
	});

	it("keeps sign-in, sign-up, recovery, and OAuth callback under auth layout", () => {
		for (const page of [
			"src/app/(auth)/sign-in/page.tsx",
			"src/app/(auth)/sign-up/page.tsx",
			"src/app/(auth)/forgot-password/page.tsx",
			"src/app/(auth)/sso-callback/page.tsx",
		]) {
			expect(read(page)).toBeTruthy();
		}
	});
});
