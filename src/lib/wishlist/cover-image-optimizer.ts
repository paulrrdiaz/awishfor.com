"use client";

import imageCompression from "browser-image-compression";

export const coverOptimization = {
	maxUploadBytes: 4 * 1024 * 1024,
	triggerBytes: 1.5 * 1024 * 1024,
	maxDimension: 2560,
	targetSizeMb: 1.5,
	initialQuality: 0.92,
	workerLibraryUrl: "/workers/browser-image-compression.js",
} as const;

const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

type Dimensions = { width: number; height: number };
type Compress = (
	file: File,
	options: Parameters<typeof imageCompression>[1],
) => Promise<File>;

export function shouldOptimizeCoverImage(file: File, dimensions: Dimensions) {
	return (
		file.size > coverOptimization.triggerBytes ||
		Math.max(dimensions.width, dimensions.height) >
			coverOptimization.maxDimension
	);
}

/**
 * Best-effort, cover-only preprocessing. Validation remains enforced by the
 * UploadThing endpoint; a valid original is always retained if optimization
 * cannot make it smaller.
 */
export async function selectCoverUploadCandidate(
	file: File,
	dimensions: Dimensions,
	compress: Compress = imageCompression,
): Promise<File> {
	if (
		!acceptedTypes.has(file.type) ||
		file.size > coverOptimization.maxUploadBytes ||
		!shouldOptimizeCoverImage(file, dimensions) ||
		typeof Worker === "undefined"
	)
		return file;

	try {
		const optimized = await compress(file, {
			fileType: file.type,
			initialQuality: coverOptimization.initialQuality,
			libURL: coverOptimization.workerLibraryUrl,
			maxSizeMB: coverOptimization.targetSizeMb,
			maxWidthOrHeight: coverOptimization.maxDimension,
			useWebWorker: true,
		});
		return optimized.type === file.type && optimized.size < file.size
			? optimized
			: file;
	} catch {
		return file;
	}
}
