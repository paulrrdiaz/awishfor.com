import { env } from "@/env";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { importGiftFromUrl } from "@/server/services/importer.service";
import { importUrlSchema } from "@/server/validators/importer.schema";

export const importerRouter = createTRPCRouter({
	importFromUrl: publicProcedure
		.input(importUrlSchema)
		.mutation(async ({ input }) => {
			return importGiftFromUrl(
				{
					brightDataApiKey: env.BRIGHT_DATA_API_KEY,
					brightDataWebUnlockerZone: env.BRIGHT_DATA_WEB_UNLOCKER_ZONE,
				},
				input,
			);
		}),
});
