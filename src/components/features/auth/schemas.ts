import { z } from "zod";

export const signInSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
	password: z.string().min(1, "Password is required"),
});

export const signUpSchema = z.object({
	name: z.string().min(1, "Please enter your name"),
	email: z.string().email("Please enter a valid email address"),
	password: z
		.string()
		.min(8, "Password must be at least 8 characters")
		.max(100, "Password must be less than 100 characters"),
	acceptedTerms: z.literal(
		true,
		"You must accept the Terms and Privacy Policy",
	),
});

export const verifyEmailSchema = z.object({
	code: z
		.string()
		.min(6, "Code must be 6 digits")
		.max(6, "Code must be 6 digits"),
});

export const resetRequestSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
});

export const resetPasswordSchema = z.object({
	code: z
		.string()
		.min(6, "Code must be 6 digits")
		.max(6, "Code must be 6 digits"),
	password: z
		.string()
		.min(8, "Password must be at least 8 characters")
		.max(100, "Password must be less than 100 characters"),
});

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
export type VerifyEmailValues = z.infer<typeof verifyEmailSchema>;
export type ResetRequestValues = z.infer<typeof resetRequestSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
