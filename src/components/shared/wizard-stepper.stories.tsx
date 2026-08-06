import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { WizardStepper } from "./wizard-stepper";

const meta = {
	component: WizardStepper,
	title: "Shared/WizardStepper",
} satisfies Meta<typeof WizardStepper>;

export default meta;
type Story = StoryObj<typeof meta>;

const steps = [
	{ id: "event-type", label: "Ocasión" },
	{ id: "details", label: "Detalles" },
	{ id: "layout", label: "Disposición" },
	{ id: "theme", label: "Tema" },
	{ id: "images", label: "Imágenes" },
	{ id: "gifts", label: "Regalos" },
	{ id: "review", label: "Revisar" },
	{ id: "published", label: "Publicada" },
];

export const MixedStates: Story = {
	args: {
		completedSteps: ["event-type", "details", "layout"],
		currentStep: "theme",
		onSelectStep: () => undefined,
		steps,
	},
};

export const Desktop: Story = {
	args: MixedStates.args,
	parameters: {
		viewport: {
			defaultViewport: "desktop",
		},
	},
};

export const Mobile: Story = {
	args: MixedStates.args,
	parameters: {
		viewport: {
			defaultViewport: "mobile1",
		},
	},
};

export const FirstStep: Story = {
	args: {
		...MixedStates.args,
		completedSteps: [],
		currentStep: "event-type",
	},
};

export const LastStep: Story = {
	args: {
		...MixedStates.args,
		completedSteps: steps.slice(0, 7).map((step) => step.id),
		currentStep: "published",
	},
};
