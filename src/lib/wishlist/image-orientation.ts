import type { ImageOrientation } from "@/config/public-layouts";

export const IMAGE_ORIENTATION_SQUARE_DEADBAND = 0.15;

const IMAGE_ORIENTATION_LABELS: Record<ImageOrientation, string> = {
	landscape: "horizontal",
	portrait: "vertical",
	square: "cuadrada",
};

export function getImageOrientation(
	width: number,
	height: number,
	deadband = IMAGE_ORIENTATION_SQUARE_DEADBAND,
): ImageOrientation | null {
	if (width <= 0 || height <= 0) return null;

	const ratio = width / height;
	if (Math.abs(ratio - 1) <= deadband) return "square";
	return ratio > 1 ? "landscape" : "portrait";
}

export function hasImageOrientationMismatch(
	detected: ImageOrientation | null | undefined,
	recommended: ImageOrientation | null | undefined,
): boolean {
	return Boolean(detected && recommended && detected !== recommended);
}

export function getImageMismatchMessage(
	detected: ImageOrientation,
	recommended: ImageOrientation,
): string {
	return `Esta foto es ${IMAGE_ORIENTATION_LABELS[detected]}; este diseño luce mejor en ${IMAGE_ORIENTATION_LABELS[recommended]}.`;
}
