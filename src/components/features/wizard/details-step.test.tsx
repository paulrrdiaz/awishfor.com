// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DetailsStep } from "@/components/features/wizard/details-step";
import { WizardProvider } from "@/components/features/wizard/wizard-provider";
import { DEFAULT_WISHLIST_SUBTITLE } from "@/lib/wishlist/subtitle";
import { createWishlistWizardStore } from "@/stores/wishlist-wizard.store";

vi.mock("@/components/layouts/public-wishlist/public-theme-provider", () => ({
	PublicThemeProvider: ({ children }: { children: React.ReactNode }) =>
		children,
}));

vi.mock("@/components/ui/date-picker", () => ({
	DatePicker: ({
		id,
		onDateChange,
	}: {
		id: string;
		onDateChange: (date: Date | null) => void;
	}) => (
		<button
			id={id}
			onClick={() => onDateChange(new Date(2026, 8, 27))}
			type="button"
		>
			Seleccionar fecha
		</button>
	),
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
	},
}));

afterEach(cleanup);

describe("DetailsStep subtitle", () => {
	it("shows the seeded optional field and explains later editing and removal", () => {
		render(
			<WizardProvider rehydrate={false}>
				<DetailsStep />
			</WizardProvider>,
		);

		expect(screen.getByLabelText(/Subtítulo/)).toHaveValue(
			DEFAULT_WISHLIST_SUBTITLE,
		);
		expect(
			screen.getByText(
				"Personalízalo ahora; luego podrás cambiarlo o quitarlo desde Configuración.",
			),
		).toBeInTheDocument();
	});

	it("updates the live header preview and collapses it immediately when cleared", async () => {
		const user = userEvent.setup();
		const store = createWishlistWizardStore();
		store.getState().setField("subtitle", "Una historia que recién empieza");

		render(
			<WizardProvider rehydrate={false} store={store}>
				<DetailsStep />
			</WizardProvider>,
		);

		expect(
			screen.getByText("Una historia que recién empieza"),
		).toBeInTheDocument();

		await user.clear(screen.getByLabelText(/Subtítulo/));

		expect(
			screen.queryByText("Una historia que recién empieza"),
		).not.toBeInTheDocument();
		expect(store.getState().draft.subtitle).toBe("");
	});
});

describe("DetailsStep event schedule", () => {
	it("writes the event date, start time, and end time to the wizard draft", () => {
		const store = createWishlistWizardStore();
		render(
			<WizardProvider rehydrate={false} store={store}>
				<DetailsStep />
			</WizardProvider>,
		);

		fireEvent.click(screen.getByLabelText("Fecha del evento"));
		fireEvent.change(screen.getByLabelText("Hora de inicio"), {
			target: { value: "16:00" },
		});
		fireEvent.change(screen.getByLabelText("Hora de fin"), {
			target: { value: "20:00" },
		});

		expect(store.getState().draft).toMatchObject({
			eventDate: "2026-09-27",
			eventTime: "16:00",
			endTime: "20:00",
		});
	});
});
