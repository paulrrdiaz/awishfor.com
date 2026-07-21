import { HeroCtas } from "@/components/shared/hero-ctas";
import { HeroImageSlot } from "@/components/shared/hero-gallery";
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

export function SplitImageRightLayout({ wishlist, layout, mode }: Props) {
	const isCompact = mode === "compact";
	const heading = wishlist.heroTitle ?? wishlist.title;
	const eventLabel =
		EVENT_TYPE_PRESETS[wishlist.eventType as EventType]?.label ??
		wishlist.eventType;

	return (
		<div className="flex flex-col">
			<header className="grid grid-cols-1 lg:grid-cols-[1fr_340px]">
				<div className="flex flex-col justify-center gap-4 px-6 py-10 lg:border-border lg:border-r lg:px-10">
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
					{!isCompact && <HeroCtas className="justify-start" />}
				</div>
				<div className="relative h-56 sm:h-72 lg:h-auto">
					<HeroImageSlot
						alt={heading}
						className="absolute inset-0 h-full w-full"
						priority
						src={wishlist.coverImageUrls[0] ?? null}
					/>
				</div>
			</header>
			<PublicWishlistBody layout={layout} mode={mode} wishlist={wishlist} />
		</div>
	);
}
