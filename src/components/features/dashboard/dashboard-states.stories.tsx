import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { OverviewShare } from "@/components/features/dashboard/overview/overview-share";
import {
	PublishedSlugWarning,
	RestoreWishlistDialogContent,
} from "@/components/features/dashboard/settings/wishlist-settings-form";
import { WishlistCardGrid } from "@/components/features/dashboard/wishlist-card-grid";
import { WishlistDetailNavView } from "@/components/layouts/dashboard/wishlist-detail-nav";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const meta = {
	title: "Features/Dashboard/States",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const EmptyState: Story = {
	render: () => <WishlistCardGrid wishlists={[]} />,
};

export const TabsToSelectNav: Story = {
	render: () => (
		<WishlistDetailNavView
			activeSegment="settings"
			onSegmentChange={() => undefined}
			publicUrlPath="/w/esperando-a-mateo"
			slug="esperando-a-mateo"
			status="published"
			title="Esperando a Mateo"
			wishlistId="wishlist-1"
		/>
	),
};

export const SlugWarning: Story = {
	render: () => (
		<div className="max-w-xl rounded-2xl border bg-card p-4">
			<PublishedSlugWarning
				acknowledged={false}
				onAcknowledgedChange={() => undefined}
			/>
		</div>
	),
};

export const ShareCopySuccess: Story = {
	render: () => (
		<OverviewShare
			copyStateOverride="success"
			eventType="baby_shower"
			publicUrlPath="/w/emilia-baby-shower"
			slug="emilia-baby-shower"
		/>
	),
};

export const ShareCopyError: Story = {
	render: () => (
		<OverviewShare
			copyStateOverride="error"
			eventType="baby_shower"
			publicUrlPath="/w/emilia-baby-shower"
			slug="emilia-baby-shower"
		/>
	),
};

export const RestoreDialog: Story = {
	render: () => (
		<Dialog onOpenChange={() => undefined} open>
			<DialogContent>
				<RestoreWishlistDialogContent
					onRestoreDraft={() => undefined}
					onRestorePublished={() => undefined}
				/>
			</DialogContent>
		</Dialog>
	),
};
