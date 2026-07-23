import { PublicGiftFilters } from "@/components/features/wishlist/public-filters";
import { Countdown } from "@/components/shared/countdown";
import { EventDetails } from "@/components/shared/event-details";
import { GiftList } from "@/components/shared/gift-list";
import { GuestWelcomeSection } from "@/components/shared/guest-welcome-section";
import { HowItWorks } from "@/components/shared/how-it-works";
import { ProgressSummary } from "@/components/shared/progress-summary";
import { WishlistFooter } from "@/components/shared/wishlist-footer";
import { WishlistHero } from "@/components/shared/wishlist-hero";
import type { PublicLayoutPreset } from "@/config/public-layouts";
import { sortGifts } from "@/lib/wishlist/gift-filters";
import type { PublicWishlistViewModel } from "@/server/mappers/view-models";

type Props = {
	wishlist: PublicWishlistViewModel;
	layout: PublicLayoutPreset;
	mode: "full" | "preview" | "compact";
};

export function MinimalWishlistLayout({ wishlist, layout, mode }: Props) {
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

			<GuestWelcomeSection
				className="mx-auto max-w-2xl px-6 text-center"
				guest={wishlist.guest}
				wishlistSlug={wishlist.slug}
			/>

			{!isCompact && <EventDetails wishlist={wishlist} />}

			{!isCompact && wishlist.eventDate && (
				<Countdown eventDate={wishlist.eventDate} />
			)}

			{!isCompact && wishlist.welcomeMessage && (
				<div className="mx-auto max-w-2xl px-6 py-6 text-center text-base leading-relaxed">
					{wishlist.welcomeMessage}
				</div>
			)}

			<section className="mx-auto w-full max-w-2xl px-6 py-10">
				{isFull && <ProgressSummary progress={wishlist.progress} />}
				{isFull ? (
					<PublicGiftFilters
						actionsEnabled
						categories={wishlist.categories}
						gifts={wishlist.gifts}
						layout={layout}
					/>
				) : (
					<GiftList
						actionsEnabled={false}
						giftCardStyle={layout.giftCardStyle}
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
