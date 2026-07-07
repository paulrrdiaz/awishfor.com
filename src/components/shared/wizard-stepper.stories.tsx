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
	{ id: "design", label: "Diseño" },
	{ id: "gifts", label: "Regalos" },
	{ id: "publish", label: "Publicar" },
];

export const MixedStates: Story = {
	args: {
		completedSteps: ["event-type", "details"],
		currentStep: "design",
		onSelectStep: () => undefined,
		steps,
	},
};

export const DesktopNodeStates: Story = {
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

export const MobileSegmentedBar: Story = {
	args: {
		...MixedStates.args,
		completedSteps: ["event-type"],
		currentStep: "details",
	},
	parameters: Mobile.parameters,
};
