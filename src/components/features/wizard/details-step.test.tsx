// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
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
