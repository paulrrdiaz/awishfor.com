import type { ReactNode } from "react";
import { PublicGiftFilters } from "@/components/features/wishlist/public-filters";
import type { PublicWishlistMode } from "@/components/layouts/public-wishlist/public-wishlist-page";
import { Countdown } from "@/components/shared/countdown";
import { EventDetails } from "@/components/shared/event-details";
import { GiftGrid } from "@/components/shared/gift-grid";
import { GiftSection } from "@/components/shared/gift-section";
import { HeroCtas } from "@/components/shared/hero-ctas";
import { MotifDivider } from "@/components/shared/motif/motif-divider";
import { ProgressSummary } from "@/components/shared/progress-summary";
import { WishlistMessage } from "@/components/shared/wishlist-message";
import { WishlistThankYou } from "@/components/shared/wishlist-thank-you";
import {
	resolveMotif,
	resolveMotifPalette,
	resolveMotifTreatment,
} from "@/config/motifs";
import type { PublicLayoutPreset } from "@/config/public-layouts";
import { composeDelivery } from "@/lib/format/delivery";
import { sortGifts } from "@/lib/wishlist/gift-filters";
import type { PublicWishlistViewModel } from "@/server/mappers/view-models";

type Props = {
	wishlist: PublicWishlistViewModel;
	layout: PublicLayoutPreset;
	mode: PublicWishlistMode;
	maxWidth?: string;
	rsvpSection?: ReactNode;
};

/**
 * Everything below the bespoke per-layout hero: event details, countdown,
 * welcome message, gift section, and thank-you message. Identical across
 * every layout variant so only the hero composition needs to differ.
 */
export function PublicWishlistBody({
	wishlist,
	layout,
	mode,
	maxWidth = "max-w-4xl",
	rsvpSection,
}: Props) {
	const isCompact = mode === "compact";
	const isFull = mode === "full";
	const motif = resolveMotif(wishlist.motifId);
	const motifTreatment = resolveMotifTreatment(wishlist.motifTreatment);
	const motifPalette = resolveMotifPalette(wishlist.motifPalette);
	const delivery = composeDelivery(
		wishlist.deliveryRecipientName,
		wishlist.deliveryAddress,
		wishlist.deliveryPhone,
		wishlist.deliveryDocumentId,
	);

	return (
		<>
			{!isCompact && <EventDetails wishlist={wishlist} />}

			{!isCompact && wishlist.eventDate && (
				<Countdown
					createdAt={wishlist.createdAt}
					eventDate={wishlist.eventDate}
					variant={wishlist.countdownVariant}
				/>
			)}

			{!isCompact && motif && (
				<MotifDivider
					motif={motif}
					palette={motifPalette}
					treatment={motifTreatment}
				/>
			)}

			{!isCompact && (
				<WishlistMessage
					attribution={wishlist.welcomeMessageAttribution}
					message={wishlist.welcomeMessage}
					variant={wishlist.welcomeMessageVariant}
				/>
			)}

			{!isCompact && (
				<div className="mx-auto w-full max-w-4xl px-6 pb-10 text-center">
					<HeroCtas showHowItWorks={wishlist.showHowItWorks} />
				</div>
			)}

			{rsvpSection}

			<GiftSection
				className="relative left-1/2 w-screen -translate-x-1/2"
				delivery={delivery}
				deliveryContentClassName={`mx-auto w-full ${maxWidth} px-6`}
				giftListMessage={wishlist.giftListMessage}
				giftListMessageContentClassName={`mx-auto w-full ${maxWidth} px-6 pt-6`}
			>
				<section
					className={`mx-auto w-full ${maxWidth} px-6 py-12`}
					id="regalos"
				>
					{isFull && <ProgressSummary progress={wishlist.progress} />}
					{isFull ? (
						<PublicGiftFilters
							actionsEnabled
							categories={wishlist.categories}
							delivery={delivery}
							gifts={wishlist.gifts}
							layout={layout}
							motif={motif}
							motifTreatment={motifTreatment}
						/>
					) : (
						<GiftGrid
							actionsEnabled={false}
							giftCardStyle={layout.giftCardStyle}
							giftColumns={layout.giftColumns}
							gifts={sortGifts(wishlist.gifts, "recommended")}
							motif={motif}
							motifTreatment={motifTreatment}
						/>
					)}
				</section>
			</GiftSection>

			{!isCompact && (
				<WishlistThankYou
					attribution={wishlist.welcomeMessageAttribution}
					contributors={wishlist.contributors}
					message={wishlist.thankYouMessage}
					variant={wishlist.thankYouMessageVariant}
				/>
			)}
		</>
	);
}
