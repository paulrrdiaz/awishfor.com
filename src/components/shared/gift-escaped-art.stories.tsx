import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { GiftEscapedArt } from "./gift-escaped-art";

const meta = {
	component: GiftEscapedArt,
	title: "Shared/GiftEscapedArt",
} satisfies Meta<typeof GiftEscapedArt>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Public: Story = {
	args: {
		variant: "public",
		fillColor: "#4D8FCF",
		ribbonColor: "#ffffff",
		confettiColors: ["#4D8FCF", "#F4C84A", "#6D4C12"],
	},
};

export const Marketing: Story = {
	args: {
		variant: "marketing",
		fillColor: "#BCE25A",
		ribbonColor: "#ffffff",
		confettiColors: ["#BCE25A", "#F4C84A", "#56A86B"],
	},
};

export const Dashboard: Story = {
	args: {
		variant: "public",
		size: "sm",
	},
};
