import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Countdown } from "./countdown";
import { withThemeVars } from "./theme-story-decorator";

const meta = {
	component: Countdown,
	title: "Shared/Countdown",
} satisfies Meta<typeof Countdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FilledPill: Story = {
	args: {
		eventDate: "2026-09-12",
		variant: "filled-pill",
	},
	decorators: [withThemeVars("cielo-suave")],
};

export const OutlinePill: Story = {
	args: {
		eventDate: "2026-09-12",
		variant: "outline-pill",
	},
	decorators: [withThemeVars("cielo-suave")],
};

export const ProgressBar: Story = {
	args: {
		createdAt: "2026-07-28T00:00:00.000Z",
		eventDate: "2026-09-12",
		variant: "progress-bar",
	},
	decorators: [withThemeVars("cielo-suave")],
};

export const PastEvent: Story = {
	args: {
		eventDate: "2020-01-01",
		variant: "outline-pill",
	},
	decorators: [withThemeVars("cielo-suave")],
};

export const FilledPillContrastTheme: Story = {
	args: {
		eventDate: "2026-09-12",
		variant: "filled-pill",
	},
	decorators: [withThemeVars("clasico-minimal")],
};

export const OutlinePillContrastTheme: Story = {
	args: {
		eventDate: "2026-09-12",
		variant: "outline-pill",
	},
	decorators: [withThemeVars("clasico-minimal")],
};

export const ProgressBarContrastTheme: Story = {
	args: {
		createdAt: "2026-07-28T00:00:00.000Z",
		eventDate: "2026-09-12",
		variant: "progress-bar",
	},
	decorators: [withThemeVars("clasico-minimal")],
};
