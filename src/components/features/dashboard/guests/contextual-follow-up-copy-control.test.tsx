// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ContextualFollowUpCopyControl } from "./contextual-follow-up-copy-control";

const mutateMock = vi.hoisted(() => vi.fn());
const invalidateMock = vi.hoisted(() => vi.fn());
const useMutationMock = vi.hoisted(() => vi.fn());
const copyTextMock = vi.hoisted(() => vi.fn());

vi.mock("@/trpc/react", () => ({
	api: {
		useUtils: () => ({ invite: { list: { invalidate: invalidateMock } } }),
		invite: { recordFollowUpCopy: { useMutation: useMutationMock } },
	},
}));

const props = {
	wishlistId: "wishlist_1",
	inviteId: "invite_1",
	kind: "invitation" as const,
	label: "Copiar invitación",
	message: "Mensaje privado",
	emphasis: "recommended" as const,
	copyText: copyTextMock,
};

beforeEach(() => {
	vi.clearAllMocks();
	useMutationMock.mockReturnValue({ isPending: false, mutate: mutateMock });
	copyTextMock.mockResolvedValue(undefined);
});

afterEach(() => vi.restoreAllMocks());

describe("ContextualFollowUpCopyControl", () => {
	it("copies first, then records the successful copy and updates feedback", async () => {
		const user = userEvent.setup();
		render(<ContextualFollowUpCopyControl {...props} />);

		await user.click(screen.getByRole("button", { name: "Copiar invitación" }));

		expect(copyTextMock).toHaveBeenCalledWith("Mensaje privado");
		expect(mutateMock).toHaveBeenCalledWith({
			wishlistId: "wishlist_1",
			inviteId: "invite_1",
			kind: "invitation",
		});
		expect(
			screen.getByRole("button", { name: "Mensaje copiado" }),
		).toBeVisible();
	});

	it("keeps metadata untouched and offers retry feedback when copying fails", async () => {
		copyTextMock.mockRejectedValue(new Error("denied"));
		const user = userEvent.setup();
		render(<ContextualFollowUpCopyControl {...props} />);

		await user.click(screen.getByRole("button", { name: "Copiar invitación" }));

		expect(mutateMock).not.toHaveBeenCalled();
		expect(screen.getByText(/No se pudo copiar el mensaje/)).toBeVisible();
	});

	it("keeps the truthful copied state when persistence warns", async () => {
		useMutationMock.mockImplementation((options) => ({
			isPending: false,
			mutate: () => options.onError(),
		}));
		const user = userEvent.setup();
		render(<ContextualFollowUpCopyControl {...props} />);

		await user.click(screen.getByRole("button", { name: "Copiar invitación" }));

		expect(
			screen.getByRole("button", { name: "Mensaje copiado" }),
		).toBeVisible();
		expect(
			screen.getByText(/no pudimos guardar este recordatorio/i),
		).toBeVisible();
	});
});
