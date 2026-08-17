"use client";

import { PublicGiftFilters } from "@/components/features/wishlist/public-filters";
import { Countdown } from "@/components/shared/countdown";
import { GiftListBand } from "@/components/shared/gift-list-band";
import { HeroCtas } from "@/components/shared/hero-ctas";
import { HeroImageSlot } from "@/components/shared/hero-gallery";
import { MotifDivider } from "@/components/shared/motif/motif-divider";
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
import { formatEventDate } from "@/lib/format/dates";
import { composeDelivery } from "@/lib/format/delivery";
import { resolveHeroSlots } from "@/lib/hero-slots";
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
};

export function SplitImageRightLayout({
	wishlist,
	layout,
	mode,
	surface = "standalone",
}: Props) {
	const isCompact = mode === "compact";
	// An embedded preview (wizard steps, dashboard editor) is bounded by its
	// host pane, not the real viewport — 100svh there would overflow it just
	// like compact mode, so both fall back to the non-sticky, container-sized
	// rail.
	const usesViewportRail = !isCompact && surface !== "embedded";
	const heading = wishlist.title;
	const eventLabel =
		EVENT_TYPE_PRESETS[wishlist.eventType as EventType]?.label ??
		wishlist.eventType;
	const slots = resolveHeroSlots(wishlist.images, 2);
	const motif = resolveMotif(wishlist.motifId);
	const motifTreatment = resolveMotifTreatment(wishlist.motifTreatment);
	const motifPalette = resolveMotifPalette(wishlist.motifPalette);
	const delivery = composeDelivery(
		wishlist.deliveryRecipientName,
		wishlist.deliveryAddress,
		wishlist.deliveryPhone,
	);

	return (
		<PublicLayoutShell heading={heading} mode={mode}>
			<div className="grid grid-cols-1 lg:grid-cols-[1fr_340px]">
				<div className="order-2 p-6 sm:p-7 lg:order-1 lg:border-border lg:border-r">
					<p className="font-mono text-muted-foreground text-xs uppercase tracking-[0.2em]">
						{eventLabel}
					</p>
					<h1 className="mt-2 font-heading font-semibold text-[32px] leading-[1.1] sm:text-[38px]">
						{heading}
					</h1>

					{!isCompact && (
						<>
							<div className="mt-7 grid grid-cols-2 gap-2.5">
								{(
									[
										[
											"Fecha",
											wishlist.eventDate
												? formatEventDate(
														wishlist.eventDate,
														wishlist.language as "es" | "en",
														wishlist.eventTime,
													)
												: null,
										],
										["Lugar", wishlist.eventLocation],
									] as const
								)
									.filter(([, value]) => value)
									.map(([label, value]) => (
										<div
											className="rounded-[14px] border border-border bg-card px-3.5 py-3"
											key={label}
										>
											<p className="font-mono text-[9px] text-muted-foreground uppercase tracking-[0.16em]">
												{label}
											</p>
											<p className="mt-1 font-heading font-semibold text-sm">
												{value}
											</p>
										</div>
									))}
							</div>

							{wishlist.eventDate && (
								<div className="mt-6 flex justify-center">
									<Countdown
										className="p-0"
										createdAt={wishlist.createdAt}
										eventDate={wishlist.eventDate}
										variant={wishlist.countdownVariant}
									/>
								</div>
							)}

							<WishlistMessage
								attribution={wishlist.welcomeMessageAttribution}
								className="mt-6 border-none px-0 pb-0"
								delivery={delivery}
								message={wishlist.welcomeMessage}
								variant={wishlist.welcomeMessageVariant}
							/>
						</>
					)}

					{!isCompact && (
						<HeroCtas
							className="mt-6 flex justify-center"
							showHowItWorks={wishlist.showHowItWorks}
						/>
					)}

					<div className="mt-6 h-px bg-border" />
					{motif && (
						<MotifDivider
							motif={motif}
							palette={motifPalette}
							treatment={motifTreatment}
						/>
					)}

					<RsvpSection
						className="mt-5 max-w-none px-0 pt-0"
						eventDate={wishlist.eventDate}
						eventLocation={wishlist.eventLocation}
						eventTime={wishlist.eventTime}
						guest={wishlist.guest}
						rsvpDeadline={wishlist.rsvpDeadline}
						wishlistSlug={wishlist.slug}
					/>

					<GiftListBand className="-mx-6 sm:-mx-7">
						<section
							className="scroll-mt-[59px] px-6 pt-5 pb-3 sm:px-7"
							id="regalos"
						>
							<h2 className="mb-3 font-heading font-semibold text-xl">
								Lista de regalos
							</h2>
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

				<div
					className={cn(
						"order-1 flex h-56 flex-col gap-7 bg-background p-5 sm:h-72 lg:order-2",
						usesViewportRail
							? "lg:sticky lg:top-[var(--sticky-offset)] lg:h-[calc(100svh-var(--sticky-offset))] lg:self-start"
							: "lg:h-auto lg:self-stretch",
					)}
				>
					<div className="relative min-h-0 flex-1 -rotate-2 overflow-hidden rounded-[3px] border-[10px] border-card shadow-[0_16px_36px_rgba(30,50,80,.22)]">
						<HeroImageSlot
							alt={`${heading} 1`}
							className="h-full w-full"
							isSample={slots[0]?.isSample}
							priority={!isCompact}
							sizes="(min-width: 1024px) 340px, 100vw"
							src={slots[0]?.url ?? null}
						/>
					</div>
					<div className="relative min-h-0 flex-1 rotate-2 overflow-hidden rounded-[3px] border-[10px] border-card shadow-[0_16px_36px_rgba(30,50,80,.22)]">
						<HeroImageSlot
							alt={`${heading} 2`}
							className="h-full w-full"
							isSample={slots[1]?.isSample}
							sizes="(min-width: 1024px) 340px, 100vw"
							src={slots[1]?.url ?? null}
						/>
					</div>
				</div>
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
