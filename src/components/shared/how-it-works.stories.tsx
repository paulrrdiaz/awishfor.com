import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { HowItWorks } from "./how-it-works";

const meta = {
	component: HowItWorks,
	title: "Shared/HowItWorks",
} satisfies Meta<typeof HowItWorks>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Visible: Story = {
	args: {
		showHowItWorks: true,
	},
};
