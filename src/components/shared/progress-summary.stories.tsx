import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ProgressSummary } from "./progress-summary";
import { sampleProgress } from "./story-data";

const meta = {
	component: ProgressSummary,
	title: "Shared/ProgressSummary",
} satisfies Meta<typeof ProgressSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		progress: sampleProgress,
	},
};
