import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SharePanel } from "./share-panel";

const meta = {
	component: SharePanel,
	title: "Shared/SharePanel",
} satisfies Meta<typeof SharePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		url: "https://awishfor.com/w/emilia",
		whatsAppUrl: "https://wa.me/?text=https%3A%2F%2Fawishfor.com%2Fw%2Femilia",
	},
};
