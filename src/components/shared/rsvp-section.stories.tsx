import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TRPCReactProvider } from "@/trpc/react";
import { RsvpSection } from "./rsvp-section";
import { sampleWishlist } from "./story-data";
import { withThemeVars } from "./theme-story-decorator";

const meta = {
	component: RsvpSection,
	title: "Shared/RsvpSection",
	decorators: [
		(Story) => (
			<TRPCReactProvider>
				<Story />
			</TRPCReactProvider>
		),
		withThemeVars("cielo-suave-rosa"),
	],
	args: {
		wishlistSlug: "lista-de-boda",
		eventTitle: sampleWishlist.title,
		eventDescription: "Una tarde para celebrar juntos.",
		inviteUrl: "https://awishfor.com/w/lista-de-boda/lady-castillo",
		rsvpDeadline: "2026-08-08",
		eventDate: sampleWishlist.eventDate,
		eventTime: sampleWishlist.eventTime,
		eventLocation: sampleWishlist.eventLocation,
	},
} satisfies Meta<typeof RsvpSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PendingWithCompanions: Story = {
	args: {
		guest: {
			slug: "lady-castillo",
			primaryName: "Lady Castillo",
			status: "pending",
			extraGuests: [{ id: "g1", name: "Carlos", status: "pending" }],
		},
	},
};

export const PendingWithoutCompanions: Story = {
	args: {
		guest: {
			slug: "lady-castillo",
			primaryName: "Lady Castillo",
			status: "pending",
			extraGuests: [],
		},
	},
};

export const PrimaryDeclined: Story = {
	args: {
		guest: {
			slug: "lady-castillo",
			primaryName: "Lady Castillo",
			status: "declined",
			extraGuests: [{ id: "g1", name: "Carlos", status: "declined" }],
		},
	},
};

export const UnnamedCompanions: Story = {
	args: {
		guest: {
			slug: "lady-castillo",
			primaryName: "Lady Castillo",
			status: "pending",
			extraGuests: [
				{ id: "g1", name: null, status: "pending" },
				{ id: "g2", name: null, status: "pending" },
			],
		},
	},
};

export const ConfirmedSummary: Story = {
	args: {
		guest: {
			slug: "lady-castillo",
			primaryName: "Lady Castillo",
			status: "confirmed",
			extraGuests: [{ id: "g1", name: "Carlos", status: "confirmed" }],
		},
	},
};

export const PostEventReadOnly: Story = {
	args: {
		guest: {
			slug: "lady-castillo",
			primaryName: "Lady Castillo",
			status: "confirmed",
			extraGuests: [{ id: "g1", name: "Carlos", status: "confirmed" }],
		},
		eventDate: "2020-01-01",
	},
};
