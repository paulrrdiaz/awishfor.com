// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const useSignInMock = vi.hoisted(() => vi.fn());

vi.mock("@clerk/nextjs", () => ({ useSignIn: useSignInMock }));

vi.mock("@clerk/nextjs/errors", () => ({
	isClerkAPIResponseError: (error: unknown) =>
		typeof error === "object" && error !== null && "errors" in error,
}));

vi.mock("next/navigation", () => ({
	useRouter: () => ({ push: vi.fn() }),
	useSearchParams: () => new URLSearchParams(),
}));

import { ForgotPasswordForm } from "./forgot-password-form";

describe("ForgotPasswordForm", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("clears stale SignIn state before requesting a reset code", async () => {
		const reset = vi.fn().mockResolvedValue({ error: null });
		const create = vi.fn().mockResolvedValue({ error: null });
		const sendCode = vi.fn().mockResolvedValue({ error: null });
		useSignInMock.mockReturnValue({
			signIn: {
				create,
				reset,
				resetPasswordEmailCode: { sendCode },
			},
			fetchStatus: "idle",
		});
		const user = userEvent.setup();

		render(<ForgotPasswordForm />);
		await user.type(
			screen.getByLabelText("Correo electrónico"),
			"ana@example.com",
		);
		await user.click(screen.getByRole("button", { name: "Enviar código" }));

		await waitFor(() => expect(sendCode).toHaveBeenCalledTimes(1));
		expect(reset).toHaveBeenCalledTimes(1);
		expect(reset.mock.invocationCallOrder[0]).toBeLessThan(
			create.mock.invocationCallOrder[0] ?? 0,
		);
		expect(screen.getByLabelText("Código de verificación")).toBeInTheDocument();
	});

	it("resets a missing Clerk Client attempt and shows a retry message", async () => {
		const reset = vi.fn().mockResolvedValue({ error: null });
		const create = vi.fn().mockResolvedValue({
			error: {
				cause: {
					errors: [
						{
							code: "client_state_invalid",
							longMessage: "No sign in attempt was found.",
							message: "Invalid action",
						},
					],
				},
			},
		});
		useSignInMock.mockReturnValue({
			signIn: {
				create,
				reset,
				resetPasswordEmailCode: { sendCode: vi.fn() },
			},
			fetchStatus: "idle",
		});
		const user = userEvent.setup();

		render(<ForgotPasswordForm />);
		await user.type(
			screen.getByLabelText("Correo electrónico"),
			"ana@example.com",
		);
		await user.click(screen.getByRole("button", { name: "Enviar código" }));

		await waitFor(() => expect(reset).toHaveBeenCalledTimes(2));
		expect(
			screen.getByText(
				"No pudimos iniciar la recuperación. Inténtalo de nuevo.",
			),
		).toBeInTheDocument();
	});
});
