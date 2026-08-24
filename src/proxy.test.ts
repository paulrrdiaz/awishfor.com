import { describe, expect, it } from "vitest";

import { config } from "./proxy";

describe("Clerk proxy matcher", () => {
	it("covers application pages, APIs, and Clerk frontend routes", () => {
		expect(config.matcher).toEqual([
			"/((?!_next|ingest|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
			"/(api|trpc)(.*)",
			"/__clerk/(.*)",
		]);
	});

	it("excludes the first-party analytics ingestion path", () => {
		expect(config.matcher[0]).toContain("ingest");
	});

	it("bypasses Clerk middleware for anonymous public wishlist requests", async () => {
		const source = await import("node:fs/promises").then(({ readFile }) =>
			readFile(new URL("./proxy.ts", import.meta.url), "utf8"),
		);
		expect(source).toContain('req.nextUrl.pathname.startsWith("/w/")');
		expect(source).toContain('cookie.name.startsWith("__session")');
		expect(source).toContain("return NextResponse.next()");
	});
});
