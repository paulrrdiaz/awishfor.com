import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { sampleWishlist } from "./story-data";
import { WishlistHero } from "./wishlist-hero";

const meta = {
	component: WishlistHero,
	title: "Shared/WishlistHero",
} satisfies Meta<typeof WishlistHero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		wishlist: sampleWishlist,
	},
};
