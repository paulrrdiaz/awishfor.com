import "server-only";

import { UTApi } from "uploadthing/server";
import { isManagedGiftImageUrl } from "@/lib/wishlist/gift-image";
import { assertSafeUrl } from "@/server/services/importer.service";

const uploadthing = new UTApi();

const MAX_PARALLEL_IMAGE_IMPORTS = 4;

/**
 * Copies a retailer-hosted image into storage controlled by A Wish For.
 * Retailer URLs are not durable: they may expire, reject hotlinks, or block
 * the Next.js image optimizer after the gift has already been published.
 */
export async function persistImportedGiftImage(
	imageUrl: string,
): Promise<string | undefined> {
	try {
		assertSafeUrl(imageUrl);
		const result = await uploadthing.uploadFilesFromUrl(imageUrl);
		return result.data?.ufsUrl;
	} catch {
		return undefined;
	}
}

export async function persistDraftGiftImages<
	TGift extends { imageUrl?: string | null },
>(gifts: readonly TGift[]): Promise<TGift[]> {
	const persisted = [...gifts];
	let nextIndex = 0;

	async function persistNext(): Promise<void> {
		while (nextIndex < persisted.length) {
			const index = nextIndex++;
			const gift = persisted[index];
			if (!gift?.imageUrl || isManagedGiftImageUrl(gift.imageUrl)) continue;

			const imageUrl = await persistImportedGiftImage(gift.imageUrl);
			persisted[index] = {
				...gift,
				imageUrl: imageUrl ?? null,
			};
		}
	}

	await Promise.all(
		Array.from(
			{ length: Math.min(MAX_PARALLEL_IMAGE_IMPORTS, persisted.length) },
			() => persistNext(),
		),
	);

	return persisted;
}
