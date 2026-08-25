// @vitest-environment jsdom

import { describe, expect, it, vi } from "vitest";
import {
	coverOptimization,
	selectCoverUploadCandidate,
	shouldOptimizeCoverImage,
} from "./cover-image-optimizer";

const dimensions = { width: 3000, height: 1800 };

function file(name: string, size: number, type = "image/jpeg") {
	return new File([new Uint8Array(size)], name, { type });
}

describe("selectCoverUploadCandidate", () => {
	it("skips small covers without invoking compression", async () => {
		const original = file("small.jpg", 100);
		const compress = vi.fn();
		await expect(
			selectCoverUploadCandidate(
				original,
				{ width: 1200, height: 630 },
				compress,
			),
		).resolves.toBe(original);
		expect(compress).not.toHaveBeenCalled();
	});

	it("uses a smaller same-type optimized cover with the application worker", async () => {
		vi.stubGlobal("Worker", class Worker {});
		const original = file("large.jpg", coverOptimization.triggerBytes + 20);
		const optimized = file("large.jpg", 40);
		const compress = vi.fn(async () => optimized);

		await expect(
			selectCoverUploadCandidate(original, dimensions, compress),
		).resolves.toBe(optimized);
		expect(compress).toHaveBeenCalledWith(
			original,
			expect.objectContaining({
				fileType: "image/jpeg",
				initialQuality: 0.92,
				libURL: "/workers/browser-image-compression.js",
				maxSizeMB: 1.5,
				maxWidthOrHeight: 2560,
				useWebWorker: true,
			}),
		);
		vi.unstubAllGlobals();
	});

	it("keeps the original when worker support is absent, compression fails, or output is not smaller", async () => {
		const original = file("large.jpg", coverOptimization.triggerBytes + 20);
		const compress = vi.fn(async () => original);
		await expect(
			selectCoverUploadCandidate(original, dimensions, compress),
		).resolves.toBe(original);
		expect(compress).not.toHaveBeenCalled();

		vi.stubGlobal("Worker", class Worker {});
		await expect(
			selectCoverUploadCandidate(
				original,
				dimensions,
				vi.fn(async () => original),
			),
		).resolves.toBe(original);
		await expect(
			selectCoverUploadCandidate(
				original,
				dimensions,
				vi.fn(async () => {
					throw new Error("worker failed");
				}),
			),
		).resolves.toBe(original);
		vi.unstubAllGlobals();
	});

	it("does not attempt to optimize unsupported or server-rejected files", async () => {
		vi.stubGlobal("Worker", class Worker {});
		const compress = vi.fn();
		await selectCoverUploadCandidate(
			file("bad.gif", coverOptimization.triggerBytes + 1, "image/gif"),
			dimensions,
			compress,
		);
		await selectCoverUploadCandidate(
			file("too-large.jpg", coverOptimization.maxUploadBytes + 1),
			dimensions,
			compress,
		);
		expect(compress).not.toHaveBeenCalled();
		vi.unstubAllGlobals();
	});

	it("triggers when either bytes or the longest dimension exceed the threshold", () => {
		expect(shouldOptimizeCoverImage(file("large.jpg", 1), dimensions)).toBe(
			true,
		);
		expect(
			shouldOptimizeCoverImage(
				file("heavy.jpg", coverOptimization.triggerBytes + 1),
				{ width: 1200, height: 630 },
			),
		).toBe(true);
	});
});
