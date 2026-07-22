import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { HeroCtas } from "./hero-ctas";

const meta = {
	component: HeroCtas,
	title: "Shared/HeroCtas",
} satisfies Meta<typeof HeroCtas>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		variant: "default",
	},
};

export const OnPhoto: Story = {
	args: {
		variant: "on-photo",
	},
	decorators: [
		(Story) => (
			<div className="bg-neutral-800 p-10">
				<Story />
			</div>
		),
	],
};
