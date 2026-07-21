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

export function ArchHeroPartyLayout({ wishlist, layout, mode }: Props) {
	const isCompact = mode === "compact";
	const heading = wishlist.heroTitle ?? wishlist.title;
	const eventLabel =
		EVENT_TYPE_PRESETS[wishlist.eventType as EventType]?.label ??
		wishlist.eventType;

	return (
		<div className="flex flex-col">
			<header className="relative grid grid-cols-1 gap-8 overflow-hidden bg-gradient-to-br from-accent via-accent/60 to-card px-6 py-10 sm:px-10 lg:grid-cols-[300px_1fr] lg:items-center">
				<div
					aria-hidden
					className="pointer-events-none absolute -top-24 -left-16 size-64 rounded-full bg-primary/25 blur-[70px]"
				/>
				<div className="relative mx-auto w-full max-w-[260px]">
					<div
						aria-hidden
						className="absolute inset-0 scale-110 rounded-full bg-primary/20 blur-2xl"
					/>
					<div
						className="relative aspect-[2/3] overflow-hidden border-4 border-card shadow-xl"
						style={{ borderRadius: "130px 130px 12px 12px" }}
					>
						<HeroCarouselGallery
							alt={heading}
							className="h-full w-full"
							images={wishlist.coverImageUrls}
						/>
					</div>
				</div>
				<div className="relative flex flex-col justify-center gap-4 text-center lg:text-left">
					<p className="font-mono text-muted-foreground text-xs uppercase tracking-[0.2em]">
						{eventLabel}
					</p>
					<h1 className="font-heading font-semibold text-4xl leading-tight sm:text-5xl">
						{heading}
					</h1>
					{wishlist.displayName && (
						<p className="text-muted-foreground text-sm">
							{wishlist.displayName}
						</p>
					)}
					{!isCompact && (
						<HeroCtas className="justify-center lg:justify-start" />
					)}
				</div>
			</header>
			<PublicWishlistBody layout={layout} mode={mode} wishlist={wishlist} />
		</div>
	);
}
