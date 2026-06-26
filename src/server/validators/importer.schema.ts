import { z } from "zod";

export const IMPORT_URL_MAX_LENGTH = 2_000;

export const importUrlSchema = z.object({
	url: z
		.string()
		.trim()
		.min(1, "URL is required")
		.max(
			IMPORT_URL_MAX_LENGTH,
			`URL must be at most ${IMPORT_URL_MAX_LENGTH} characters`,
		)
		.url("URL must be a valid URL")
		.refine(
			(url) => {
				try {
					const { protocol } = new URL(url);
					return protocol === "http:" || protocol === "https:";
				} catch {
					return false;
				}
			},
			{ message: "URL must use http or https scheme" },
		),
});

export type ImportUrlInput = z.infer<typeof importUrlSchema>;

export type ImportedGiftDraft = {
	name?: string;
	productUrl: string;
	imageUrl?: string;
	storeName?: string;
	priceAmount?: number;
	priceCurrency?: string;
};
