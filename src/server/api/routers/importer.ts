import { auth } from "@clerk/nextjs/server";
import { env } from "@/env";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { persistImportedGiftImage } from "@/server/services/imported-image.service";
import { importGiftFromUrl } from "@/server/services/importer.service";
import { importUrlSchema } from "@/server/validators/importer.schema";

export const importerRouter = createTRPCRouter({
	importFromUrl: publicProcedure
		.input(importUrlSchema)
		.mutation(async ({ input }) => {
			const { userId } = await auth();
			return importGiftFromUrl(
				{
					brightDataApiKey: env.BRIGHT_DATA_API_KEY,
					brightDataWebUnlockerZone: env.BRIGHT_DATA_WEB_UNLOCKER_ZONE,
					persistImage: userId ? persistImportedGiftImage : undefined,
				},
				input,
			);
		}),
});
