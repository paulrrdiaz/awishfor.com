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

export function CollageStaggeredLayout({ wishlist, layout, mode }: Props) {
	const isCompact = mode === "compact";
	const heading = wishlist.heroTitle ?? wishlist.title;
	const eventLabel =
		EVENT_TYPE_PRESETS[wishlist.eventType as EventType]?.label ??
		wishlist.eventType;
	const slots = resolveHeroSlots(wishlist.coverImageUrls, 3);

	return (
		<div className="flex flex-col">
			<header className="bg-gradient-to-b from-accent to-card">
				<div className="px-6 pt-9 pb-6 text-center sm:px-10">
					<p className="font-mono text-muted-foreground text-xs uppercase tracking-[0.2em]">
						{eventLabel}
					</p>
					<h1 className="mt-3 font-heading font-semibold text-4xl leading-tight sm:text-5xl">
						{heading}
					</h1>
					{wishlist.displayName && (
						<p className="mt-2 text-muted-foreground text-sm">
							{wishlist.displayName}
						</p>
					)}
				</div>
				<div className="grid grid-cols-3 items-end gap-3 bg-gradient-to-b from-card to-background px-6 pb-9 sm:px-10">
					<HeroImageSlot
						alt={`${heading} 1`}
						className="mt-11 aspect-square rounded-xl shadow-lg"
						src={slots[0] ?? null}
					/>
					<HeroImageSlot
						alt={`${heading} 2`}
						className="aspect-[3/4] rounded-xl shadow-xl"
						priority
						src={slots[1] ?? null}
					/>
					<HeroImageSlot
						alt={`${heading} 3`}
						className="mt-11 aspect-square rounded-xl shadow-lg"
						src={slots[2] ?? null}
					/>
				</div>
				{!isCompact && (
					<div className="pb-8 text-center">
						<HeroCtas />
					</div>
				)}
			</header>
			<PublicWishlistBody layout={layout} mode={mode} wishlist={wishlist} />
		</div>
	);
}
