import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { HowItWorksDrawer } from "./how-it-works";

const meta = {
	component: HowItWorksDrawer,
	title: "Shared/HowItWorksDrawer",
} satisfies Meta<typeof HowItWorksDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Enabled: Story = {
	args: {
		showHowItWorks: true,
	},
};

export const Disabled: Story = {
	args: {
		showHowItWorks: false,
	},
};

export const Open: Story = {
	args: {
		defaultOpen: true,
		showHowItWorks: true,
	},
};

export const ContrastingTheme: Story = {
	args: {
		showHowItWorks: true,
	},
	decorators: [
		(Story) => (
			<div className="public-theme bg-slate-900 p-10 text-slate-50">
				<Story />
			</div>
		),
	],
};
