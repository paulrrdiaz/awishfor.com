import { PNG } from "pngjs";

const width = 1200;
const height = 630;

function createFixture(
	pixel: (x: number, y: number) => readonly [number, number, number],
): Buffer {
	const png = new PNG({ height, width });

	for (let y = 0; y < height; y += 1) {
		for (let x = 0; x < width; x += 1) {
			const offset = (y * width + x) * 4;
			const [red, green, blue] = pixel(x, y);
			png.data[offset] = red;
			png.data[offset + 1] = green;
			png.data[offset + 2] = blue;
			png.data[offset + 3] = 255;
		}
	}

	return PNG.sync.write(png);
}

/** Deterministic local raster inputs for social-card JPEG budget tests. */
export const socialImageFixtures = {
	coverPhoto: createFixture((x, y) => {
		const grain = (x * 17 + y * 29 + ((x * y) % 47)) % 28;
		return [
			Math.min(255, 42 + x / 7 + grain),
			Math.min(255, 72 + y / 5 + grain / 2),
			Math.min(255, 98 + (x + y) / 12),
		];
	}),
	textOnly: createFixture((x, y) => {
		if (x >= 40 && x <= 290 && y >= 40 && y <= 98) return [109, 78, 47];
		if (x >= 54 && x <= 760 && y >= 470 && y <= 490) return [109, 78, 47];
		if (x >= 54 && x <= 1040 && y >= 520 && y <= 570) return [39, 29, 22];
		return [251, 247, 239];
	}),
} as const;
