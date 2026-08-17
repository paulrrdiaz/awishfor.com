import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { composeDelivery } from "@/lib/format/delivery";
import { sampleSignature } from "./story-data";
import { withThemeVars } from "./theme-story-decorator";
import { WishlistMessage } from "./wishlist-message";

const meta = {
	component: WishlistMessage,
	title: "Shared/WishlistMessage",
} satisfies Meta<typeof WishlistMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

const message =
	"Gracias por acompañarnos en la llegada de Mateo. Aquí encontrarás algunas ideas para consentirlo.";

const fullDelivery = composeDelivery(
	"Familia Gómez",
	"Av. Las Acacias 245, Dpto. 302, San Isidro, Lima",
	"+51 999 888 777",
);
const partialDelivery = composeDelivery(
	null,
	"Av. Las Acacias 245, Dpto. 302, San Isidro, Lima",
	null,
);

export const Postcard: Story = {
	args: {
		attribution: sampleSignature,
		message,
		variant: "postcard",
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

export const Avatars: Story = {
	args: {
		attribution: sampleSignature,
		message,
		variant: "avatars",
	},
	decorators: [withThemeVars("cielo-suave")],
};

export const PostcardWithDelivery: Story = {
	args: {
		attribution: sampleSignature,
		delivery: fullDelivery,
		message,
		variant: "postcard",
	},
	decorators: [withThemeVars("cielo-suave")],
};

export const PostcardPartialDelivery: Story = {
	args: {
		attribution: sampleSignature,
		delivery: partialDelivery,
		message,
		variant: "postcard",
	},
	decorators: [withThemeVars("cielo-suave")],
};

export const HandwrittenWithDelivery: Story = {
	args: {
		attribution: sampleSignature,
		delivery: fullDelivery,
		message,
		variant: "handwritten",
	},
	decorators: [withThemeVars("cielo-suave")],
};

export const HandwrittenPartialDelivery: Story = {
	args: {
		attribution: sampleSignature,
		delivery: partialDelivery,
		message,
		variant: "handwritten",
	},
	decorators: [withThemeVars("cielo-suave")],
};

export const AvatarsWithDelivery: Story = {
	args: {
		attribution: sampleSignature,
		delivery: fullDelivery,
		message,
		variant: "avatars",
	},
	decorators: [withThemeVars("cielo-suave")],
};

export const AvatarsPartialDelivery: Story = {
	args: {
		attribution: sampleSignature,
		delivery: partialDelivery,
		message,
		variant: "avatars",
	},
	decorators: [withThemeVars("cielo-suave")],
};

export const PostcardContrastTheme: Story = {
	args: {
		attribution: sampleSignature,
		message,
		variant: "postcard",
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

export const AvatarsContrastTheme: Story = {
	args: {
		attribution: sampleSignature,
		message,
		variant: "avatars",
	},
	decorators: [withThemeVars("clasico-minimal")],
};
