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

export function CarouselHeroLayout({ wishlist, layout, mode }: Props) {
	const isCompact = mode === "compact";
	const heading = wishlist.heroTitle ?? wishlist.title;
	const eventLabel =
		EVENT_TYPE_PRESETS[wishlist.eventType as EventType]?.label ??
		wishlist.eventType;
	const imageCount = wishlist.coverImageUrls.length;

	return (
		<div className="flex flex-col">
			<header className="relative h-96 w-full overflow-hidden sm:h-[420px] lg:h-[480px]">
				<HeroCarouselGallery
					alt={heading}
					className="absolute inset-0 h-full w-full"
					images={wishlist.coverImageUrls}
				/>
				<div className="absolute inset-0 bg-black/45" />
				<div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
					<p className="font-mono text-xs uppercase tracking-[0.22em] opacity-80">
						{eventLabel}
					</p>
					<h1 className="mt-4 font-heading font-semibold text-4xl leading-tight sm:text-5xl">
						{heading}
					</h1>
					{wishlist.displayName && (
						<p className="mt-2 text-sm opacity-90">{wishlist.displayName}</p>
					)}
					<GuestWelcomeSection
						className="mt-4"
						guest={wishlist.guest}
						tone="on-photo"
						wishlistSlug={wishlist.slug}
					/>
					{imageCount < 2 && (
						<p className="mt-3 font-mono text-[11px] opacity-70">
							El carrusel aparece al subir 2+ fotos
						</p>
					)}
					{!isCompact && (
						<div className="mt-6">
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
