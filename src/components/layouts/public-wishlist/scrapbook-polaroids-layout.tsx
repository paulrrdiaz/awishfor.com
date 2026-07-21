import { HeroCtas } from "@/components/shared/hero-ctas";
import {
	HeroImageSlot,
	resolveHeroSlots,
} from "@/components/shared/hero-gallery";
import { PublicWishlistBody } from "@/components/shared/public-wishlist-body";
import { EVENT_TYPE_PRESETS } from "@/config/event-type-presets";
import type { PublicLayoutPreset } from "@/config/public-layouts";
import type { EventType } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";
import type { PublicWishlistViewModel } from "@/server/mappers/view-models";
import type { PublicWishlistMode } from "./public-wishlist-page";

type Props = {
	wishlist: PublicWishlistViewModel;
	layout: PublicLayoutPreset;
	mode: PublicWishlistMode;
};

function Polaroid({
	src,
	alt,
	rotation,
	className,
}: {
	src: string | null;
	alt: string;
	rotation: string;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"w-32 shrink-0 bg-white p-2 pb-4 shadow-lg sm:w-36",
				rotation,
				className,
			)}
		>
			<HeroImageSlot alt={alt} className="aspect-[4/3]" src={src} />
		</div>
	);
}

export function ScrapbookPolaroidsLayout({ wishlist, layout, mode }: Props) {
	const isCompact = mode === "compact";
	const heading = wishlist.heroTitle ?? wishlist.title;
	const eventLabel =
		EVENT_TYPE_PRESETS[wishlist.eventType as EventType]?.label ??
		wishlist.eventType;
	const slots = resolveHeroSlots(wishlist.coverImageUrls, 3);

	return (
		<div className="flex flex-col">
			<header className="bg-gradient-to-b from-accent to-card">
				<div className="px-6 pt-9 pb-2 text-center sm:px-10">
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
				<div className="flex items-end justify-center gap-0 bg-gradient-to-b from-card to-background px-6 pt-7 pb-10 sm:px-10">
					<Polaroid
						alt={`${heading} 1`}
						className="z-[1] -mr-3"
						rotation="-rotate-6"
						src={slots[0] ?? null}
					/>
					<Polaroid
						alt={`${heading} 2`}
						className="z-[3] w-36 sm:w-40"
						rotation="rotate-3"
						src={slots[1] ?? null}
					/>
					<Polaroid
						alt={`${heading} 3`}
						className="z-[2] -ml-3"
						rotation="-rotate-2"
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
