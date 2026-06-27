import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PriorityBadge } from "./priority-badge";

const meta = {
	component: PriorityBadge,
	title: "Shared/PriorityBadge",
} satisfies Meta<typeof PriorityBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const High: Story = {
	args: {
		priority: "high",
	},
};

export const All: Story = {
	render: () => (
		<div className="flex flex-wrap gap-2">
			<PriorityBadge priority="low" />
			<PriorityBadge priority="medium" />
			<PriorityBadge priority="high" />
		</div>
	),
};
