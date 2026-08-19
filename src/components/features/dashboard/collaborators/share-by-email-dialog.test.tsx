// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ShareByEmailDialog } from "./share-by-email-dialog";

const lookupRecipientFetchMock = vi.hoisted(() => vi.fn());
const shareMutateMock = vi.hoisted(() => vi.fn());

vi.mock("sonner", () => ({
	toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/trpc/react", () => ({
	api: {
		useUtils: () => ({
			collaboration: {
				lookupRecipient: { fetch: lookupRecipientFetchMock },
			},
		}),
		collaboration: {
			share: {
				useMutation: (opts: { onSuccess?: () => void }) => ({
					mutate: (input: unknown) => {
						shareMutateMock(input);
						opts.onSuccess?.();
					},
					isPending: false,
				}),
			},
		},
	},
}));

afterEach(cleanup);

beforeEach(() => {
	vi.clearAllMocks();
});

describe("ShareByEmailDialog", () => {
	it("previews the matched account's name before sharing", async () => {
		lookupRecipientFetchMock.mockResolvedValue({ name: "Marco Pérez" });
		const user = userEvent.setup();
		const onShared = vi.fn();

		render(
			<ShareByEmailDialog
				onOpenChange={() => {}}
				onShared={onShared}
				open
				wishlistId="wl_1"
			/>,
		);

		await user.type(
			screen.getByLabelText("Correo electrónico"),
			"marco@example.com",
		);
		await user.click(screen.getByRole("button", { name: "Continuar" }));

		expect(await screen.findByText(/Marco Pérez/)).toBeInTheDocument();
		expect(shareMutateMock).not.toHaveBeenCalled();

		await user.click(screen.getByRole("button", { name: "Confirmar" }));

		expect(shareMutateMock).toHaveBeenCalledWith({
			wishlistId: "wl_1",
			email: "marco@example.com",
		});
		expect(onShared).toHaveBeenCalled();
	});

	it("states the person will be invited when the address has no account", async () => {
		lookupRecipientFetchMock.mockResolvedValue({ name: null });
		const user = userEvent.setup();

		render(
			<ShareByEmailDialog
				onOpenChange={() => {}}
				onShared={() => {}}
				open
				wishlistId="wl_1"
			/>,
		);

		await user.type(
			screen.getByLabelText("Correo electrónico"),
			"future@example.com",
		);
		await user.click(screen.getByRole("button", { name: "Continuar" }));

		expect(
			await screen.findByText(/aún no tiene una cuenta/),
		).toBeInTheDocument();
	});

	it("creates nothing and sends nothing when the dialog closes at the confirmation step", async () => {
		lookupRecipientFetchMock.mockResolvedValue({ name: "Marco Pérez" });
		const user = userEvent.setup();
		const onOpenChange = vi.fn();

		render(
			<ShareByEmailDialog
				onOpenChange={onOpenChange}
				onShared={() => {}}
				open
				wishlistId="wl_1"
			/>,
		);

		await user.type(
			screen.getByLabelText("Correo electrónico"),
			"marco@example.com",
		);
		await user.click(screen.getByRole("button", { name: "Continuar" }));
		await screen.findByText(/Marco Pérez/);

		await user.keyboard("{Escape}");

		expect(shareMutateMock).not.toHaveBeenCalled();
		expect(onOpenChange).toHaveBeenCalledWith(false);
	});

	it("creates nothing and sends nothing when cancelled at the email step", async () => {
		const user = userEvent.setup();
		const onOpenChange = vi.fn();

		render(
			<ShareByEmailDialog
				onOpenChange={onOpenChange}
				onShared={() => {}}
				open
				wishlistId="wl_1"
			/>,
		);

		await user.type(
			screen.getByLabelText("Correo electrónico"),
			"marco@example.com",
		);
		await user.click(screen.getByRole("button", { name: "Cancelar" }));

		expect(lookupRecipientFetchMock).not.toHaveBeenCalled();
		expect(shareMutateMock).not.toHaveBeenCalled();
		expect(onOpenChange).toHaveBeenCalledWith(false);
	});
});
