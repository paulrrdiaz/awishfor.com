import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import jpeg from "jpeg-js";
import { PNG } from "pngjs";
import { socialImageFixtures } from "./social-image-fixtures";
import {
	encodeSocialImage,
	maxSocialImageBytes,
	preferredSocialImageBytes,
	socialImageSize,
} from "./social-image-jpeg";

describe("encodeSocialImage", () => {
	it.each(
		Object.entries(socialImageFixtures),
	)("encodes the deterministic %s fixture as a bounded JPEG", async (_name, fixture) => {
		const output = await encodeSocialImage(fixture);
		const decoded = jpeg.decode(output, { useTArray: true });

		expect(output.subarray(0, 2)).toEqual(Buffer.from([0xff, 0xd8]));
		expect(decoded.width).toBe(socialImageSize.width);
		expect(decoded.height).toBe(socialImageSize.height);
		expect(output.byteLength).toBeLessThanOrEqual(preferredSocialImageBytes);
		expect(output.byteLength).toBeLessThan(maxSocialImageBytes);
	});

	it("rejects an unexpected source size", async () => {
		const png = new PNG({ height: 1, width: 1 });
		png.data.set([255, 255, 255, 255]);

		await expect(encodeSocialImage(PNG.sync.write(png))).rejects.toThrow(
			"Social image must be 1200x630",
		);
	});
});
