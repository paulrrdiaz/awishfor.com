// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const useSignInMock = vi.hoisted(() => vi.fn());
const useSignUpMock = vi.hoisted(() => vi.fn());

vi.mock("@clerk/nextjs", () => ({
	useSignIn: useSignInMock,
	useSignUp: useSignUpMock,
}));

vi.mock("@clerk/nextjs/errors", () => ({
	isClerkAPIResponseError: (error: unknown) =>
		typeof error === "object" && error !== null && "errors" in error,
}));

vi.mock("next/link", () => ({
	default: ({
		children,
		href,
		...props
	}: AnchorHTMLAttributes<HTMLAnchorElement> & {
		href: string;
		children: ReactNode;
	}) => (
		<a href={href} {...props}>
			{children}
		</a>
	),
}));

vi.mock("next/navigation", () => ({
	useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
	useSearchParams: () => new URLSearchParams(),
}));

import { SignInForm } from "@/components/features/auth/sign-in-form";
import { SignUpForm } from "@/components/features/auth/sign-up-form";

const rejectedPasswordAttempt = {
	errors: [
		{
			code: "form_identifier_not_found",
			longMessage: "Couldn't find your account.",
			message: "Unknown email",
			meta: { paramName: "identifier" },
		},
		{
			code: "form_password_incorrect",
			longMessage: "The password is incorrect.",
			message: "Incorrect password",
			meta: { paramName: "password" },
		},
		{
			longMessage: "Inténtalo de nuevo más tarde.",
			message: "Rate limited",
		},
	],
};

describe("auth password error handling", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders Clerk field and general errors after a rejected sign-in", async () => {
		const password = vi.fn().mockResolvedValue({
			error: rejectedPasswordAttempt,
		});
		useSignInMock.mockReturnValue({
			signIn: { password, status: null },
			fetchStatus: "idle",
		});
		const user = userEvent.setup();

		render(<SignInForm />);
		await user.type(
			screen.getByLabelText("Correo electrónico"),
			"ana@example.com",
		);
		await user.type(screen.getByLabelText("Contraseña"), "secreto");
		await user.click(screen.getByRole("button", { name: "Iniciar sesión" }));

		await waitFor(() => expect(password).toHaveBeenCalledTimes(1));
		expect(
			screen.getByText("No encontramos una cuenta con ese correo electrónico."),
		).toBeInTheDocument();
		expect(
			screen.getByText("La contraseña es incorrecta."),
		).toBeInTheDocument();
		expect(
			screen.getByText("Inténtalo de nuevo más tarde."),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Iniciar sesión" }),
		).toBeInTheDocument();
	});

	it("renders Clerk field and general errors after a rejected sign-up", async () => {
		const password = vi.fn().mockResolvedValue({
			error: rejectedPasswordAttempt,
		});
		useSignUpMock.mockReturnValue({
			signUp: { password, verifications: {} },
			errors: undefined,
			fetchStatus: "idle",
		});
		const user = userEvent.setup();

		render(<SignUpForm />);
		await user.type(screen.getByLabelText("Nombre"), "Ana");
		await user.type(
			screen.getByLabelText("Correo electrónico"),
			"ana@example.com",
		);
		await user.type(screen.getByLabelText("Contraseña"), "secreto12");
		await user.click(screen.getByLabelText(/acepto los términos/i));
		await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

		await waitFor(() => expect(password).toHaveBeenCalledTimes(1));
		expect(
			screen.getByText("No encontramos una cuenta con ese correo electrónico."),
		).toBeInTheDocument();
		expect(
			screen.getByText("La contraseña es incorrecta."),
		).toBeInTheDocument();
		expect(
			screen.getByText("Inténtalo de nuevo más tarde."),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Crear cuenta" }),
		).toBeInTheDocument();
	});

	it("resets a missing Clerk sign-up attempt and lets the user retry", async () => {
		const password = vi.fn().mockResolvedValue({ error: null });
		const sendEmailCode = vi.fn().mockResolvedValue({
			error: {
				cause: {
					errors: [
						{
							code: "client_state_invalid",
							longMessage: "No sign up attempt was found.",
							message: "Invalid action",
						},
					],
				},
			},
		});
		const reset = vi.fn().mockResolvedValue({ error: null });
		useSignUpMock.mockReturnValue({
			signUp: {
				password,
				reset,
				verifications: { sendEmailCode },
			},
			errors: undefined,
			fetchStatus: "idle",
		});
		const user = userEvent.setup();

		render(<SignUpForm />);
		await user.type(screen.getByLabelText("Nombre"), "Ana");
		await user.type(
			screen.getByLabelText("Correo electrónico"),
			"ana@example.com",
		);
		await user.type(screen.getByLabelText("Contraseña"), "secreto12");
		await user.click(screen.getByLabelText(/acepto los términos/i));
		await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

		await waitFor(() => expect(reset).toHaveBeenCalledTimes(1));
		expect(
			screen.getByText(
				"No pudimos continuar con el registro. Inténtalo de nuevo.",
			),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Crear cuenta" }),
		).toBeInTheDocument();
	});
});
