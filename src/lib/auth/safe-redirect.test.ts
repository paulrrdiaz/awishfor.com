import { describe, expect, it } from "vitest";
import { resolveRedirectPath } from "@/lib/auth/safe-redirect";

describe("resolveRedirectPath", () => {
	it("accepts a valid same-origin relative path", () => {
		expect(resolveRedirectPath("/create?step=publish")).toBe(
			"/create?step=publish",
		);
	});

	it("falls back for an absolute URL", () => {
		expect(resolveRedirectPath("https://evil.example/phish")).toBe(
			"/dashboard",
		);
	});

	it("falls back for a protocol-relative URL", () => {
		expect(resolveRedirectPath("//evil.example")).toBe("/dashboard");
	});

	it("falls back for a backslash protocol-relative URL", () => {
		expect(resolveRedirectPath("/\\evil.example")).toBe("/dashboard");
	});

	it("falls back when redirect_url is missing", () => {
		expect(resolveRedirectPath(undefined)).toBe("/dashboard");
		expect(resolveRedirectPath(null)).toBe("/dashboard");
	});

	it("falls back for an empty string", () => {
		expect(resolveRedirectPath("")).toBe("/dashboard");
	});

	it("honors a custom fallback", () => {
		expect(resolveRedirectPath(null, "/create")).toBe("/create");
	});
});
