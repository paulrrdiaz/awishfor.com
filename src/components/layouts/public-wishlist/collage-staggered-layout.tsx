import type { ReactNode } from "react";
import { PublicGiftFilters } from "@/components/features/wishlist/public-filters";
import { Countdown } from "@/components/shared/countdown";
import { DeliveryCard } from "@/components/shared/delivery-card";
import { EventDetails } from "@/components/shared/event-details";
import { GiftListBand } from "@/components/shared/gift-list-band";
import { HeroCtas } from "@/components/shared/hero-ctas";
import {
	HeroCarouselGallery,
	HeroImageSlot,
} from "@/components/shared/hero-gallery";
import { MotifDivider } from "@/components/shared/motif/motif-divider";
import { MotifScatter } from "@/components/shared/motif/motif-scatter";
import { MotifSeal } from "@/components/shared/motif/motif-seal";
import { MotifTiltSection } from "@/components/shared/motif/motif-tilt-region";
import { WishlistMessage } from "@/components/shared/wishlist-message";
import { WishlistThankYou } from "@/components/shared/wishlist-thank-you";
import { EVENT_TYPE_PRESETS } from "@/config/event-type-presets";
import {
	resolveMotif,
	resolveMotifPalette,
	resolveMotifTreatment,
} from "@/config/motifs";
import type { PublicLayoutPreset } from "@/config/public-layouts";
import type { EventType } from "@/generated/prisma/enums";
import { formatEventDate } from "@/lib/format/dates";
import { composeDelivery } from "@/lib/format/delivery";
import { partitionHeroImages } from "@/lib/hero-slots";
import { cn } from "@/lib/utils";
import type { PublicWishlistViewModel } from "@/server/mappers/view-models";
import { PublicLayoutShell } from "./public-layout-shell";
import type {
	PublicWishlistMode,
	PublicWishlistSurface,
} from "./public-wishlist-page";

type Props = {
	wishlist: PublicWishlistViewModel;
	layout: PublicLayoutPreset;
	mode: PublicWishlistMode;
	surface?: PublicWishlistSurface;
	rsvpSection?: ReactNode;
};

