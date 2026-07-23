import { GuestWelcomeSection } from "@/components/shared/guest-welcome-section";
import { HeroCtas } from "@/components/shared/hero-ctas";
import { HeroImageSlot } from "@/components/shared/hero-gallery";
import { PublicWishlistBody } from "@/components/shared/public-wishlist-body";
import { EVENT_TYPE_PRESETS } from "@/config/event-type-presets";
import type { PublicLayoutPreset } from "@/config/public-layouts";
import type { EventType } from "@/generated/prisma/enums";
import { resolveHeroSlots } from "@/lib/hero-slots";
import type { PublicWishlistViewModel } from "@/server/mappers/view-models";
import type { PublicWishlistMode } from "./public-wishlist-page";

type Props = {
	wishlist: PublicWishlistViewModel;
	layout: PublicLayoutPreset;
	mode: PublicWishlistMode;
};

export function OverlapDuoLayout({ wishlist, layout, mode }: Props) {
	const isCompact = mode === "compact";
	const heading = wishlist.heroTitle ?? wishlist.title;
	const eventLabel =
		EVENT_TYPE_PRESETS[wishlist.eventType as EventType]?.label ??
		wishlist.eventType;
	const slots = resolveHeroSlots(wishlist.coverImageUrls, 2);

	return (
		<div className="flex flex-col">
			<header className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
				<div className="relative min-h-72 overflow-hidden bg-gradient-to-br from-accent to-muted sm:min-h-96">
					<HeroImageSlot
						alt={`${heading} 1`}
						className="absolute top-6 left-5 aspect-[3/4] w-[58%] -rotate-3 rounded-lg border-4 border-card shadow-xl"
						priority
						src={slots[0] ?? null}
					/>
					<HeroImageSlot
						alt={`${heading} 2`}
						className="absolute right-4 bottom-5 aspect-[4/5] w-[52%] rotate-3 rounded-lg border-4 border-card shadow-xl"
						src={slots[1] ?? null}
					/>
				</div>
				<div className="flex flex-col justify-center gap-4 px-6 py-10 sm:px-10">
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
					{!isCompact && <HeroCtas className="justify-start" />}
				</div>
			</header>
			<PublicWishlistBody layout={layout} mode={mode} wishlist={wishlist} />
		</div>
	);
}
