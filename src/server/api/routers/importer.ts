import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { importGiftFromUrl } from "@/server/services/importer.service";
import { importUrlSchema } from "@/server/validators/importer.schema";

export const importerRouter = createTRPCRouter({
	importFromUrl: protectedProcedure
		.input(importUrlSchema)
		.mutation(async ({ input }) => {
			return importGiftFromUrl({}, input);
		}),
});
