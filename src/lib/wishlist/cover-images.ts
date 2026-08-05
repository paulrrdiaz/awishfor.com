import type { ImageOrientation } from "@/config/public-layouts";
import { getImageOrientation } from "@/lib/wishlist/image-orientation";

export type CoverImageInput = {
	url: string;
	width: number;
	height: number;
};

export type CoverImageRecord = CoverImageInput & {
	orientation: ImageOrientation;
	sortOrder: number;
};

export function buildCoverImageRecords(
	images: CoverImageInput[],
): CoverImageRecord[] {
	return images.map((image, index) => ({
		...image,
		orientation: getImageOrientation(image.width, image.height) ?? "square",
		sortOrder: index,
	}));
}
