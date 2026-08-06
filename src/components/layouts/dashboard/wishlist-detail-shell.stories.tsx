import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DEMO_WISHLIST } from "@/config/demo-wishlist";
import { TRPCReactProvider } from "@/trpc/react";
import { WishlistSectionRail } from "./wishlist-section-rail";
import { WishlistTitleBlock } from "./wishlist-title-block";
import { WishlistTopbar } from "./wishlist-topbar";

const WISHLIST_ID = "demo-wishlist";
const PUBLIC_URL_PATH = `/w/${DEMO_WISHLIST.slug}`;

function pathnameFor(segment: string) {
	const base = `/dashboard/wishlists/${WISHLIST_ID}`;
	return segment ? `${base}/${segment}` : base;
}

function DashboardWishlistShell({ status }: { status: string }) {
	return (
		<div className="flex min-h-0 flex-1 flex-col">
			<WishlistTopbar
				publicUrlPath={PUBLIC_URL_PATH}
				status={status}
				title={DEMO_WISHLIST.title}
				wishlistId={WISHLIST_ID}
			/>
			<div className="flex min-h-0 flex-1 flex-col md:flex-row">
				<WishlistSectionRail wishlistId={WISHLIST_ID} />
				<div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
					<WishlistTitleBlock
						publicUrlPath={PUBLIC_URL_PATH}
						slug={DEMO_WISHLIST.slug}
						title={DEMO_WISHLIST.title}
					/>
					<div className="px-7 pb-7 text-muted-foreground text-sm">
						(contenido de la sección)
					</div>
				</div>
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
	render: () => <DashboardWishlistShell status="published" />,
};

export const Draft: Story = {
	parameters: {
		nextjs: { navigation: { pathname: pathnameFor("gifts") } },
	},
	render: () => <DashboardWishlistShell status="draft" />,
};

export const Archived: Story = {
	parameters: {
		nextjs: { navigation: { pathname: pathnameFor("design") } },
	},
	render: () => <DashboardWishlistShell status="archived" />,
};