export function CollageStaggeredLayout({
	wishlist,
	layout,
	mode,
	surface = "standalone",
	rsvpSection,
}: Props) {
	const isCompact = mode === "compact";
	// An embedded preview (wizard steps, dashboard editor) is bounded by its
	// host pane, not the real viewport — breaking out to `w-screen` there
	// overflows the pane instead of the page, and gets clipped by whatever
	// `overflow-x-hidden` ancestor is scrolling it.
	const isEmbedded = surface === "embedded";
	const heading = wishlist.title;
	const eventLabel =
		EVENT_TYPE_PRESETS[wishlist.eventType as EventType]?.label ??
		wishlist.eventType;
	const { carouselImages, staticSlots } = partitionHeroImages(
		wishlist.images,
		2,
	);
	const motif = resolveMotif(wishlist.motifId);
	const motifTreatment = resolveMotifTreatment(wishlist.motifTreatment);
	const motifPalette = resolveMotifPalette(wishlist.motifPalette);
	const delivery = composeDelivery(
		wishlist.deliveryRecipientName,
		wishlist.deliveryAddress,
		wishlist.deliveryPhone,
		wishlist.deliveryDocumentId,
	);
	const eventSummary = wishlist.eventDate
		? formatEventDate(wishlist.eventDate, wishlist.language as "es" | "en")
		: null;

	return (
		<PublicLayoutShell heading={heading} mode={mode}>
			<MotifTiltSection
				className={cn(
					"relative bg-[linear-gradient(180deg,var(--accent)_0%,var(--card)_30%,var(--background)_72%,var(--background)_100%)]",
					isEmbedded ? "w-full" : "left-1/2 w-screen -translate-x-1/2",
				)}
			>
				{motif && (
					<MotifScatter
						motif={motif}
						palette={motifPalette}
						treatment={motifTreatment}
					/>
				)}
				<div className="mx-auto w-full max-w-[1160px] pt-9 text-center">
					{motif && <MotifSeal motif={motif} treatment={motifTreatment} />}
					<p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.18em]">
						{eventLabel}
					</p>
					<h1 className="mt-2 px-5 font-heading font-semibold text-[34px] leading-[1.1] sm:text-[42px]">
						{heading}
					</h1>
					{wishlist.subtitle && (
						<p className="mx-auto mt-2 max-w-2xl px-5 text-muted-foreground text-sm leading-relaxed">
							{wishlist.subtitle}
						</p>
					)}
					{eventSummary && (
						<p className="mt-1.5 px-5 text-[13px] text-muted-foreground">
							{eventSummary}
						</p>
					)}
					<div className="relative mt-5 grid grid-cols-[1fr_1.15fr_1fr] items-end gap-3 px-4 pb-[58px] sm:px-7">
						<HeroImageSlot
							alt={`${heading} 1`}
							className="mt-11 h-[180px] rounded-xl shadow-[0_12px_32px_rgba(30,50,80,.10)]"
							isSample={staticSlots[0]?.isSample}
							priority={!isCompact}
							sizes="33vw"
							src={staticSlots[0]?.url ?? null}
						/>
						<HeroCarouselGallery
							alt={`${heading} destacada`}
							className="h-[253px] overflow-hidden rounded-xl shadow-[0_18px_44px_rgba(30,50,80,.13)]"
							controlsVariant="compact"
							images={carouselImages}
							priority={false}
							sizes="(min-width: 768px) 360px, 42vw"
						/>
						<HeroImageSlot
							alt={`${heading} 3`}
							className="mt-11 h-[180px] rounded-xl shadow-[0_12px_32px_rgba(30,50,80,.10)]"
							isSample={staticSlots[1]?.isSample}
							sizes="33vw"
							src={staticSlots[1]?.url ?? null}
						/>
						{carouselImages[0] && (
							<div className="absolute bottom-[-20px] left-2 z-10 w-24 rotate-[-7deg] rounded-[2px] bg-white p-2 pb-3.5 shadow-[0_14px_30px_rgba(30,50,80,.22)] sm:w-[118px]">
								<HeroImageSlot
									alt={`${heading} recuerdo`}
									className="h-[96px] w-full"
									isSample={carouselImages[0].isSample}
									sizes="118px"
									src={carouselImages[0].url}
								/>
								<p className="mt-1.5 text-center font-heading text-[#333] text-[10px] italic">
									Un recuerdo especial 🤍
								</p>
							</div>
						)}
					</div>
				</div>
			</MotifTiltSection>

			{!isCompact && (
				<>
					<EventDetails
						className="px-5 py-5 sm:px-7"
						variant="compact"
						wishlist={wishlist}
					/>
					<DeliveryCard className="mx-5 mb-5" delivery={delivery} />
					{motif && (
						<MotifDivider
							motif={motif}
							palette={motifPalette}
							treatment={motifTreatment}
						/>
					)}
					{wishlist.eventDate && (
						<Countdown
							className="px-5 py-6 sm:px-7"
							createdAt={wishlist.createdAt}
							eventDate={wishlist.eventDate}
							variant={wishlist.countdownVariant}
						/>
					)}
					<WishlistMessage
						attribution={wishlist.welcomeMessageAttribution}
						message={wishlist.welcomeMessage}
						variant={wishlist.welcomeMessageVariant}
					/>
					<div className="px-5 pb-6 text-center sm:px-7">
						<HeroCtas
							className="gap-2.5"
							primaryClassName="px-[18px] py-2 text-[13px]"
							secondaryClassName="px-[18px] py-2 text-[13px] [border-color:var(--border)]! [border-width:1px]!"
							showHowItWorks={wishlist.showHowItWorks}
						/>
					</div>
				</>
			)}

			{rsvpSection}

			<GiftListBand
				className={cn(
					"relative",
					isEmbedded ? "w-full" : "left-1/2 w-screen -translate-x-1/2",
				)}
			>
				<section
					className="mx-auto w-full max-w-[1160px] scroll-mt-[59px] px-5 pt-[18px] pb-16 sm:px-[22px]"
					id="regalos"
				>
					<PublicGiftFilters
						actionsEnabled={mode === "full"}
						categories={wishlist.categories}
						compact
						delivery={delivery}
						gifts={wishlist.gifts}
						layout={layout}
						motif={motif}
						motifTreatment={motifTreatment}
						showCategories={false}
						showCounts={false}
						showGridToggle
						showSort={false}
					/>
				</section>
			</GiftListBand>

			{!isCompact && (
				<WishlistThankYou
					attribution={wishlist.welcomeMessageAttribution}
					contributors={wishlist.contributors}
					message={wishlist.thankYouMessage}
					variant={wishlist.thankYouMessageVariant}
				/>
			)}
		</PublicLayoutShell>
	);
}
