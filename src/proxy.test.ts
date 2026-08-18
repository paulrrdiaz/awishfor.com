import { describe, expect, it } from "vitest";

import { config } from "./proxy";

describe("Clerk proxy matcher", () => {
	it("covers application pages, APIs, and Clerk frontend routes", () => {
		expect(config.matcher).toEqual([
			"/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
			"/(api|trpc)(.*)",
			"/__clerk/(.*)",
		]);
	});
});
