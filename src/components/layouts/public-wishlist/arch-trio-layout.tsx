"use client";

import { useRef } from "react";
import { PublicGiftFilters } from "@/components/features/wishlist/public-filters";
import { Countdown } from "@/components/shared/countdown";
import { EventDetails } from "@/components/shared/event-details";
import { GiftListBand } from "@/components/shared/gift-list-band";
import { HeroCtas } from "@/components/shared/hero-ctas";
import {
	HeroCarouselGallery,
	HeroImageSlot,
} from "@/components/shared/hero-gallery";
import { MotifDivider } from "@/components/shared/motif/motif-divider";
import { MotifMarginScatter } from "@/components/shared/motif/motif-margin-scatter";
import { MotifScatter } from "@/components/shared/motif/motif-scatter";
import { MotifSeal } from "@/components/shared/motif/motif-seal";
import { ProgressSummary } from "@/components/shared/progress-summary";
import { RsvpSection } from "@/components/shared/rsvp-section";
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
import { useMotifTilt } from "@/lib/gsap/use-motif-tilt";
import { resolveHeroSlots } from "@/lib/hero-slots";
import type { PublicWishlistViewModel } from "@/server/mappers/view-models";
import { PublicLayoutShell } from "./public-layout-shell";
import type { PublicWishlistMode } from "./public-wishlist-page";

type Props = {
	wishlist: PublicWishlistViewModel;
	layout: PublicLayoutPreset;
	mode: PublicWishlistMode;
};

export function ArchTrioLayout({ wishlist, layout, mode }: Props) {
	const isCompact = mode === "compact";
	const heading = wishlist.title;
	const eventLabel =
		EVENT_TYPE_PRESETS[wishlist.eventType as EventType]?.label ??
		wishlist.eventType;
	// The medium and small arcs (slots 1 and 2) are static; slot 0 is owned by
	// the carousel below and rendered from `wishlist.images` directly.
	const slots = resolveHeroSlots(wishlist.images, 3);
	const motif = resolveMotif(wishlist.motifId);
	const motifTreatment = resolveMotifTreatment(wishlist.motifTreatment);
	const motifPalette = resolveMotifPalette(wishlist.motifPalette);
	const delivery = composeDelivery(
		wishlist.deliveryRecipientName,
		wishlist.deliveryAddress,
		wishlist.deliveryPhone,
	);
	const heroRef = useRef<HTMLElement>(null);
	useMotifTilt(heroRef);

	return (
		<PublicLayoutShell heading={heading} mode={mode}>
			<section
				className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-gradient-to-b from-accent via-accent/60 to-background"
				ref={heroRef}
			>
				{motif && (
					<MotifScatter
						motif={motif}
						palette={motifPalette}
						treatment={motifTreatment}
					/>
				)}
				<div className="relative mx-auto flex w-full max-w-[1160px] flex-col gap-8 px-6 py-10 sm:px-10 lg:min-h-[420px] lg:flex-row lg:gap-12">
					<div className="relative mx-auto h-[220px] w-[260px] shrink-0 sm:h-[300px] sm:w-[360px] lg:mx-0 lg:h-[360px] lg:w-[460px]">
						<HeroCarouselGallery
							alt={`${heading} 1`}
							className="absolute top-4 left-0 z-[2] size-[180px] overflow-hidden rounded-full shadow-[0_16px_40px_rgba(80,30,60,.18)] sm:size-[250px] lg:size-[320px]"
							controlsVariant="compact"
							images={wishlist.images}
							priority={!isCompact}
							sizes="(min-width: 1024px) 320px, (min-width: 640px) 250px, 180px"
							startIndex={0}
						/>
						<HeroImageSlot
							alt={`${heading} 2`}
							className="absolute -right-4 bottom-0 z-[1] size-[110px] rounded-full border-[3px] border-card shadow-[0_12px_30px_rgba(80,30,60,.15)] sm:-right-6 sm:size-[150px] sm:border-[5px] lg:size-[200px]"
							isSample={slots[1]?.isSample}
							sizes="(min-width: 1024px) 200px, (min-width: 640px) 150px, 110px"
							src={slots[1]?.url ?? null}
						/>
						<HeroImageSlot
							alt={`${heading} 3`}
							className="absolute -top-3 right-4 z-[3] size-[90px] rounded-full border-[3px] border-card shadow-[0_10px_24px_rgba(80,30,60,.14)] sm:-top-4 sm:right-6 sm:size-[120px] sm:border-[5px] lg:size-[160px]"
							isSample={slots[2]?.isSample}
							sizes="(min-width: 1024px) 160px, (min-width: 640px) 120px, 90px"
							src={slots[2]?.url ?? null}
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
						<h1 className="font-heading font-semibold text-4xl leading-tight sm:text-5xl">
							{heading}
						</h1>
						{!isCompact && (
							<HeroCtas
								className="justify-center lg:justify-start"
								showHowItWorks={wishlist.showHowItWorks}
							/>
						)}
					</div>
				</div>
			</section>

			{!isCompact && (
				<>
					<div className="flex flex-col gap-8 px-5 py-5 sm:flex-row sm:items-center sm:gap-16 sm:px-4">
						<EventDetails
							className="flex-1 gap-4 sm:w-72 sm:grid-cols-1"
							size="md"
							variant="compact"
							wishlist={wishlist}
						/>
						<div>
							<WishlistMessage
								attribution={wishlist.welcomeMessageAttribution}
								className="border-b-0 px-0 pb-0 sm:px-0 sm:pb-0"
								delivery={delivery}
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

			<RsvpSection
				eventDate={wishlist.eventDate}
				eventLocation={wishlist.eventLocation}
				eventTime={wishlist.eventTime}
				guest={wishlist.guest}
				rsvpDeadline={wishlist.rsvpDeadline}
				wishlistSlug={wishlist.slug}
			/>

			<div className="relative left-1/2 w-screen -translate-x-1/2">
				{motif && (
					<MotifMarginScatter
						motif={motif}
						palette={motifPalette}
						treatment={motifTreatment}
					/>
				)}

				<GiftListBand className="relative left-1/2 w-screen -translate-x-1/2">
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
				</GiftListBand>
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
