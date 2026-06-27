import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { GiftGrid } from "./gift-grid";
import { sampleGifts } from "./story-data";

const meta = {
	component: GiftGrid,
	title: "Shared/GiftGrid",
} satisfies Meta<typeof GiftGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ThreeColumns: Story = {
	args: {
		gifts: sampleGifts,
		giftColumns: 3,
		giftCardStyle: "card",
	},
};
