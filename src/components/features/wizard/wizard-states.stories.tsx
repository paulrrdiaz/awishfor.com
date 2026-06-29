import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { EventType } from "@/generated/prisma/enums";
import { createWishlistWizardStore } from "@/stores/wishlist-wizard.store";
import { TRPCReactProvider } from "@/trpc/react";
import { DesignStep } from "./design-step";
import { DetailsStep } from "./details-step";
import { EventTypeStep } from "./event-type-step";
import { GiftsStep } from "./gifts-step";
import { PublishAuthGate } from "./publish-step";
import { WizardProvider } from "./wizard-provider";

function WizardStepFrame({
	children,
	state,
}: {
	children: React.ReactNode;
	state?: Partial<
		ReturnType<ReturnType<typeof createWishlistWizardStore>["getState"]>
	>;
}) {
	const store = createWishlistWizardStore();
	store.setState({
		...store.getState(),
		_hasHydrated: true,
		draft: {
			...store.getState().draft,
			buttonStyle: "pill",
			categories: ["Dormitorio", "Baño"],
			displayName: "Ana y Paulo",
			eventDate: "2026-09-12",
			eventLocation: "Miraflores, Lima",
			eventType: EventType.baby_shower,
			fontPairing: "serif-soft",
			gifts: [
				{
					category: "Dormitorio",
					hidden: false,
					id: "gift-1",
					imageUrl: null,
					internalNote: "",
					name: "Cuna colecho",
					priceAmount: 649,
					priority: "high",
					productUrl: "https://example.com/cuna",
					publicNote: "Madera clara",
					quantityNeeded: 1,
					sortOrder: 1,
				},
				{
					category: "Baño",
					hidden: true,
					id: "gift-2",
					imageUrl: null,
					internalNote: "Reservado para la familia",
					name: "Pack de toallas",
					priceAmount: 120,
					priority: "medium",
					productUrl: null,
					publicNote: "",
					quantityNeeded: 2,
					sortOrder: 2,
				},
			],
			heroTitle: "Baby shower de Emilia",
			layoutId: "editorial",
			showHowItWorks: true,
			slug: "",
			thankYouMessage: "Gracias por acompañarnos en este momento.",
			themeId: "dulce-rosa",
			title: "Wishlist de Emilia",
			welcomeMessage: "Nos emociona celebrar contigo.",
		},
		...(state ?? {}),
	});

	return (
		<TRPCReactProvider>
			<WizardProvider rehydrate={false} store={store}>
				<div className="rounded-3xl border bg-background shadow-sm">
					{children}
				</div>
			</WizardProvider>
		</TRPCReactProvider>
	);
}

const meta = {
	title: "Features/Wizard/States",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Event: Story = {
	render: () => (
		<WizardStepFrame>
			<EventTypeStep />
		</WizardStepFrame>
	),
};

export const Details: Story = {
	render: () => (
		<WizardStepFrame>
			<DetailsStep />
		</WizardStepFrame>
	),
};

export const Design: Story = {
	render: () => (
		<WizardStepFrame>
			<DesignStep />
		</WizardStepFrame>
	),
};

export const Gifts: Story = {
	render: () => (
		<WizardStepFrame>
			<GiftsStep />
		</WizardStepFrame>
	),
};

export const Publish: Story = {
	render: () => <PublishAuthGate onDismiss={() => undefined} />,
};

export const AuthGate: Story = {
	render: () => <PublishAuthGate onDismiss={() => undefined} />,
};
