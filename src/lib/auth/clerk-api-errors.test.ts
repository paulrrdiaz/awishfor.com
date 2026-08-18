import { describe, expect, it, vi } from "vitest";

vi.mock("@clerk/nextjs/errors", () => ({
	isClerkAPIResponseError: (error: unknown) =>
		typeof error === "object" && error !== null && "errors" in error,
}));

import {
	hasClerkErrorCode,
	normalizeClerkAuthError,
} from "@/lib/auth/clerk-api-errors";

type ApiError = {
	code?: string;
	longMessage?: string;
	message: string;
	meta?: { paramName?: string };
};

function apiResponse(errors: ApiError[]) {
	return { errors };
}

describe("normalizeClerkAuthError", () => {
	it("maps direct response messages to their fields", () => {
		expect(
			normalizeClerkAuthError(
				apiResponse([
					{
						longMessage: "Este correo ya está en uso.",
						message: "Email exists",
						meta: { paramName: "email_address" },
					},
					{
						message: "La contraseña no es válida.",
						meta: { paramName: "password" },
					},
				]),
			),
		).toEqual({
			email: ["Este correo ya está en uso."],
			password: ["La contraseña no es válida."],
			general: [],
		});
	});

	it("translates known Clerk auth codes into Spanish", () => {
		expect(
			normalizeClerkAuthError(
				apiResponse([
					{
						code: "form_identifier_not_found",
						longMessage: "Couldn't find your account.",
						message: "Couldn't find your account.",
						meta: { paramName: "identifier" },
					},
					{
						code: "form_password_incorrect",
						longMessage: "The password is incorrect.",
						message: "The password is incorrect.",
						meta: { paramName: "password" },
					},
				]),
			),
		).toEqual({
			email: ["No encontramos una cuenta con ese correo electrónico."],
			password: ["La contraseña es incorrecta."],
			general: [],
		});
	});

	it("reads an API response wrapped in the method error cause", () => {
		expect(
			normalizeClerkAuthError({
				longMessage: "No usar",
				cause: apiResponse([
					{
						longMessage: "No encontramos ese correo.",
						message: "Unknown email",
						meta: { paramName: "identifier" },
					},
				]),
			}),
		).toEqual({
			email: ["No encontramos ese correo."],
			password: [],
			general: [],
		});
	});

	it("finds a Clerk error code on direct and wrapped errors", () => {
		expect(
			hasClerkErrorCode(
				{ code: "client_state_invalid" },
				"client_state_invalid",
			),
		).toBe(true);
		expect(
			hasClerkErrorCode(
				{
					cause: apiResponse([
						{
							code: "client_state_invalid",
							message: "Invalid action",
						},
					]),
				},
				"client_state_invalid",
			),
		).toBe(true);
	});

	it("preserves multiple messages for one field", () => {
		expect(
			normalizeClerkAuthError(
				apiResponse([
					{
						longMessage: "Debe tener 8 caracteres.",
						message: "Too short",
						meta: { paramName: "password" },
					},
					{
						longMessage: "Debe incluir un número.",
						message: "No number",
						meta: { paramName: "password" },
					},
				]),
			),
		).toEqual({
			email: [],
			password: ["Debe tener 8 caracteres.", "Debe incluir un número."],
			general: [],
		});
	});

	it("keeps simultaneous field and general messages", () => {
		expect(
			normalizeClerkAuthError(
				apiResponse([
					{
						longMessage: "Correo no válido.",
						message: "Invalid email",
						meta: { paramName: "email_address" },
					},
					{
						longMessage: "Contraseña comprometida.",
						message: "Compromised password",
						meta: { paramName: "password" },
					},
					{ longMessage: "Inténtalo más tarde.", message: "Rate limited" },
				]),
			),
		).toEqual({
			email: ["Correo no válido."],
			password: ["Contraseña comprometida."],
			general: ["Inténtalo más tarde."],
		});
	});

	it("puts unknown parameter names in the general banner", () => {
		expect(
			normalizeClerkAuthError(
				apiResponse([
					{
						longMessage: "Nombre requerido.",
						message: "Name required",
						meta: { paramName: "first_name" },
					},
				]),
			),
		).toEqual({ email: [], password: [], general: ["Nombre requerido."] });
	});

	it("falls back to a non-response user message or the generic message", () => {
		expect(
			normalizeClerkAuthError({ longMessage: "Sin conexión.", message: "" }),
		).toEqual({ email: [], password: [], general: ["Sin conexión."] });
		expect(normalizeClerkAuthError(new Error())).toEqual({
			email: [],
			password: [],
			general: ["Algo salió mal. Inténtalo de nuevo."],
		});
	});
});
