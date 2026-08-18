import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { composeDelivery } from "@/lib/format/delivery";
import { DeliveryCard } from "./delivery-card";
import { withThemeVars } from "./theme-story-decorator";

const meta = {
	component: DeliveryCard,
	title: "Shared/DeliveryCard",
} satisfies Meta<typeof DeliveryCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const decorator = withThemeVars("cielo-suave");

export const AllFields: Story = {
	args: {
		delivery: composeDelivery(
			"Familia Gómez",
			"Av. Las Acacias 245, Dpto. 302, San Isidro, Lima",
			"+51 999 888 777",
		),
	},
	decorators: [decorator],
};

export const AddressOnly: Story = {
	args: {
		delivery: composeDelivery(
			null,
			"Av. Las Acacias 245, Dpto. 302, San Isidro, Lima",
			null,
		),
	},
	decorators: [decorator],
};

export const AddressAndPhone: Story = {
	args: {
		delivery: composeDelivery(
			null,
			"Av. Las Acacias 245, Dpto. 302, San Isidro, Lima",
			"+51 999 888 777",
		),
	},
	decorators: [decorator],
};
