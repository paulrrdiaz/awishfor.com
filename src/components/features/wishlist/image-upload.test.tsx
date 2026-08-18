// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ImageUpload } from "./image-upload";

vi.mock("next/image", () => ({
	default: ({
		alt = "",
		fill: _fill,
		unoptimized: _unoptimized,
		...props
	}: React.ImgHTMLAttributes<HTMLImageElement> & {
		fill?: boolean;
		unoptimized?: boolean;
	}) => (
		// biome-ignore lint/performance/noImgElement: jsdom test mock for next/image
		<img alt={alt} {...props} />
	),
}));

vi.mock("@/lib/uploadthing/client", () => ({
	useUploadThing: () => ({
		isUploading: false,
		startUpload: vi.fn(),
	}),
}));

describe("ImageUpload preview", () => {
	it("replaces a failed remote preview with an accessible fallback", () => {
		render(
			<ImageUpload
				endpoint="giftImage"
				onChange={vi.fn()}
				value="https://example.com/unavailable.jpg"
				variant="compact"
			/>,
		);

		fireEvent.error(screen.getByRole("img", { name: "Imagen subida" }));

		expect(
			screen.getByRole("img", { name: "Imagen no disponible" }),
		).toBeVisible();
		expect(
			screen.queryByRole("img", { name: "Imagen subida" }),
		).not.toBeInTheDocument();
	});
});
