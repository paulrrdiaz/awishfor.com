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

export function PortraitFrameSplitLayout({ wishlist, layout, mode }: Props) {
	const isCompact = mode === "compact";
	const heading = wishlist.heroTitle ?? wishlist.title;
	const eventLabel =
		EVENT_TYPE_PRESETS[wishlist.eventType as EventType]?.label ??
		wishlist.eventType;

	return (
		<div className="flex flex-col">
			<header className="grid grid-cols-1 lg:grid-cols-[300px_1fr]">
				<div className="flex items-center justify-center bg-accent p-8">
					<HeroImageSlot
						alt={heading}
						className="aspect-[3/4] w-full max-w-56 rounded-sm border-8 border-card shadow-xl"
						priority
						src={wishlist.coverImageUrls[0] ?? null}
					/>
				</div>
				<div className="flex flex-col justify-center gap-3 px-6 py-10 sm:px-10">
					<p className="font-serif text-muted-foreground text-sm italic">
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
			</header>
			<PublicWishlistBody layout={layout} mode={mode} wishlist={wishlist} />
		</div>
	);
}
