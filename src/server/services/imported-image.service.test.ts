import { beforeEach, describe, expect, it, vi } from "vitest";

const uploadFilesFromUrlMock = vi.hoisted(() => vi.fn());

vi.mock("uploadthing/server", () => ({
	UTApi: class {
		uploadFilesFromUrl = uploadFilesFromUrlMock;
	},
}));

import { isManagedGiftImageUrl } from "@/lib/wishlist/gift-image";
import {
	persistDraftGiftImages,
	persistImportedGiftImage,
} from "@/server/services/imported-image.service";

describe("imported image persistence", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("recognizes UploadThing URLs already controlled by the app", () => {
		expect(isManagedGiftImageUrl("https://utfs.io/f/image.jpg")).toBe(true);
		expect(isManagedGiftImageUrl("https://abc.ufs.sh/f/image.jpg")).toBe(true);
		expect(isManagedGiftImageUrl("https://retailer.example/image.jpg")).toBe(
			false,
		);
	});

	it("returns the owned URL after copying an external image", async () => {
		uploadFilesFromUrlMock.mockResolvedValue({
			data: { ufsUrl: "https://abc.ufs.sh/f/copied.jpg" },
			error: null,
		});

		await expect(
			persistImportedGiftImage("https://retailer.example/image.jpg"),
		).resolves.toBe("https://abc.ufs.sh/f/copied.jpg");
		expect(uploadFilesFromUrlMock).toHaveBeenCalledWith(
			"https://retailer.example/image.jpg",
		);
	});

	it("does not ask storage to fetch an unsafe image URL", async () => {
		await expect(
			persistImportedGiftImage("http://127.0.0.1/private.jpg"),
		).resolves.toBeUndefined();
		expect(uploadFilesFromUrlMock).not.toHaveBeenCalled();
	});

	it("copies remote draft images and clears ones the retailer blocks", async () => {
		uploadFilesFromUrlMock
			.mockResolvedValueOnce({
				data: { ufsUrl: "https://abc.ufs.sh/f/copied.jpg" },
				error: null,
			})
			.mockResolvedValueOnce({
				data: null,
				error: { message: "forbidden" },
			});

		const gifts = await persistDraftGiftImages([
			{ id: "copied", imageUrl: "https://retailer.example/image.jpg" },
			{ id: "owned", imageUrl: "https://abc.ufs.sh/f/already-owned.jpg" },
			{ id: "blocked", imageUrl: "https://blocked.example/image.jpg" },
			{ id: "empty", imageUrl: null },
		]);

		expect(gifts).toEqual([
			{ id: "copied", imageUrl: "https://abc.ufs.sh/f/copied.jpg" },
			{ id: "owned", imageUrl: "https://abc.ufs.sh/f/already-owned.jpg" },
			{ id: "blocked", imageUrl: null },
			{ id: "empty", imageUrl: null },
		]);
	});
});
