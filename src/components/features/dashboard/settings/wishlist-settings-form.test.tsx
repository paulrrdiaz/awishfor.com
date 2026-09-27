// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WishlistSettingsForm } from "@/components/features/dashboard/settings/wishlist-settings-form";

const updateSettingsMock = vi.hoisted(() => vi.fn());

function getSaveButton() {
	const [button] = screen.getAllByRole("button", { name: "Guardar cambios" });
	if (!button) {
		throw new Error("Guardar cambios button not found");
	}
	return button;
}

vi.mock("@/components/layouts/public-wishlist/public-theme-provider", () => ({
	PublicThemeProvider: ({ children }: { children: React.ReactNode }) =>
		children,
}));

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
	seatingPassVariant: "pass",
	seatingPassShowMates: true,
	seatingPassShowMap: true,
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
		await user.click(getSaveButton());

		expect(updateSettingsMock).toHaveBeenCalledWith(
			expect.objectContaining({ subtitle: "Una fecha para recordar" }),
		);
	});

	it("submits an empty subtitle as absent", async () => {
		const user = userEvent.setup();
		render(<WishlistSettingsForm wishlist={wishlist as never} />);
		await user.clear(screen.getByLabelText(/Subtítulo/));
		await user.click(getSaveButton());

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
		expect(getSaveButton()).toBeDisabled();
	});
});

describe("WishlistSettingsForm event times", () => {
	it("submits the configured end time", async () => {
		const user = userEvent.setup();
		render(<WishlistSettingsForm wishlist={wishlist as never} />);
		fireEvent.click(screen.getByLabelText("Hora de inicio"));
		fireEvent.click(screen.getByRole("option", { name: "4:00 p. m." }));
		fireEvent.click(screen.getByLabelText("Hora de fin"));
		fireEvent.click(screen.getByRole("option", { name: "8:00 p. m." }));

		await user.click(getSaveButton());

		expect(updateSettingsMock).toHaveBeenCalledWith(
			expect.objectContaining({ eventTime: "16:00", endTime: "20:00" }),
		);
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

describe("WishlistSettingsForm seating pass", () => {
	it("shows the defaults: pass variant with both toggles on", () => {
		render(<WishlistSettingsForm wishlist={wishlist as never} />);
		expect(screen.getByLabelText(/Pase de mesa/)).toBeChecked();
		expect(screen.getByLabelText(/Anillo de asientos/)).not.toBeChecked();
		expect(screen.getByLabelText("Mostrar compañeros de mesa")).toBeChecked();
		expect(screen.getByLabelText("Mostrar cómo llegar")).toBeChecked();
		expect(
			screen.getByText(/desde 5 días antes del evento/),
		).toBeInTheDocument();
	});

	it("updates the preview when the variant changes", async () => {
		const user = userEvent.setup();
		const { container } = render(
			<WishlistSettingsForm wishlist={wishlist as never} />,
		);
		expect(screen.getByText("Tu grupo")).toBeInTheDocument();
		await user.click(screen.getByLabelText(/Anillo de asientos/));
		expect(screen.queryByText("Tu grupo")).not.toBeInTheDocument();
		expect(screen.getByText("Sus lugares")).toBeInTheDocument();
		expect(container.querySelectorAll("[data-seat]").length).toBeGreaterThan(0);
	});

	it("hides tablemates and venue in the preview when toggled off", async () => {
		const user = userEvent.setup();
		render(<WishlistSettingsForm wishlist={wishlist as never} />);
		expect(screen.getByText(/Ana R\., Pedro R\./)).toBeInTheDocument();
		expect(screen.getByText("Google Maps")).toBeInTheDocument();

		await user.click(screen.getByLabelText("Mostrar compañeros de mesa"));
		await user.click(screen.getByLabelText("Mostrar cómo llegar"));

		expect(screen.queryByText(/Ana R\./)).not.toBeInTheDocument();
		expect(screen.queryByText("Google Maps")).not.toBeInTheDocument();
	});

	it("submits the seating pass settings", async () => {
		const user = userEvent.setup();
		render(<WishlistSettingsForm wishlist={wishlist as never} />);
		await user.click(screen.getByLabelText(/Anillo de asientos/));
		await user.click(screen.getByLabelText("Mostrar cómo llegar"));
		await user.click(getSaveButton());

		expect(updateSettingsMock).toHaveBeenCalledWith(
			expect.objectContaining({
				seatingPassVariant: "ring",
				seatingPassShowMates: true,
				seatingPassShowMap: false,
			}),
		);
	});
});
