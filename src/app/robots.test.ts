import { describe, expect, it } from "vitest";
import robots from "./robots";

describe("robots", () => {
	it("allows the public surface", () => {
		const { rules } = robots();
		const rule = Array.isArray(rules) ? rules[0] : rules;
		expect(rule?.allow).toBe("/");
	});

	it("disallows dashboard, API, and authentication routes", () => {
		const { rules } = robots();
		const rule = Array.isArray(rules) ? rules[0] : rules;
		const disallow = rule?.disallow;
		const disallowed = Array.isArray(disallow) ? disallow : [disallow];
		expect(disallowed).toContain("/dashboard");
		expect(disallowed).toContain("/api");
		expect(disallowed).toContain("/sign-in");
	});

	it("references the sitemap's absolute URL", () => {
		expect(robots().sitemap).toBe("http://localhost:4000/sitemap.xml");
	});
});
