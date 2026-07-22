import { HeroCtas } from "@/components/shared/hero-ctas";
import { HeroCarouselGallery } from "@/components/shared/hero-gallery";
import { PublicWishlistBody } from "@/components/shared/public-wishlist-body";
import { EVENT_TYPE_PRESETS } from "@/config/event-type-presets";
import type { PublicLayoutPreset } from "@/config/public-layouts";
import type { EventType } from "@/generated/prisma/enums";
import { formatEventDate } from "@/lib/format/dates";
import type { PublicWishlistViewModel } from "@/server/mappers/view-models";
import type { PublicWishlistMode } from "./public-wishlist-page";

type Props = {
	wishlist: PublicWishlistViewModel;
	layout: PublicLayoutPreset;
	mode: PublicWishlistMode;
};

export function HeroCinematicLayout({ wishlist, layout, mode }: Props) {
	const isCompact = mode === "compact";
	const heading = wishlist.heroTitle ?? wishlist.title;
	const eventLabel =
		EVENT_TYPE_PRESETS[wishlist.eventType as EventType]?.label ??
		wishlist.eventType;
	const eyebrow = wishlist.eventDate
		? `${eventLabel} · ${formatEventDate(wishlist.eventDate, "es")}`
		: eventLabel;
	const subtitle = wishlist.eventLocation ?? wishlist.displayName;

	return (
		<div className="flex flex-col">
			<header className="relative h-80 w-full overflow-hidden sm:h-96 lg:h-[440px]">
				<HeroCarouselGallery
					alt={heading}
					className="absolute inset-0 h-full w-full"
					images={wishlist.coverImageUrls}
				/>
				<div className="absolute inset-0 bg-gradient-to-b from-[rgba(20,10,5,.04)] via-[rgba(20,10,5,.44)] to-[rgba(20,10,5,.82)]" />
				<div className="absolute inset-x-0 bottom-0 px-6 pb-9 text-center text-white">
					<p className="font-mono text-xs uppercase tracking-[0.2em] opacity-80">
						{eyebrow}
					</p>
					<h1 className="mt-3 font-heading font-semibold text-4xl leading-tight sm:text-5xl">
						{heading}
					</h1>
					{subtitle && <p className="mt-2 text-sm opacity-90">{subtitle}</p>}
					{!isCompact && (
						<div className="mt-6">
							<HeroCtas variant="on-photo" />
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
