import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StatusBadge } from "./status-badge";

const meta = {
	component: StatusBadge,
	title: "Shared/StatusBadge",
} satisfies Meta<typeof StatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Available: Story = {
	args: {
		status: "available",
	},
};

export const All: Story = {
	render: () => (
		<div className="flex flex-wrap gap-2">
			<StatusBadge status="available" />
			<StatusBadge status="partial" />
			<StatusBadge status="purchased" />
			<StatusBadge status="hidden" />
		</div>
	),
};
