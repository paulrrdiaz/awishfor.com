import { GuestWelcomeSection } from "@/components/shared/guest-welcome-section";
import { HeroCtas } from "@/components/shared/hero-ctas";
import {
	HeroImageSlot,
	resolveHeroSlots,
} from "@/components/shared/hero-gallery";
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

export function ArchTrioLayout({ wishlist, layout, mode }: Props) {
	const isCompact = mode === "compact";
	const heading = wishlist.heroTitle ?? wishlist.title;
	const eventLabel =
		EVENT_TYPE_PRESETS[wishlist.eventType as EventType]?.label ??
		wishlist.eventType;
	const slots = resolveHeroSlots(wishlist.coverImageUrls, 3);

	return (
		<div className="flex flex-col">
			<header className="grid grid-cols-1 gap-8 bg-gradient-to-br from-accent to-card px-6 py-10 sm:px-10 lg:grid-cols-[280px_1fr] lg:items-center">
				<div className="relative mx-auto aspect-square w-full max-w-[240px]">
					<HeroImageSlot
						alt={`${heading} 1`}
						className="absolute top-4 left-0 size-[72%] rounded-full border-4 border-card shadow-lg"
						priority
						src={slots[0] ?? null}
					/>
					<HeroImageSlot
						alt={`${heading} 2`}
						className="absolute right-0 bottom-0 size-[52%] rounded-full border-4 border-card shadow-md"
						src={slots[1] ?? null}
					/>
					<HeroImageSlot
						alt={`${heading} 3`}
						className="absolute top-0 right-2 size-[38%] rounded-full border-4 border-card shadow-md"
						src={slots[2] ?? null}
					/>
				</div>
				<div className="flex flex-col justify-center gap-4 text-center lg:text-left">
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
					<GuestWelcomeSection
						guest={wishlist.guest}
						wishlistSlug={wishlist.slug}
					/>
					{!isCompact && (
						<HeroCtas className="justify-center lg:justify-start" />
					)}
				</div>
			</header>
			<PublicWishlistBody layout={layout} mode={mode} wishlist={wishlist} />
		</div>
	);
}
