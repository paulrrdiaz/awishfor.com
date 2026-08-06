import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "@/components/ui/button";
import { WizardNav } from "./wizard-nav";

const meta = {
	component: WizardNav,
	title: "Shared/WizardNav",
} satisfies Meta<typeof WizardNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MiddleStep: Story = {
	args: {
		isFirst: false,
		variant: "default",
		onBack: () => undefined,
		onNext: () => undefined,
		saveDraftSlot: <Button variant="outline">Guardar borrador</Button>,
	},
};

export const FirstStep: Story = {
	args: {
		...MiddleStep.args,
		isFirst: true,
	},
};

export const InCardFooter: Story = {
	args: MiddleStep.args,
	parameters: {
		viewport: {
			defaultViewport: "desktop",
		},
	},
};

export const ReviewStep: Story = {
	args: {
		...MiddleStep.args,
		variant: "review",
	},
};
