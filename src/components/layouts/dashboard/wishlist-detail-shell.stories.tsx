import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DEMO_WISHLIST } from "@/config/demo-wishlist";
import { TRPCReactProvider } from "@/trpc/react";
import { WishlistSectionTabs } from "./wishlist-section-tabs";
import { WishlistStatusStrip } from "./wishlist-status-strip";
import { WishlistTitleBlock } from "./wishlist-title-block";
import { WishlistTopbar } from "./wishlist-topbar";

const WISHLIST_ID = "demo-wishlist";
const PUBLIC_URL_PATH = `/w/${DEMO_WISHLIST.slug}`;

const READY_READINESS = {
	ready: true,
	checks: {
		title: true,
		eventType: true,
		slug: true,
		language: true,
		currency: true,
		visibleGift: true,
		images: true,
	},
};

const PARTIAL_READINESS = {
	ready: false,
	checks: {
		...READY_READINESS.checks,
		visibleGift: false,
		images: false,
	},
};

function pathnameFor(segment: string) {
	const base = `/dashboard/wishlists/${WISHLIST_ID}`;
	return segment ? `${base}/${segment}` : base;
}

function DashboardWishlistShell({
	status,
	readiness,
}: {
	status: string;
	readiness: typeof READY_READINESS;
}) {
	return (
		<div className="flex min-h-0 flex-1 flex-col">
			<WishlistTopbar
				isOwner
				publicUrlPath={PUBLIC_URL_PATH}
				status={status}
				title={DEMO_WISHLIST.title}
				wishlistId={WISHLIST_ID}
			/>
			<WishlistStatusStrip
				eventType={DEMO_WISHLIST.eventType}
				isOwner
				publicUrlPath={PUBLIC_URL_PATH}
				readiness={readiness}
				status={status}
				totalViews={128}
				wishlistId={WISHLIST_ID}
			/>
			<WishlistTitleBlock title={DEMO_WISHLIST.title} />
			<WishlistSectionTabs
				badges={{
					gifts: { count: 4 },
					guests: { count: 3, variant: "warning" },
				}}
				isOwner
				wishlistId={WISHLIST_ID}
			/>
			<div className="min-h-0 flex-1 overflow-y-auto p-7 text-muted-foreground text-sm">
				(contenido de la sección)
			</div>
		</div>
	);
}

const meta = {
	decorators: [
		(Story) => (
			<TRPCReactProvider>
				<TooltipProvider>
					<div className="min-h-[600px] bg-background">
						<Story />
					</div>
				</TooltipProvider>
			</TRPCReactProvider>
		),
	],
	parameters: {
		layout: "fullscreen",
		nextjs: { navigation: { pathname: pathnameFor("") } },
	},
	title: "Layouts/Dashboard/Wishlist Detail Shell",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Published: Story = {
	render: () => (
		<DashboardWishlistShell readiness={READY_READINESS} status="published" />
	),
};

export const Draft: Story = {
	parameters: {
		nextjs: { navigation: { pathname: pathnameFor("gifts") } },
	},
	render: () => (
		<DashboardWishlistShell readiness={PARTIAL_READINESS} status="draft" />
	),
};

export const Archived: Story = {
	parameters: {
		nextjs: { navigation: { pathname: pathnameFor("design") } },
	},
	render: () => (
		<DashboardWishlistShell readiness={READY_READINESS} status="archived" />
	),
};
