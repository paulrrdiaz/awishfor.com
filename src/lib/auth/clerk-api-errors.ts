import { isClerkAPIResponseError } from "@clerk/nextjs/errors";

const DEFAULT_ERROR_MESSAGE = "Algo salió mal. Inténtalo de nuevo.";

const CLERK_AUTH_ERROR_TRANSLATIONS: Record<string, string> = {
	form_email_address_blocked: "Este correo electrónico no está permitido.",
	form_identifier_exists: "Ya existe una cuenta con este correo electrónico.",
	form_identifier_exists__email_address:
		"Ya existe una cuenta con este correo electrónico.",
	form_identifier_not_found:
		"No encontramos una cuenta con ese correo electrónico.",
	form_param_format_invalid__email_address:
		"Ingresa un correo electrónico válido.",
	form_param_format_invalid: "El valor ingresado no es válido.",
	form_param_type_invalid__email_address:
		"Ingresa un correo electrónico válido.",
	form_param_type_invalid: "El valor ingresado no es válido.",
	form_param_value_invalid: "El valor ingresado no es válido.",
	form_param_nil: "Completa este campo.",
	form_password_compromised:
		"Esta contraseña aparece en una filtración de datos. Elige otra.",
	form_password_incorrect: "La contraseña es incorrecta.",
	form_password_length_too_short: "La contraseña es demasiado corta.",
	form_password_not_strong_enough: "Elige una contraseña más segura.",
	form_password_or_identifier_incorrect:
		"El correo electrónico o la contraseña son incorrectos.",
	form_password_pwned:
		"Esta contraseña aparece en una filtración de datos. Elige otra.",
	form_password_pwned__sign_in:
		"Esta contraseña aparece en una filtración de datos. Elige otra.",
	form_password_untrusted__sign_in:
		"Esta contraseña no se considera segura. Elige otra.",
	form_password_compromised__sign_in:
		"Esta contraseña aparece en una filtración de datos. Elige otra.",
	form_password_size_in_bytes_exceeded: "La contraseña es demasiado larga.",
	form_password_validation_failed:
		"No se pudo validar la contraseña. Inténtalo de nuevo.",
};

type ClerkMessageError = {
	code?: unknown;
	longMessage?: unknown;
	message?: unknown;
};

type ClerkMethodError = ClerkMessageError & { cause?: unknown };

export type ClerkAuthErrors = {
	email: string[];
	password: string[];
	general: string[];
};

function getMessage(error: ClerkMessageError) {
	if (typeof error.code === "string") {
		const translation = CLERK_AUTH_ERROR_TRANSLATIONS[error.code];
		if (translation) return translation;
	}
	if (typeof error.longMessage === "string" && error.longMessage) {
		return error.longMessage;
	}
	if (typeof error.message === "string" && error.message) {
		return error.message;
	}
	return null;
}

function getApiResponseError(error: unknown) {
	if (isClerkAPIResponseError(error)) return error;

	if (
		typeof error === "object" &&
		error !== null &&
		"cause" in error &&
		isClerkAPIResponseError(error.cause)
	) {
		return error.cause;
	}

	return null;
}

/** Checks both the method-level Clerk error and its API-response cause. */
export function hasClerkErrorCode(error: unknown, code: string) {
	if (
		typeof error === "object" &&
		error !== null &&
		"code" in error &&
		error.code === code
	) {
		return true;
	}

	return getApiResponseError(error)?.errors.some(
		(entry) => entry.code === code,
	);
}

/**
 * Groups the user-facing messages from a Clerk password attempt by the fields
 * supported by the sign-in and sign-up forms. Known Clerk codes use the
 * Spanish copy used throughout the custom auth UI.
 */
export function normalizeClerkAuthError(error: unknown): ClerkAuthErrors {
	const normalized: ClerkAuthErrors = { email: [], password: [], general: [] };
	const apiResponseError = getApiResponseError(error);

	if (!apiResponseError) {
		const message = getMessage((error ?? {}) as ClerkMethodError);
		normalized.general.push(message ?? DEFAULT_ERROR_MESSAGE);
		return normalized;
	}

	for (const apiError of apiResponseError.errors) {
		const message = getMessage(apiError);
		if (!message) continue;

		switch (apiError.meta?.paramName) {
			case "email_address":
			case "identifier":
				normalized.email.push(message);
				break;
			case "password":
				normalized.password.push(message);
				break;
			default:
				normalized.general.push(message);
		}
	}

	if (
		normalized.email.length === 0 &&
		normalized.password.length === 0 &&
		normalized.general.length === 0
	) {
		normalized.general.push(DEFAULT_ERROR_MESSAGE);
	}

	return normalized;
}
