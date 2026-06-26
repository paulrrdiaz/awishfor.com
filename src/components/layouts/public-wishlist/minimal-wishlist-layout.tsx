import { Countdown } from "@/components/features/wishlist/countdown";
import { GiftList } from "@/components/features/wishlist/gift-list";
import { HowItWorks } from "@/components/features/wishlist/how-it-works";
import { WishlistFooter } from "@/components/features/wishlist/wishlist-footer";
import { WishlistHero } from "@/components/features/wishlist/wishlist-hero";
import type { PublicLayoutPreset } from "@/config/public-layouts";
import type { PublicWishlistViewModel } from "@/server/mappers/view-models";

type Props = {
	wishlist: PublicWishlistViewModel;
	layout: PublicLayoutPreset;
	mode: "full" | "preview" | "compact";
};

export function MinimalWishlistLayout({ wishlist, layout, mode }: Props) {
	const isCompact = mode === "compact";
	const actionsEnabled = mode === "full";

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

			<section className="mx-auto w-full max-w-2xl px-6 py-10">
				<GiftList
					actionsEnabled={actionsEnabled}
					giftCardStyle={layout.giftCardStyle}
					gifts={wishlist.gifts}
				/>
			</section>

			{!isCompact && <HowItWorks showHowItWorks={wishlist.showHowItWorks} />}

			{!isCompact && (
				<WishlistFooter thankYouMessage={wishlist.thankYouMessage} />
			)}
		</div>
	);
}
