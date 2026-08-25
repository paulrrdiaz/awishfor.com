import { describe, expect, it } from "vitest";

import config from "./next.config";

describe("PostHog first-party ingestion rewrites", () => {
	it("proxies US ingestion and asset requests without changing headers", async () => {
		await expect(config.headers?.()).resolves.toMatchObject([
			{
				source: "/",
				headers: [expect.objectContaining({ key: "Link" })],
			},
		]);
		await expect(config.rewrites?.()).resolves.toEqual({
			beforeFiles: [
				{
					source: "/ingest/static/:path*",
					destination: "https://us-assets.i.posthog.com/static/:path*",
				},
				{
					source: "/ingest/:path*",
					destination: "https://us.i.posthog.com/:path*",
				},
			],
		});
	});

	it("traces Sharp's Linux runtime for Vercel server functions", () => {
		expect(config.outputFileTracingIncludes).toEqual({
			"/w/[slug]/opengraph-image": [
				"node_modules/sharp/**/*",
				"node_modules/@img/sharp-linux-x64/**/*",
				"node_modules/@img/sharp-libvips-linux-x64/**/*",
			],
		});
	});
});
