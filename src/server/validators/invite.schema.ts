import { z } from "zod";
import {
	wishlistIdSchema,
	wishlistSlugPattern,
} from "@/server/validators/wishlist.schema";

export const INVITE_PRIMARY_NAME_MAX_LENGTH = 120;
export const INVITE_PRIMARY_PHONE_MAX_LENGTH = 40;
export const INVITE_EXTRA_GUEST_NAME_MAX_LENGTH = 120;
export const INVITE_MAX_EXTRA_GUESTS = 4;

export const inviteIdSchema = z.string().min(1, "Invite id is required");

export const inviteSlugSchema = z
	.string()
	.trim()
	.toLowerCase()
	.regex(
		wishlistSlugPattern,
		"El enlace debe tener 3-60 caracteres: minúsculas, números o guiones",
	);

const optionalTrimmedString = (maxLength: number, message: string) =>
	z.preprocess(
		(v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
		z.string().trim().max(maxLength, message).optional(),
	);

export const invitePrimaryNameSchema = z
	.string()
	.trim()
	.min(1, "El nombre es obligatorio")
	.max(
		INVITE_PRIMARY_NAME_MAX_LENGTH,
		`El nombre debe tener como máximo ${INVITE_PRIMARY_NAME_MAX_LENGTH} caracteres`,
	);

export const invitePrimaryEmailSchema = z.preprocess(
	(v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
	z.email("Correo inválido").max(200, "Correo muy largo").optional(),
);

export const invitePrimaryPhoneSchema = optionalTrimmedString(
	INVITE_PRIMARY_PHONE_MAX_LENGTH,
	"Teléfono muy largo",
);

export const inviteExtraGuestSchema = z.object({
	name: optionalTrimmedString(
		INVITE_EXTRA_GUEST_NAME_MAX_LENGTH,
		"Nombre muy largo",
	),
});

export const inviteExtraGuestsSchema = z
	.array(inviteExtraGuestSchema)
	.max(
		INVITE_MAX_EXTRA_GUESTS,
		`Máximo ${INVITE_MAX_EXTRA_GUESTS} acompañantes`,
	)
	.default([]);

export const createInviteSchema = z.object({
	wishlistId: wishlistIdSchema,
	primaryName: invitePrimaryNameSchema,
	primaryEmail: invitePrimaryEmailSchema,
	primaryPhone: invitePrimaryPhoneSchema,
	slug: inviteSlugSchema.optional(),
	extraGuests: inviteExtraGuestsSchema,
});

export const updateInviteSchema = z.object({
	inviteId: inviteIdSchema,
	primaryName: invitePrimaryNameSchema.optional(),
	primaryEmail: invitePrimaryEmailSchema,
	primaryPhone: invitePrimaryPhoneSchema,
	slug: inviteSlugSchema.optional(),
	extraGuests: inviteExtraGuestsSchema.optional(),
});

export const deleteInviteSchema = z.object({
	inviteId: inviteIdSchema,
});

export const listInvitesSchema = z.object({
	wishlistId: wishlistIdSchema,
});

export const respondInviteSchema = z.object({
	wishlistSlug: z.string().min(1),
	guestSlug: z.string().min(1),
	status: z.enum(["confirmed", "declined"]),
});

export type CreateInviteInput = z.infer<typeof createInviteSchema>;
export type UpdateInviteInput = z.infer<typeof updateInviteSchema>;
export type DeleteInviteInput = z.infer<typeof deleteInviteSchema>;
export type ListInvitesInput = z.infer<typeof listInvitesSchema>;
export type RespondInviteInput = z.infer<typeof respondInviteSchema>;
