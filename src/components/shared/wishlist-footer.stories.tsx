import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { WishlistFooter } from "./wishlist-footer";

const meta = {
	component: WishlistFooter,
	title: "Shared/WishlistFooter",
} satisfies Meta<typeof WishlistFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		thankYouMessage:
			"Gracias por acompañarnos y por hacer parte de esta llegada tan especial.",
	},
};
