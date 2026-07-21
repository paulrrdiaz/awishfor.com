import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "@/components/ui/button";
import { EventType } from "@/generated/prisma/enums";
import { draftToPreview } from "@/lib/wishlist/draft-to-preview";
import {
	createWishlistWizardStore,
	type WishlistDraft,
} from "@/stores/wishlist-wizard.store";
import { TRPCReactProvider } from "@/trpc/react";
import { DesignStep } from "./design-step";
import { DetailsStep } from "./details-step";
import { EventTypeStep } from "./event-type-step";
import { GiftsStep } from "./gifts-step";
import {
	PublishActionsCard,
	PublishAuthGate,
	PublishPreviewPane,
	PublishReadinessCard,
	PublishSuccessPanel,
	type Readiness,
} from "./publish-step";
import { WizardModal } from "./wizard-modal";
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

const READY_DRAFT: WishlistDraft = {
	eventType: EventType.baby_shower,
	title: "Baby shower de Emilia",
	slug: "baby-shower-emilia",
	displayName: "Ana y Paulo",
	eventDate: "2026-09-12",
	eventTime: "16:00",
	eventLocation: "Miraflores, Lima",
	dressCode: "",
	coverImageUrl: null,
	coverImageUrls: [],
	heroTitle: "Baby shower de Emilia",
	welcomeMessage: "Nos emociona celebrar contigo.",
	thankYouMessage: "Gracias por acompañarnos en este momento.",
	categories: ["Dormitorio", "Baño"],
	themeId: "dulce-rosa",
	layoutId: "editorial",
	buttonStyle: "pill",
	fontPairing: "serif-soft",
	headingFont: null,
	bodyFont: null,
	showHowItWorks: true,
	gifts: [
		{
			id: "gift-1",
			name: "Cuna colecho",
			productUrl: "https://example.com/cuna",
			imageUrl: null,
			priceAmount: 649,
			category: "Dormitorio",
			quantityNeeded: 1,
			priority: "high",
			publicNote: "Madera clara",
			internalNote: "",
			hidden: false,
			sortOrder: 0,
		},
	],
};

const BLOCKED_DRAFT: WishlistDraft = {
	...READY_DRAFT,
	title: "",
	slug: "",
	gifts: [],
};

const READY_READINESS: Readiness = {
	title: true,
	eventType: true,
	slug: true,
	language: true,
	currency: true,
	visibleGift: true,
	visibleGiftCount: 1,
};

const BLOCKED_READINESS: Readiness = {
	title: false,
	eventType: true,
	slug: false,
	language: true,
	currency: true,
	visibleGift: false,
	visibleGiftCount: 0,
};

function PublishDraftFrame({
	draft,
	readiness,
	isReadyToPublish,
	isSignedIn,
	errorMessage,
}: {
	draft: WishlistDraft;
	readiness: Readiness;
	isReadyToPublish: boolean;
	isSignedIn: boolean;
	errorMessage?: string;
}) {
	return (
		<div className="mx-auto w-full max-w-5xl lg:flex lg:max-w-none">
			<div className="lg:w-[480px] lg:shrink-0 lg:border-border lg:border-r lg:px-8 lg:py-7">
				<p className="mb-2 font-medium text-muted-foreground text-xs uppercase tracking-wide">
					Paso 5 de 5
				</p>
				<h1 className="mb-2 text-center font-semibold text-2xl text-foreground lg:text-left lg:font-serif lg:text-3xl">
					Revisa y publica tu wishlist
				</h1>
				<p className="mb-8 text-center text-muted-foreground text-sm lg:text-left">
					Valida lo importante, mira la vista final y publícala cuando esté
					lista.
				</p>

				<div className="space-y-6">
					<PublishReadinessCard
						draft={draft}
						isReadyToPublish={isReadyToPublish}
						readiness={readiness}
						savedSlug={null}
						savedWishlistId={null}
						slugStatus={readiness.slug ? "available" : "idle"}
					/>

					<PublishActionsCard
						errorMessage={errorMessage ?? null}
						isReadyToPublish={isReadyToPublish}
						isSignedIn={isSignedIn}
						isSubmitting={false}
						onPublish={() => undefined}
						ownerPreviewHref={null}
					/>
				</div>
			</div>

			<PublishPreviewPane preview={draftToPreview(draft)} />
		</div>
	);
}

export const PublishBlockedDraft: Story = {
	render: () => (
		<PublishDraftFrame
			draft={BLOCKED_DRAFT}
			errorMessage="Completa la checklist antes de publicar."
			isReadyToPublish={false}
			isSignedIn
			readiness={BLOCKED_READINESS}
		/>
	),
};

export const PublishReadyDraft: Story = {
	render: () => (
		<PublishDraftFrame
			draft={READY_DRAFT}
			isReadyToPublish
			isSignedIn
			readiness={READY_READINESS}
		/>
	),
};

export const PublishAuthGateState: Story = {
	render: () => (
		<PublishAuthGate draft={READY_DRAFT} onDismiss={() => undefined} />
	),
};

export const PublishConflict: Story = {
	render: () => (
		<WizardModal
			description="Este borrador fue actualizado desde el dashboard después de tu último guardado."
			title="Hay una versión más reciente"
		>
			<Button onClick={() => undefined} type="button">
				Usar versión del dashboard
			</Button>
			<Button onClick={() => undefined} type="button" variant="outline">
				Continuar con este borrador local
			</Button>
		</WizardModal>
	),
};

export const PublishSuccess: Story = {
	render: () => (
		<div className="mx-auto flex w-full max-w-4xl items-center justify-center px-4 py-10">
			<PublishSuccessPanel
				dashboardUrlPath="/dashboard"
				isDownloadingQr={false}
				onCopyLink={() => undefined}
				onDownloadQr={() => undefined}
				publishedUrl="https://awishfor.com/w/baby-shower-emilia"
				whatsAppUrl="https://wa.me/?text=Mira%20mi%20wishlist"
			/>
		</div>
	),
};
