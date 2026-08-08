"use client";

import { PublicGiftFilters } from "@/components/features/wishlist/public-filters";
import { Countdown } from "@/components/shared/countdown";
import { GuestWelcomeSection } from "@/components/shared/guest-welcome-section";
import { HeroCtas } from "@/components/shared/hero-ctas";
import {
	HeroCarouselGallery,
	HeroImageSlot,
} from "@/components/shared/hero-gallery";
import { WishlistMessage } from "@/components/shared/wishlist-message";
import { WishlistThankYou } from "@/components/shared/wishlist-thank-you";
import { EVENT_TYPE_PRESETS } from "@/config/event-type-presets";
import type { PublicLayoutPreset } from "@/config/public-layouts";
import type { EventType } from "@/generated/prisma/enums";
import { formatEventDate } from "@/lib/format/dates";
import { resolveHeroSlots } from "@/lib/hero-slots";
import type { PublicWishlistViewModel } from "@/server/mappers/view-models";
import { PublicLayoutShell } from "./public-layout-shell";
import type { PublicWishlistMode } from "./public-wishlist-page";

type Props = {
	wishlist: PublicWishlistViewModel;
	layout: PublicLayoutPreset;
	mode: PublicWishlistMode;
};

export function CollageStaggeredLayout({ wishlist, layout, mode }: Props) {
	const isCompact = mode === "compact";
	const heading = wishlist.title;
	const eventLabel =
		EVENT_TYPE_PRESETS[wishlist.eventType as EventType]?.label ??
		wishlist.eventType;
	const slots = resolveHeroSlots(wishlist.images, 3);
	const carouselImages =
		wishlist.images.length > 0 ? wishlist.images : slots[1] ? [slots[1]] : [];
	const eventSummary = wishlist.eventDate
		? [
				wishlist.guest?.primaryName,
				formatEventDate(wishlist.eventDate, wishlist.language as "es" | "en"),
			]
				.filter(Boolean)
				.join(" · ")
		: null;

	return (
		<PublicLayoutShell heading={heading} mode={mode}>
			<section className="relative left-1/2 w-screen -translate-x-1/2 bg-[linear-gradient(180deg,var(--accent)_0%,var(--card)_30%,var(--background)_72%,var(--background)_100%)]">
				<div className="mx-auto w-full max-w-[1160px] pt-9 text-center">
					<p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.18em]">
						{eventLabel}
					</p>
					<h1 className="mt-2 px-5 font-heading font-semibold text-[34px] leading-[1.1] sm:text-[42px]">
						{heading}
					</h1>
					{eventSummary && (
						<p className="mt-1.5 px-5 text-[13px] text-muted-foreground">
							{eventSummary}
						</p>
					)}
					<GuestWelcomeSection
						className="mt-3"
						guest={wishlist.guest}
						wishlistSlug={wishlist.slug}
					/>
					<div className="relative mt-5 grid grid-cols-[1fr_1.15fr_1fr] items-end gap-3 px-4 pb-[58px] sm:px-7">
						<HeroImageSlot
							alt={`${heading} 1`}
							className="mt-11 h-[180px] rounded-xl shadow-[0_12px_32px_rgba(30,50,80,.10)]"
							isSample={slots[0]?.isSample}
							sizes="33vw"
							src={slots[0]?.url ?? null}
						/>
						<HeroCarouselGallery
							alt={`${heading} destacada`}
							className="h-[253px] overflow-hidden rounded-xl shadow-[0_18px_44px_rgba(30,50,80,.13)]"
							controlsVariant="compact"
							images={carouselImages}
							maxImages={carouselImages.length}
							priority={!isCompact}
							sizes="(min-width: 768px) 360px, 42vw"
							startIndex={wishlist.images.length > 1 ? 1 : 0}
						/>
						<HeroImageSlot
							alt={`${heading} 3`}
							className="mt-11 h-[180px] rounded-xl shadow-[0_12px_32px_rgba(30,50,80,.10)]"
							isSample={slots[2]?.isSample}
							sizes="33vw"
							src={slots[2]?.url ?? null}
						/>
						{slots[2] && (
							<div className="absolute bottom-[-20px] left-2 z-10 w-24 rotate-[-7deg] rounded-[2px] bg-white p-2 pb-3.5 shadow-[0_14px_30px_rgba(30,50,80,.22)] sm:w-[118px]">
								<HeroImageSlot
									alt={`${heading} recuerdo`}
									className="h-[96px] w-full"
									isSample={slots[2].isSample}
									sizes="118px"
									src={slots[2].url}
								/>
								<p className="mt-1.5 text-center font-heading text-[#333] text-[10px] italic">
									Un recuerdo especial 🤍
								</p>
							</div>
						)}
					</div>
					{!isCompact && (
						<div className="px-5 text-center">
							<HeroCtas
								className="gap-2.5"
								primaryClassName="px-[18px] py-2 text-[13px]"
								secondaryClassName="px-[18px] py-2 text-[13px] [border-color:var(--border)]! [border-width:1px]!"
								showHowItWorks={wishlist.showHowItWorks}
							/>
						</div>
					)}
				</div>
			</section>

			{!isCompact && (
				<>
					<section className="grid grid-cols-1 gap-3 px-5 py-5 sm:grid-cols-3 sm:px-7">
						{[
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
							["Dresscode", wishlist.dressCode],
						]
							.filter(([, value]) => value)
							.map(([label, value]) => (
								<div
									className="rounded-[14px] border border-border bg-card px-4 py-3 text-center"
									key={label}
								>
									<p className="font-mono text-[9px] text-muted-foreground uppercase tracking-[0.16em]">
										{label}
									</p>
									<p className="mt-1 font-heading font-semibold text-[15px]">
										{value}
									</p>
								</div>
							))}
					</section>
					{wishlist.welcomeMessage && (
						<WishlistMessage
							attribution={wishlist.welcomeMessageAttribution}
							message={wishlist.welcomeMessage}
							variant={wishlist.welcomeMessageVariant}
						/>
					)}
				</>
			)}

			<section
				className="scroll-mt-[59px] px-5 pt-[18px] pb-16 sm:px-[22px]"
				id="regalos"
			>
				<PublicGiftFilters
					actionsEnabled={mode === "full"}
					categories={wishlist.categories}
					compact
					gifts={wishlist.gifts}
					layout={layout}
					showCategories={false}
					showCounts={false}
					showGridToggle
					showSort={false}
					toolbarLeading={
						wishlist.eventDate ? (
							<Countdown
								className="p-0 text-left"
								createdAt={wishlist.createdAt}
								eventDate={wishlist.eventDate}
								variant={wishlist.countdownVariant}
							/>
						) : undefined
					}
				/>
			</section>

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
