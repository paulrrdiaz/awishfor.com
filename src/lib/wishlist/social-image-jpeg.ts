import "server-only";

import jpeg from "jpeg-js";
import { PNG } from "pngjs";

export const socialImageSize = { width: 1200, height: 630 } as const;
export const preferredSocialImageBytes = 500 * 1024;
export const maxSocialImageBytes = 1024 * 1024;

const qualityLadder = [85, 78, 72, 65, 55, 45] as const;

/** Converts a completed opaque social-card raster into a bounded JPEG. */
export async function encodeSocialImage(
	input: ArrayBuffer | Uint8Array,
): Promise<Buffer> {
	const source = input instanceof ArrayBuffer ? new Uint8Array(input) : input;
	const decoded = PNG.sync.read(Buffer.from(source));

	if (
		decoded.width !== socialImageSize.width ||
		decoded.height !== socialImageSize.height
	) {
		throw new Error(
			`Social image must be ${socialImageSize.width}x${socialImageSize.height}`,
		);
	}

	for (const quality of qualityLadder) {
		const encoded = jpeg.encode(decoded, quality).data;
		if (encoded.byteLength < maxSocialImageBytes) return encoded;
	}

	throw new Error("Social image JPEG exceeded the 1 MiB hard limit");
}
