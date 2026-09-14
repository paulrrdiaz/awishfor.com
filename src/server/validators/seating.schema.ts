import { z } from "zod";
import { SeatingTableShape } from "@/generated/prisma/enums";
import {
	SEATING_CANVAS_HEIGHT,
	SEATING_CANVAS_WIDTH,
	SEATING_MAX_CAPACITY,
	SEATING_MAX_TABLES_PER_BATCH,
	SEATING_MIN_CAPACITY,
} from "@/server/services/seating.service";
import { wishlistIdSchema } from "@/server/validators/wishlist.schema";

export const SEATING_TABLE_NAME_MAX_LENGTH = 60;

export const seatingTableIdSchema = z.string().min(1, "Table id is required");
export const seatingPersonIdSchema = z.string().min(1, "Person id is required");

export const seatingShapeSchema = z.enum(SeatingTableShape);

export const seatingCapacitySchema = z
	.number()
	.int("La capacidad debe ser un número entero")
	.min(SEATING_MIN_CAPACITY, `Mínimo ${SEATING_MIN_CAPACITY} persona`)
	.max(SEATING_MAX_CAPACITY, `Máximo ${SEATING_MAX_CAPACITY} personas`);

export const seatingTableNameSchema = z.preprocess(
	(value) =>
		typeof value === "string" && value.trim() === "" ? undefined : value,
	z
		.string()
		.trim()
		.max(SEATING_TABLE_NAME_MAX_LENGTH, "Nombre muy largo")
		.optional(),
);

const coordinate = (max: number) =>
	z.number().int("La posición debe ser un número entero").min(0).max(max);

export const seatingBoardSchema = z.object({
	wishlistId: wishlistIdSchema,
});

export const createSeatingTablesSchema = z.object({
	wishlistId: wishlistIdSchema,
	shape: seatingShapeSchema,
	capacity: seatingCapacitySchema,
	name: seatingTableNameSchema,
	count: z
		.number()
		.int()
		.min(1, "Agrega al menos una mesa")
		.max(
			SEATING_MAX_TABLES_PER_BATCH,
			`Puedes agregar hasta ${SEATING_MAX_TABLES_PER_BATCH} mesas a la vez`,
		)
		.default(1),
	x: coordinate(SEATING_CANVAS_WIDTH).optional(),
	y: coordinate(SEATING_CANVAS_HEIGHT).optional(),
});

export const updateSeatingTableSchema = z.object({
	wishlistId: wishlistIdSchema,
	tableId: seatingTableIdSchema,
	name: seatingTableNameSchema,
	shape: seatingShapeSchema.optional(),
	capacity: seatingCapacitySchema.optional(),
});

export const moveSeatingTableSchema = z.object({
	wishlistId: wishlistIdSchema,
	tableId: seatingTableIdSchema,
	x: coordinate(SEATING_CANVAS_WIDTH),
	y: coordinate(SEATING_CANVAS_HEIGHT),
});

export const deleteSeatingTableSchema = z.object({
	wishlistId: wishlistIdSchema,
	tableId: seatingTableIdSchema,
});

export const assignSeatSchema = z.object({
	wishlistId: wishlistIdSchema,
	tableId: seatingTableIdSchema,
	personId: seatingPersonIdSchema,
});

export const unassignSeatSchema = z.object({
	wishlistId: wishlistIdSchema,
	personId: seatingPersonIdSchema,
});

export type SeatingBoardInput = z.infer<typeof seatingBoardSchema>;
export type CreateSeatingTablesInput = z.infer<
	typeof createSeatingTablesSchema
>;
export type UpdateSeatingTableInput = z.infer<typeof updateSeatingTableSchema>;
export type MoveSeatingTableInput = z.infer<typeof moveSeatingTableSchema>;
export type DeleteSeatingTableInput = z.infer<typeof deleteSeatingTableSchema>;
export type AssignSeatInput = z.infer<typeof assignSeatSchema>;
export type UnassignSeatInput = z.infer<typeof unassignSeatSchema>;
