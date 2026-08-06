// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MultiImageUpload } from "@/components/features/wishlist/multi-image-upload";
import type { DraftCoverImage } from "@/stores/wishlist-wizard.store";

const startUploadMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/uploadthing/client", () => ({
	useUploadThing: () => ({
		startUpload: startUploadMock,
		isUploading: false,
	}),
}));

vi.mock("next/image", () => ({
	default: ({
		alt,
		src,
		fill: _fill,
		...props
	}: {
		alt: string;
		src: string;
		fill?: boolean;
	}) => (
		/* biome-ignore lint/performance/noImgElement: jsdom test mock for next/image */
		<img alt={alt} src={src} {...props} />
	),
}));

const DIMENSIONS: Record<string, { width: number; height: number }> = {
	"landscape-1.jpg": { width: 1600, height: 900 },
	"landscape-2.jpg": { width: 1600, height: 900 },
	"landscape-3.jpg": { width: 1600, height: 900 },
	"landscape-4.jpg": { width: 1600, height: 900 },
	"portrait-1.jpg": { width: 900, height: 1600 },
	"bad.jpg": { width: 1600, height: 900 },
};

class FakeImage {
	onload: (() => void) | null = null;
	onerror: (() => void) | null = null;
	naturalWidth = 0;
	naturalHeight = 0;

	set src(value: string) {
		const name = value.replace("blob:", "");
		const dims = DIMENSIONS[name];
		queueMicrotask(() => {
			if (dims) {
				this.naturalWidth = dims.width;
				this.naturalHeight = dims.height;
				this.onload?.();
			} else {
				this.onerror?.();
			}
		});
	}
}

function makeFile(name: string) {
	return new File(["fake"], name, { type: "image/jpeg" });
}

function makeImage(overrides: Partial<DraftCoverImage> = {}): DraftCoverImage {
	return {
		url: "https://cdn.test/existing.jpg",
		width: 1600,
		height: 900,
		orientation: "landscape",
		...overrides,
	};
}

describe("MultiImageUpload", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// @ts-expect-error test stub for image dimension measurement
		window.Image = FakeImage;
		URL.createObjectURL = vi.fn((file: File) => `blob:${file.name}`);
		URL.revokeObjectURL = vi.fn();
		startUploadMock.mockImplementation(async (files: File[]) => {
			const file = files[0];
			if (!file) return [];
			if (file.name === "bad.jpg") {
				throw new Error("Invalid file type");
			}
			return [{ ufsUrl: `https://cdn.test/${file.name}` }];
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	function getFileInput(container: HTMLElement) {
		const input = container.querySelector('input[type="file"]');
		if (!input) throw new Error("Expected a file input");
		return input as HTMLInputElement;
	}

	it("disables the add control once eight images are reached", () => {
		const value = Array.from({ length: 8 }, (_, i) =>
			makeImage({ url: `https://cdn.test/existing-${i}.jpg` }),
		);

		render(
			<MultiImageUpload
				endpoint="coverImage"
				onChange={vi.fn()}
				value={value}
			/>,
		);

		expect(screen.queryByRole("button", { name: /agregar/i })).toBeNull();
	});

	it("accepts several files in one selection and appends them in order", async () => {
		const onChange = vi.fn();
		const user = userEvent.setup();
		const { container } = render(
			<MultiImageUpload endpoint="coverImage" onChange={onChange} value={[]} />,
		);

		const files = [
			makeFile("landscape-1.jpg"),
			makeFile("landscape-2.jpg"),
			makeFile("landscape-3.jpg"),
		];
		await user.upload(getFileInput(container), files);

		expect(onChange).toHaveBeenCalledTimes(1);
		const uploaded = onChange.mock.calls[0]?.[0] as DraftCoverImage[];
		expect(uploaded.map((image) => image.url)).toEqual([
			"https://cdn.test/landscape-1.jpg",
			"https://cdn.test/landscape-2.jpg",
			"https://cdn.test/landscape-3.jpg",
		]);
		expect(startUploadMock).toHaveBeenCalledTimes(3);
	});

	it("partially accepts a batch exceeding the cap and reports how many were skipped", async () => {
		const onChange = vi.fn();
		const user = userEvent.setup();
		const value = Array.from({ length: 6 }, (_, i) =>
			makeImage({ url: `https://cdn.test/existing-${i}.jpg` }),
		);
		const { container } = render(
			<MultiImageUpload
				endpoint="coverImage"
				onChange={onChange}
				value={value}
			/>,
		);

		const files = [
			makeFile("landscape-1.jpg"),
			makeFile("landscape-2.jpg"),
			makeFile("landscape-3.jpg"),
			makeFile("landscape-4.jpg"),
		];
		await user.upload(getFileInput(container), files);

		const uploaded = onChange.mock.calls[0]?.[0] as DraftCoverImage[];
		expect(uploaded).toHaveLength(8);
		expect(startUploadMock).toHaveBeenCalledTimes(2);
		expect(await screen.findByText(/2 imágenes no se agregaron/i)).toBeTruthy();
	});

	it("reports a rejected file individually without failing the rest of the batch", async () => {
		const onChange = vi.fn();
		const user = userEvent.setup();
		const { container } = render(
			<MultiImageUpload endpoint="coverImage" onChange={onChange} value={[]} />,
		);

		const files = [makeFile("landscape-1.jpg"), makeFile("bad.jpg")];
		await user.upload(getFileInput(container), files);

		const uploaded = onChange.mock.calls[0]?.[0] as DraftCoverImage[];
		expect(uploaded.map((image) => image.url)).toEqual([
			"https://cdn.test/landscape-1.jpg",
		]);
		expect(
			await screen.findByText(/bad\.jpg: tipo de archivo no permitido/i),
		).toBeTruthy();
	});

	it("groups the uploaded set by orientation with a count per group", () => {
		const value = [
			makeImage({ url: "https://cdn.test/l1.jpg", orientation: "landscape" }),
			makeImage({ url: "https://cdn.test/l2.jpg", orientation: "landscape" }),
			makeImage({
				url: "https://cdn.test/p1.jpg",
				orientation: "portrait",
				width: 900,
				height: 1600,
			}),
		];

		render(
			<MultiImageUpload
				endpoint="coverImage"
				onChange={vi.fn()}
				value={value}
			/>,
		);

		expect(screen.getByText("Horizontales · 2")).toBeTruthy();
		expect(screen.getByText("Verticales · 1")).toBeTruthy();
	});
});
