import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MetricCard } from "./metric-card";

const meta = {
	component: MetricCard,
	title: "Shared/MetricCard",
} satisfies Meta<typeof MetricCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		label: "Regalos disponibles",
		value: 12,
	},
};
