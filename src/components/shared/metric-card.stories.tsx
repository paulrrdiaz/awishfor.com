import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Gift } from "lucide-react";
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
		description: "Listos para que los invitados elijan.",
		icon: <Gift className="size-5" />,
	},
};
