import { Countdown } from "@/components/features/wishlist/countdown";
import { GiftGrid } from "@/components/features/wishlist/gift-grid";
import { HowItWorks } from "@/components/features/wishlist/how-it-works";
import { ProgressSummary } from "@/components/features/wishlist/progress-summary";
import { PublicGiftFilters } from "@/components/features/wishlist/public-filters";
import { WishlistFooter } from "@/components/features/wishlist/wishlist-footer";
import { WishlistHero } from "@/components/features/wishlist/wishlist-hero";
import type { PublicLayoutPreset } from "@/config/public-layouts";
import { sortGifts } from "@/lib/wishlist/gift-filters";
import type { PublicWishlistViewModel } from "@/server/mappers/view-models";

type Props = {
	wishlist: PublicWishlistViewModel;
	layout: PublicLayoutPreset;
	mode: "full" | "preview" | "compact";
};

export function GridWishlistLayout({ wishlist, layout, mode }: Props) {
	const isCompact = mode === "compact";
	const isFull = mode === "full";

	return (
		<div className="flex flex-col">
			<WishlistHero
				wishlist={{
					...wishlist,
					eventDate: isCompact ? null : wishlist.eventDate,
					eventTime: isCompact ? null : wishlist.eventTime,
					eventLocation: isCompact ? null : wishlist.eventLocation,
				}}
			/>

			{!isCompact && wishlist.eventDate && (
				<Countdown eventDate={wishlist.eventDate} />
			)}

			{!isCompact && wishlist.welcomeMessage && (
				<div
					className="mx-auto max-w-2xl px-6 py-6 text-center text-base leading-relaxed"
					style={{ color: "var(--public-text)" }}
				>
					{wishlist.welcomeMessage}
				</div>
			)}

			<section className="mx-auto w-full max-w-6xl px-6 py-10">
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

			{!isCompact && <HowItWorks showHowItWorks={wishlist.showHowItWorks} />}

			{!isCompact && (
				<WishlistFooter thankYouMessage={wishlist.thankYouMessage} />
			)}
		</div>
	);
}
