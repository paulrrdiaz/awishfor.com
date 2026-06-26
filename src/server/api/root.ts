import { categoryRouter } from "@/server/api/routers/category";
import { importerRouter } from "@/server/api/routers/importer";
import { wishlistRouter } from "@/server/api/routers/wishlist";
import {
	createCallerFactory,
	createTRPCRouter,
	publicProcedure,
} from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here. Example:
 *
 *   import { exampleRouter } from "@/server/api/routers/example";
 *
 *   export const appRouter = createTRPCRouter({
 *     health: publicProcedure.query(() => ({ ok: true })),
 *     example: exampleRouter,
 *   });
 *
 * `health` is a minimal starter procedure (also a handy liveness check) — replace
 * or extend it with your own routers. See `protectedProcedure` in trpc.ts for
 * auth-gated endpoints.
 */
export const appRouter = createTRPCRouter({
	category: categoryRouter,
	importer: importerRouter,
	wishlist: wishlistRouter,
	health: publicProcedure.query(() => ({ ok: true, ts: Date.now() })),
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.health();
 */
export const createCaller = createCallerFactory(appRouter);
