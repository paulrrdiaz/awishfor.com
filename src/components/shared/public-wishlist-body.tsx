import { PublicGiftFilters } from "@/components/features/wishlist/public-filters";
import type { PublicWishlistMode } from "@/components/layouts/public-wishlist/public-wishlist-page";
import { Countdown } from "@/components/shared/countdown";
import { EventDetails } from "@/components/shared/event-details";
import { GiftGrid } from "@/components/shared/gift-grid";
import { HowItWorks } from "@/components/shared/how-it-works";
import { ProgressSummary } from "@/components/shared/progress-summary";
import { WishlistFooter } from "@/components/shared/wishlist-footer";
import type { PublicLayoutPreset } from "@/config/public-layouts";
import { sortGifts } from "@/lib/wishlist/gift-filters";
import type { PublicWishlistViewModel } from "@/server/mappers/view-models";

type Props = {
	wishlist: PublicWishlistViewModel;
	layout: PublicLayoutPreset;
	mode: PublicWishlistMode;
	maxWidth?: string;
};

/**
 * Everything below the bespoke per-layout hero: event details, countdown,
 * welcome message, gift section, how-it-works, and footer. Identical across
 * every layout variant so only the hero composition needs to differ.
 */
export function PublicWishlistBody({
	wishlist,
	layout,
	mode,
	maxWidth = "max-w-4xl",
}: Props) {
	const isCompact = mode === "compact";
	const isFull = mode === "full";

	return (
		<>
			{!isCompact && <EventDetails wishlist={wishlist} />}

			{!isCompact && wishlist.eventDate && (
				<Countdown eventDate={wishlist.eventDate} />
			)}

			{!isCompact && wishlist.welcomeMessage && (
				<div className="mx-auto max-w-2xl px-6 py-6 text-center text-base leading-relaxed">
					{wishlist.welcomeMessage}
				</div>
			)}

			<section className={`mx-auto w-full ${maxWidth} px-6 py-10`} id="regalos">
				{isFull && <ProgressSummary progress={wishlist.progress} />}
				{isFull ? (
					<PublicGiftFilters
						actionsEnabled
						categories={wishlist.categories}
						gifts={wishlist.gifts}
						layout={layout}
					/>
				) : (
					<GiftGrid
						actionsEnabled={false}
						giftCardStyle={layout.giftCardStyle}
						giftColumns={layout.giftColumns}
						gifts={sortGifts(wishlist.gifts, "recommended")}
					/>
				)}
			</section>

			{!isCompact && (
				<div id="como-funciona">
					<HowItWorks showHowItWorks={wishlist.showHowItWorks} />
				</div>
			)}

			{!isCompact && (
				<WishlistFooter thankYouMessage={wishlist.thankYouMessage} />
			)}
		</>
	);
}
