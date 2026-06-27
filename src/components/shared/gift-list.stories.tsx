import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { GiftList } from "./gift-list";
import { sampleGifts } from "./story-data";

const meta = {
	component: GiftList,
	title: "Shared/GiftList",
} satisfies Meta<typeof GiftList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		gifts: sampleGifts,
		giftCardStyle: "row",
	},
};
