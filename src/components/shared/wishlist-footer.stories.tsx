import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { WishlistFooter } from "./wishlist-footer";

const meta = {
	component: WishlistFooter,
	parameters: {
		layout: "fullscreen",
	},
	title: "Shared/WishlistFooter",
} satisfies Meta<typeof WishlistFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Expanded: Story = {
	args: {
		variant: "expanded",
	},
};

export const Compact: Story = {
	args: {
		variant: "compact",
		wishlistSlug: "esperando-a-mateo",
	},
};
