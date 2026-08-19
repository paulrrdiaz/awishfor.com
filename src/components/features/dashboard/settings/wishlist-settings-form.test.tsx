// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WishlistSettingsForm } from "@/components/features/dashboard/settings/wishlist-settings-form";

const updateSettingsMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
	useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("sonner", () => ({
	toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/components/features/wishlist/message-variant-picker", () => ({
	MessageVariantPicker: () => null,
}));

vi.mock("@/components/features/wishlist/motif-picker", () => ({
	MotifPicker: () => null,
}));

vi.mock("@/components/ui/date-picker", () => ({
	DatePicker: () => null,
}));

vi.mock("@/components/ui/date-time-picker", () => ({
	DateTimePicker: () => null,
}));

vi.mock("@/trpc/react", () => ({
	api: {
		useUtils: () => ({
			wishlist: {
				checkSlugAvailability: {
					fetch: vi.fn().mockResolvedValue({ available: true }),
				},
			},
		}),
		wishlist: {
			updateSettings: {
				useMutation: () => ({ mutate: updateSettingsMock, isPending: false }),
			},
			archive: {
				useMutation: () => ({ mutate: vi.fn(), isPending: false }),
			},
			restore: {
				useMutation: () => ({ mutate: vi.fn(), isPending: false }),
			},
		},
	},
}));

const wishlist = {
	id: "wishlist_123",
	slug: "lista-de-boda",
	title: "Lista de boda",
	subtitle: "Celebramos juntos",
	eventType: "wedding",
	language: "es",
	currency: "PEN",
	welcomeMessage: "Gracias por acompañarnos",
	welcomeMessageAttribution: null,
	thankYouMessage: null,
	eventDate: null,
	eventTime: null,
	rsvpDeadline: null,
	eventLocation: null,
	dressCode: null,
	deliveryRecipientName: null,
	deliveryDocumentId: null,
	deliveryAddress: null,
	deliveryPhone: null,
	themeId: null,
	layoutId: null,
	buttonStyle: null,
	headingFont: null,
	bodyFont: null,
	countdownVariant: null,
	welcomeMessageVariant: null,
	thankYouMessageVariant: null,
	motifId: null,
	motifTreatment: null,
	motifPalette: null,
	showHowItWorks: true,
	status: "draft",
	isOwner: true,
};

beforeEach(() => updateSettingsMock.mockReset());
afterEach(cleanup);

describe("WishlistSettingsForm subtitle", () => {
	it("prefills and submits an edited subtitle", async () => {
		const user = userEvent.setup();
		render(<WishlistSettingsForm wishlist={wishlist as never} />);
		const input = screen.getByLabelText(/Subtítulo/);

		expect(input).toHaveValue("Celebramos juntos");
		await user.clear(input);
		await user.type(input, "Una fecha para recordar");
		await user.click(screen.getByRole("button", { name: "Guardar cambios" }));

		expect(updateSettingsMock).toHaveBeenCalledWith(
			expect.objectContaining({ subtitle: "Una fecha para recordar" }),
		);
	});

	it("submits an empty subtitle as absent", async () => {
		const user = userEvent.setup();
		render(<WishlistSettingsForm wishlist={wishlist as never} />);
		await user.clear(screen.getByLabelText(/Subtítulo/));
		await user.click(screen.getByRole("button", { name: "Guardar cambios" }));

		expect(updateSettingsMock).toHaveBeenCalledWith(
			expect.objectContaining({ subtitle: null }),
		);
	});

	it("surfaces the 160-character limit and blocks saving", () => {
		render(<WishlistSettingsForm wishlist={wishlist as never} />);
		fireEvent.change(screen.getByLabelText(/Subtítulo/), {
			target: { value: "a".repeat(161) },
		});

		expect(
			screen.getByText("El subtítulo debe tener como máximo 160 caracteres."),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Guardar cambios" }),
		).toBeDisabled();
	});
});

describe("WishlistSettingsForm owner-reserved controls", () => {
	it("shows the danger zone for the owner", () => {
		render(
			<WishlistSettingsForm
				wishlist={{ ...wishlist, isOwner: true } as never}
			/>,
		);
		expect(screen.getByText("Zona peligrosa")).toBeInTheDocument();
	});

	it("hides the danger zone for a collaborator", () => {
		render(
			<WishlistSettingsForm
				wishlist={{ ...wishlist, isOwner: false } as never}
			/>,
		);
		expect(screen.queryByText("Zona peligrosa")).not.toBeInTheDocument();
	});
});
