// @vitest-environment jsdom

import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createWishlistWizardStore } from "@/stores/wishlist-wizard.store";
import { WizardProvider } from "./wizard-provider";
import { WizardShell } from "./wizard-shell";

const captureApplicationEventMock = vi.hoisted(() => vi.fn());
const pushMock = vi.hoisted(() => vi.fn());
const searchParamsMock = vi.hoisted(() => ({ value: "step=event-type" }));

vi.mock("next/navigation", () => ({
	useRouter: () => ({ push: pushMock }),
	useSearchParams: () => new URLSearchParams(searchParamsMock.value),
}));

vi.mock("@/lib/analytics/application-client", () => ({
	captureApplicationEvent: captureApplicationEventMock,
}));

vi.mock("@/components/shared/wizard-layout", () => ({
	WizardLayout: ({
		actions,
		children,
	}: {
		actions: ReactNode;
		children: ReactNode;
	}) => (
		<div>
			{actions}
			{children}
		</div>
	),
}));

vi.mock("@/components/shared/wizard-nav", () => ({
	WizardNav: ({ onNext }: { onNext: () => void }) => (
		<button onClick={onNext} type="button">
			Siguiente
		</button>
	),
}));

vi.mock("@/components/shared/wizard-stepper", () => ({
	WizardStepper: () => null,
}));

vi.mock("./details-step", () => ({ DetailsStep: () => <div>Detalles</div> }));
vi.mock("./event-type-step", () => ({
	EventTypeStep: () => <div>Ocasión</div>,
}));
vi.mock("./gifts-step", () => ({ GiftsStep: () => <div>Regalos</div> }));
vi.mock("./images-step", () => ({ ImagesStep: () => <div>Imágenes</div> }));
vi.mock("./layout-step", () => ({ LayoutStep: () => <div>Disposición</div> }));
vi.mock("./published-step", () => ({
	PublishedStep: () => <div>Publicada</div>,
}));
vi.mock("./recovery-prompt", () => ({ RecoveryPrompt: () => null }));
vi.mock("./review-step", () => ({ ReviewStep: () => <div>Revisar</div> }));
vi.mock("./save-draft-controls", () => ({ SaveDraftControls: () => null }));
vi.mock("./theme-step", () => ({ ThemeStep: () => <div>Tema</div> }));

function renderShell({
	hasHydrated = true,
	publishSuccess = false,
	step = "event-type",
}: {
	hasHydrated?: boolean;
	publishSuccess?: boolean;
	step?: string;
} = {}) {
	searchParamsMock.value = `step=${step}`;
	const store = createWishlistWizardStore();
	if (publishSuccess) {
		store.getState().completePublish({
			dashboardUrlPath: "/dashboard",
			publicUrlPath: "/w/lista",
			slug: "lista",
			wishlistId: "wishlist_1",
		});
	}
	if (hasHydrated) {
		store.getState().setHasHydrated();
	}

	return {
		store,
		...render(
			<WizardProvider rehydrate={false} store={store}>
				<WizardShell />
			</WizardProvider>,
		),
	};
}

describe("WizardShell analytics", () => {
	beforeEach(() => {
		cleanup();
		vi.clearAllMocks();
		captureApplicationEventMock.mockResolvedValue(undefined);
	});

	it("captures wizard start exactly once after initial-step hydration", async () => {
		const { rerender, store } = renderShell({ hasHydrated: false });

		expect(captureApplicationEventMock).not.toHaveBeenCalled();
		act(() => {
			store.getState().setHasHydrated();
		});

		await waitFor(() => {
			expect(captureApplicationEventMock).toHaveBeenCalledWith(
				"wizard_started",
				{},
			);
		});

		rerender(
			<WizardProvider rehydrate={false} store={createWishlistWizardStore()}>
				<WizardShell />
			</WizardProvider>,
		);

		expect(captureApplicationEventMock).toHaveBeenCalledTimes(1);
	});

	it("captures the stable completed step only for valid forward navigation", async () => {
		const user = userEvent.setup();
		renderShell();

		await user.click(screen.getByRole("button", { name: "Siguiente" }));

		expect(captureApplicationEventMock).toHaveBeenCalledWith(
			"wizard_step_completed",
			{ step: "event-type" },
		);
		expect(pushMock).toHaveBeenCalledWith(
			expect.stringContaining("step=details"),
		);
	});

	it("does not capture an invalid details forward attempt", async () => {
		const user = userEvent.setup();
		renderShell({ step: "details" });

		await user.click(screen.getByRole("button", { name: "Siguiente" }));

		expect(captureApplicationEventMock).not.toHaveBeenCalledWith(
			"wizard_step_completed",
			expect.anything(),
		);
		expect(pushMock).not.toHaveBeenCalled();
	});

	it("does not record a completion event from the terminal review step", async () => {
		const user = userEvent.setup();
		renderShell({ step: "review" });

		await user.click(screen.getByRole("button", { name: "Siguiente" }));

		expect(captureApplicationEventMock).not.toHaveBeenCalled();
	});

	it("does not start during published-state recovery redirects", async () => {
		renderShell({ step: "published" });

		await waitFor(() => {
			expect(pushMock).toHaveBeenCalledWith(
				expect.stringContaining("step=review"),
			);
		});

		expect(captureApplicationEventMock).not.toHaveBeenCalled();
	});

	it("does not start in the published success state", () => {
		renderShell({ publishSuccess: true, step: "published" });

		expect(captureApplicationEventMock).not.toHaveBeenCalled();
	});
});
