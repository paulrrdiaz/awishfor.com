import type { ReactNode } from "react";
import { PublicGiftFilters } from "@/components/features/wishlist/public-filters";
import { Countdown } from "@/components/shared/countdown";
import { EventDetails } from "@/components/shared/event-details";
import { GiftSection } from "@/components/shared/gift-section";
import { HeroCtas } from "@/components/shared/hero-ctas";
import {
	HeroCarouselGallery,
	HeroImageSlot,
} from "@/components/shared/hero-gallery";
import { MotifDivider } from "@/components/shared/motif/motif-divider";
import { MotifMarginScatter } from "@/components/shared/motif/motif-margin-scatter";
import { MotifScatter } from "@/components/shared/motif/motif-scatter";
import { MotifSeal } from "@/components/shared/motif/motif-seal";
import { MotifTiltSection } from "@/components/shared/motif/motif-tilt-region";
import { ProgressSummary } from "@/components/shared/progress-summary";
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

export function ArchTrioLayout({
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

	return (
		<PublicLayoutShell heading={heading} mode={mode}>
			<MotifTiltSection
				className={cn(
					"relative overflow-hidden bg-gradient-to-b from-accent via-accent/60 to-background",
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
				<div className="relative mx-auto flex w-full max-w-[1160px] flex-col gap-8 px-6 py-10 sm:px-10 lg:min-h-[420px] lg:flex-row lg:gap-12">
					<div className="relative h-[255px] w-full shrink-0 sm:mx-auto sm:h-[300px] sm:w-[360px] lg:mx-0 lg:h-[360px] lg:w-[460px]">
						<HeroCarouselGallery
							alt={`${heading} 1`}
							className="absolute left-0 z-[2] size-[60vw] overflow-hidden rounded-full border-[3px] border-white shadow-[0_16px_40px_rgba(80,30,60,.18)] sm:top-4 sm:top-4.5 sm:left-0 sm:size-[250px] sm:border-[5px] lg:size-[320px]"
							controlsVariant="compact"
							images={carouselImages}
							priority={!isCompact}
							sizes="(min-width: 1024px) 320px, (min-width: 640px) 250px, 205px"
						/>
						<HeroImageSlot
							alt={`${heading} 2`}
							className="absolute right-0 bottom-0 z-[1] size-[38vw] rounded-full border-[3px] border-card shadow-[0_12px_30px_rgba(80,30,60,.15)] sm:-right-0.5 sm:-right-6 sm:size-[150px] sm:border-[5px] lg:size-[200px]"
							isSample={staticSlots[0]?.isSample}
							sizes="(min-width: 1024px) 200px, (min-width: 640px) 150px, 125px"
							src={staticSlots[0]?.url ?? null}
						/>
						<HeroImageSlot
							alt={`${heading} 3`}
							className="absolute -top-3.5 right-8 z-[3] size-[30vw] rounded-full border-[3px] border-card shadow-[0_10px_24px_rgba(80,30,60,.14)] sm:-top-4 sm:right-4.5 sm:right-6 sm:size-[120px] sm:border-[5px] lg:size-[160px]"
							isSample={staticSlots[1]?.isSample}
							sizes="(min-width: 1024px) 160px, (min-width: 640px) 120px, 100px"
							src={staticSlots[1]?.url ?? null}
						/>
					</div>
					<div className="relative flex flex-col justify-center gap-4 text-center lg:text-left">
						{motif && (
							<MotifSeal
								className="lg:mx-0"
								motif={motif}
								treatment={motifTreatment}
							/>
						)}
						<p className="font-mono text-muted-foreground text-xs uppercase tracking-[0.2em]">
							{eventLabel}
						</p>
						<h1 className="font-heading font-semibold text-5xl leading-none sm:text-7xl">
							{heading}
						</h1>
						{wishlist.subtitle && (
							<p className="max-w-2xl text-muted-foreground text-sm leading-relaxed sm:text-base">
								{wishlist.subtitle}
							</p>
						)}
					</div>
				</div>
			</MotifTiltSection>

			{!isCompact && (
				<>
					<div className="flex flex-col gap-8 px-5 py-5 lg:flex-row lg:items-center lg:gap-16 lg:px-4">
						<div className="order-2 flex min-w-0 flex-col gap-4 lg:order-1 lg:w-96 lg:shrink-0">
							<EventDetails
								size="md"
								stacked
								variant="compact"
								wishlist={wishlist}
							/>
							{!isCompact && (
								<HeroCtas
									className="w-full"
									showHowItWorks={wishlist.showHowItWorks}
								/>
							)}
						</div>
						<div className="order-1 min-w-0 flex-1 space-y-4 lg:order-2">
							<WishlistMessage
								attribution={wishlist.welcomeMessageAttribution}
								className="border-b-0 px-0 pb-0 sm:px-0 sm:pb-0"
								message={wishlist.welcomeMessage}
								variant={wishlist.welcomeMessageVariant}
							/>
							{wishlist.eventDate && (
								<Countdown
									createdAt={wishlist.createdAt}
									eventDate={wishlist.eventDate}
									variant={wishlist.countdownVariant}
								/>
							)}
						</div>
					</div>
					{motif && (
						<MotifDivider
							motif={motif}
							palette={motifPalette}
							treatment={motifTreatment}
						/>
					)}
					<div className="mx-5 h-px bg-border sm:mx-7" />
				</>
			)}

			{rsvpSection}

			<div
				className={cn(
					"relative",
					isEmbedded ? "w-full" : "left-1/2 w-screen -translate-x-1/2",
				)}
			>
				{motif && (
					<MotifMarginScatter
						motif={motif}
						palette={motifPalette}
						treatment={motifTreatment}
					/>
				)}

				<GiftSection
					className={cn(
						"relative",
						isEmbedded ? "w-full" : "left-1/2 w-screen -translate-x-1/2",
					)}
					delivery={delivery}
					deliveryContentClassName="mx-auto w-full max-w-[1160px] px-5 sm:px-7"
				>
					<section
						className="mx-auto w-full max-w-[1160px] scroll-mt-[59px] px-5 pt-6 pb-16 sm:px-7"
						id="regalos"
					>
						<div className="mb-3 flex flex-wrap items-center justify-between gap-2">
							<h2 className="font-heading font-semibold text-xl">
								Lista de regalos
							</h2>
							<ProgressSummary progress={wishlist.progress} variant="inline" />
						</div>
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
				</GiftSection>
			</div>

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
