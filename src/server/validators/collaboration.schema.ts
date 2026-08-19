import { z } from "zod";
import { wishlistIdSchema } from "@/server/validators/wishlist.schema";

export const collaboratorEmailSchema = z
	.string()
	.trim()
	.toLowerCase()
	.pipe(z.email("Correo inválido").max(200, "Correo muy largo"));

export const lookupRecipientSchema = z.object({
	wishlistId: wishlistIdSchema,
	email: collaboratorEmailSchema,
});

export const shareWishlistSchema = z.object({
	wishlistId: wishlistIdSchema,
	email: collaboratorEmailSchema,
});

export const listCollaboratorsSchema = z.object({
	wishlistId: wishlistIdSchema,
});

export const removeCollaboratorSchema = z.object({
	wishlistId: wishlistIdSchema,
	memberId: z.string().min(1, "Member id is required"),
});

export const revokeInvitationSchema = z.object({
	wishlistId: wishlistIdSchema,
	invitationId: z.string().min(1, "Invitation id is required"),
});

export const resendInvitationSchema = z.object({
	wishlistId: wishlistIdSchema,
	invitationId: z.string().min(1, "Invitation id is required"),
});

export type LookupRecipientInput = z.infer<typeof lookupRecipientSchema>;
export type ShareWishlistInput = z.infer<typeof shareWishlistSchema>;
export type ListCollaboratorsInput = z.infer<typeof listCollaboratorsSchema>;
export type RemoveCollaboratorInput = z.infer<typeof removeCollaboratorSchema>;
export type RevokeInvitationInput = z.infer<typeof revokeInvitationSchema>;
export type ResendInvitationInput = z.infer<typeof resendInvitationSchema>;
