import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TRPCReactProvider } from "@/trpc/react";
import { GuestWelcomeSection } from "./guest-welcome-section";

const meta = {
	component: GuestWelcomeSection,
	title: "Shared/GuestWelcomeSection",
	decorators: [
		(Story) => (
			<TRPCReactProvider>
				<Story />
			</TRPCReactProvider>
		),
	],
} satisfies Meta<typeof GuestWelcomeSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NamedCompanions: Story = {
	args: {
		wishlistSlug: "lista-de-boda",
		guest: {
			slug: "pedro-castillo",
			primaryName: "Pedro Castillo",
			extraGuests: [{ name: "Ana Castillo" }, { name: "Luis Castillo" }],
			status: "pending",
		},
	},
};

export const UnnamedCompanions: Story = {
	args: {
		wishlistSlug: "lista-de-boda",
		guest: {
			slug: "pedro-castillo",
			primaryName: "Pedro Castillo",
			extraGuests: [{ name: null }, { name: null }],
			status: "pending",
		},
	},
};

export const NoCompanions: Story = {
	args: {
		wishlistSlug: "lista-de-boda",
		guest: {
			slug: "pedro-castillo",
			primaryName: "Pedro Castillo",
			extraGuests: [],
			status: "pending",
		},
	},
};

export const Confirmed: Story = {
	args: {
		wishlistSlug: "lista-de-boda",
		guest: {
			slug: "pedro-castillo",
			primaryName: "Pedro Castillo",
			extraGuests: [],
			status: "confirmed",
		},
	},
};

export const Declined: Story = {
	args: {
		wishlistSlug: "lista-de-boda",
		guest: {
			slug: "pedro-castillo",
			primaryName: "Pedro Castillo",
			extraGuests: [],
			status: "declined",
		},
	},
};

export const OnPhoto: Story = {
	args: {
		wishlistSlug: "lista-de-boda",
		guest: {
			slug: "pedro-castillo",
			primaryName: "Pedro Castillo",
			extraGuests: [{ name: "Ana Castillo" }, { name: "Luis Castillo" }],
			status: "pending",
		},
		tone: "on-photo",
	},
	parameters: {
		backgrounds: { default: "dark" },
	},
	render: (args) => (
		<div className="rounded-lg bg-black p-8">
			<GuestWelcomeSection {...args} />
		</div>
	),
};
