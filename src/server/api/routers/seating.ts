import type { createTRPCContext } from "@/server/api/trpc";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { mapSeatingBoard } from "@/server/mappers/seating.mapper";
import type { WishlistAccessDatabase } from "@/server/services/collaboration.service";
import { assertWishlistAccess } from "@/server/services/collaboration.service";
import { getOrCreateLocalUserId } from "@/server/services/local-user.service";
import {
	assignPerson,
	createTables,
	deleteTable,
	listBoard,
	moveTable,
	type SeatingMutationDatabase,
	unassignPerson,
	updateTable,
} from "@/server/services/seating.service";
import {
	assignSeatSchema,
	createSeatingTablesSchema,
	deleteSeatingTableSchema,
	moveSeatingTableSchema,
	seatingBoardSchema,
	unassignSeatSchema,
	updateSeatingTableSchema,
} from "@/server/validators/seating.schema";

type SeatingRouterContext = Awaited<ReturnType<typeof createTRPCContext>> & {
	userId: string;
};

type SeatingRouterDatabase = SeatingMutationDatabase & WishlistAccessDatabase;

const asSeatingDb = (
	ctx: Awaited<ReturnType<typeof createTRPCContext>>,
): SeatingRouterDatabase => ctx.db as unknown as SeatingRouterDatabase;

/**
 * Seating is `ownerOnly: false` (PRD §11), so reads *and* writes go through
 * `assertWishlistAccess` without `requireOwner` — a deliberate departure from
 * `invite.ts`, where mutations are owner-only. Collaborators help plan seating.
 */
const authorize = async (
	ctx: SeatingRouterContext,
	wishlistId: string,
): Promise<void> => {
	const localUserId = await getOrCreateLocalUserId(ctx);
	await assertWishlistAccess(asSeatingDb(ctx), { localUserId, wishlistId });
};

export const seatingRouter = createTRPCRouter({
	board: protectedProcedure
		.input(seatingBoardSchema)
		.query(async ({ ctx, input }) => {
			await authorize(ctx, input.wishlistId);
			const board = await listBoard(asSeatingDb(ctx), {
				wishlistId: input.wishlistId,
			});
			return mapSeatingBoard(board);
		}),

	createTables: protectedProcedure
		.input(createSeatingTablesSchema)
		.mutation(async ({ ctx, input }) => {
			await authorize(ctx, input.wishlistId);
			await createTables(asSeatingDb(ctx), input);
		}),

	updateTable: protectedProcedure
		.input(updateSeatingTableSchema)
		.mutation(async ({ ctx, input }) => {
			await authorize(ctx, input.wishlistId);
			await updateTable(asSeatingDb(ctx), input);
		}),

	moveTable: protectedProcedure
		.input(moveSeatingTableSchema)
		.mutation(async ({ ctx, input }) => {
			await authorize(ctx, input.wishlistId);
			await moveTable(asSeatingDb(ctx), input);
		}),

	deleteTable: protectedProcedure
		.input(deleteSeatingTableSchema)
		.mutation(async ({ ctx, input }) => {
			await authorize(ctx, input.wishlistId);
			await deleteTable(asSeatingDb(ctx), input);
		}),

	assign: protectedProcedure
		.input(assignSeatSchema)
		.mutation(async ({ ctx, input }) => {
			await authorize(ctx, input.wishlistId);
			await assignPerson(asSeatingDb(ctx), input);
		}),

	unassign: protectedProcedure
		.input(unassignSeatSchema)
		.mutation(async ({ ctx, input }) => {
			await authorize(ctx, input.wishlistId);
			await unassignPerson(asSeatingDb(ctx), input);
		}),
});
