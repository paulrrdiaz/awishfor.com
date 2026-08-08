import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { sampleContributors, sampleSignature } from "./story-data";
import { withThemeVars } from "./theme-story-decorator";
import { WishlistThankYou } from "./wishlist-thank-you";

const meta = {
	component: WishlistThankYou,
	title: "Shared/WishlistThankYou",
} satisfies Meta<typeof WishlistThankYou>;

export default meta;
type Story = StoryObj<typeof meta>;

const message = "¡Gracias por tu cariño y por celebrar con nosotros!";

export const Spotlight: Story = {
	args: {
		attribution: sampleSignature,
		message,
		variant: "spotlight",
	},
	decorators: [withThemeVars("cielo-suave")],
};

export const Handwritten: Story = {
	args: {
		attribution: sampleSignature,
		message,
		variant: "handwritten",
	},
	decorators: [withThemeVars("cielo-suave")],
};

export const HandwrittenNoSignature: Story = {
	args: {
		message,
		variant: "handwritten",
	},
	decorators: [withThemeVars("cielo-suave")],
};

export const SocialProof: Story = {
	args: {
		attribution: sampleSignature,
		contributors: sampleContributors,
		message,
		variant: "social-proof",
	},
	decorators: [withThemeVars("cielo-suave")],
};

export const SocialProofNoContributors: Story = {
	args: {
		attribution: sampleSignature,
		contributors: { count: 0, initials: [] },
		message,
		variant: "social-proof",
	},
	decorators: [withThemeVars("cielo-suave")],
};

export const SpotlightContrastTheme: Story = {
	args: {
		attribution: sampleSignature,
		message,
		variant: "spotlight",
	},
	decorators: [withThemeVars("clasico-minimal")],
};

export const HandwrittenContrastTheme: Story = {
	args: {
		attribution: sampleSignature,
		message,
		variant: "handwritten",
	},
	decorators: [withThemeVars("clasico-minimal")],
};

export const SocialProofContrastTheme: Story = {
	args: {
		attribution: sampleSignature,
		contributors: sampleContributors,
		message,
		variant: "social-proof",
	},
	decorators: [withThemeVars("clasico-minimal")],
};
