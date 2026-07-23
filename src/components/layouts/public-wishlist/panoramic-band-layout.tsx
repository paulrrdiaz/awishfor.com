import { GuestWelcomeSection } from "@/components/shared/guest-welcome-section";
import { HeroCtas } from "@/components/shared/hero-ctas";
import { HeroCarouselGallery } from "@/components/shared/hero-gallery";
import { PublicWishlistBody } from "@/components/shared/public-wishlist-body";
import { EVENT_TYPE_PRESETS } from "@/config/event-type-presets";
import type { PublicLayoutPreset } from "@/config/public-layouts";
import type { EventType } from "@/generated/prisma/enums";
import type { PublicWishlistViewModel } from "@/server/mappers/view-models";
import type { PublicWishlistMode } from "./public-wishlist-page";

type Props = {
	wishlist: PublicWishlistViewModel;
	layout: PublicLayoutPreset;
	mode: PublicWishlistMode;
};

export function PanoramicBandLayout({ wishlist, layout, mode }: Props) {
	const isCompact = mode === "compact";
	const heading = wishlist.heroTitle ?? wishlist.title;
	const eventLabel =
		EVENT_TYPE_PRESETS[wishlist.eventType as EventType]?.label ??
		wishlist.eventType;

	return (
		<div className="flex flex-col">
			<header className="relative">
				<div className="relative h-56 overflow-hidden sm:h-72 lg:h-80">
					<HeroCarouselGallery
						alt={heading}
						className="h-full w-full"
						images={wishlist.coverImageUrls}
					/>
					<div className="absolute inset-0 bg-gradient-to-b from-black/5 to-black/25" />
				</div>
				<div className="relative z-10 px-6 sm:px-10">
					<div className="-mt-10 rounded-2xl bg-card p-6 shadow-xl sm:p-7">
						<p className="font-mono text-muted-foreground text-xs uppercase tracking-[0.2em]">
							{eventLabel}
						</p>
						<h1 className="mt-2 font-heading font-semibold text-3xl leading-tight sm:text-4xl">
							{heading}
						</h1>
						{wishlist.displayName && (
							<p className="mt-2 text-muted-foreground text-sm">
								{wishlist.displayName}
							</p>
						)}
						<GuestWelcomeSection
							className="mt-3"
							guest={wishlist.guest}
							wishlistSlug={wishlist.slug}
						/>
					</div>
					{!isCompact && (
						<div className="py-6 text-center">
							<HeroCtas />
						</div>
					)}
				</div>
			</header>
			<PublicWishlistBody
				layout={layout}
				maxWidth="max-w-5xl"
				mode={mode}
				wishlist={wishlist}
			/>
		</div>
	);
}
