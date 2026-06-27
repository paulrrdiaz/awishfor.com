import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { GiftCard } from "./gift-card";
import { sampleGift } from "./story-data";

const meta = {
	component: GiftCard,
	title: "Shared/GiftCard",
} satisfies Meta<typeof GiftCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Available: Story = {
	args: {
		gift: sampleGift,
		actionsEnabled: true,
	},
};

export const Partial: Story = {
	args: {
		gift: {
			...sampleGift,
			status: "partial",
			quantityNeeded: 3,
			remainingQuantity: 1,
		},
	},
};

export const Purchased: Story = {
	args: {
		gift: {
			...sampleGift,
			status: "purchased",
			remainingQuantity: 0,
		},
	},
};

export const Hidden: Story = {
	args: {
		gift: sampleGift,
		status: "hidden",
	},
};

export const Row: Story = {
	args: {
		gift: sampleGift,
		cardStyle: "row",
		actionsEnabled: true,
	},
};
