import { auth } from "@clerk/nextjs/server";
import type { FileRouter } from "uploadthing/server";
import { createUploadthing, UploadThingError } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
	coverImage: f({
		"image/jpeg": { maxFileSize: "4MB", maxFileCount: 1 },
		"image/png": { maxFileSize: "4MB", maxFileCount: 1 },
		"image/webp": { maxFileSize: "4MB", maxFileCount: 1 },
	})
		.middleware(async () => {
			const { userId } = await auth();
			if (!userId) throw new UploadThingError("Unauthorized");
			return { userId };
		})
		.onUploadComplete(() => {}),

	giftImage: f({
		"image/jpeg": { maxFileSize: "4MB", maxFileCount: 1 },
		"image/png": { maxFileSize: "4MB", maxFileCount: 1 },
		"image/webp": { maxFileSize: "4MB", maxFileCount: 1 },
	})
		.middleware(async () => {
			const { userId } = await auth();
			if (!userId) throw new UploadThingError("Unauthorized");
			return { userId };
		})
		.onUploadComplete(() => {}),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
