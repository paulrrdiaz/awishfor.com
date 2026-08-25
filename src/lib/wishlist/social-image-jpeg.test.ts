import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import sharp from "sharp";
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
	)("encodes the deterministic %s fixture as a bounded progressive JPEG", async (_name, fixture) => {
		const output = await encodeSocialImage(fixture);
		const metadata = await sharp(output).metadata();

		expect(metadata.format).toBe("jpeg");
		expect(metadata.width).toBe(socialImageSize.width);
		expect(metadata.height).toBe(socialImageSize.height);
		expect(output.byteLength).toBeLessThanOrEqual(preferredSocialImageBytes);
		expect(output.byteLength).toBeLessThan(maxSocialImageBytes);
	});
});
