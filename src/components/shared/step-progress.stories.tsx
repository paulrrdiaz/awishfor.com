import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StepProgress } from "./step-progress";

const meta = {
	component: StepProgress,
	title: "Shared/StepProgress",
} satisfies Meta<typeof StepProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		steps: [
			{ id: "1", label: "Detalles", complete: true },
			{ id: "2", label: "Regalos", complete: true },
			{ id: "3", label: "Publicar", complete: false },
		],
	},
};
