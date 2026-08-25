import "server-only";

import sharp from "sharp";

export const socialImageSize = { width: 1200, height: 630 } as const;
export const preferredSocialImageBytes = 500 * 1024;
export const maxSocialImageBytes = 1024 * 1024;

const qualityLadder = [
	{ quality: 85, chromaSubsampling: "4:4:4" as const },
	{ quality: 78, chromaSubsampling: "4:4:4" as const },
	{ quality: 72, chromaSubsampling: "4:4:4" as const },
	{ quality: 65, chromaSubsampling: "4:2:0" as const },
];

/** Converts a completed opaque social-card raster into a bounded JPEG. */
export async function encodeSocialImage(
	input: ArrayBuffer | Uint8Array,
): Promise<Buffer> {
	for (const options of qualityLadder) {
		const encoded = await sharp(input)
			.resize(socialImageSize.width, socialImageSize.height, { fit: "fill" })
			.jpeg({
				progressive: true,
				mozjpeg: true,
				quality: options.quality,
				chromaSubsampling: options.chromaSubsampling,
			})
			.toBuffer();
		if (encoded.byteLength < maxSocialImageBytes) return encoded;
	}

	throw new Error("Social image JPEG exceeded the 1 MiB hard limit");
}
