import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Countdown } from "./countdown";

const meta = {
	component: Countdown,
	title: "Shared/Countdown",
} satisfies Meta<typeof Countdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		eventDate: "2026-09-12",
	},
};
