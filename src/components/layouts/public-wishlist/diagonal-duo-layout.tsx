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

export function DiagonalDuoLayout({ wishlist, layout, mode }: Props) {
	const isCompact = mode === "compact";
	const heading = wishlist.heroTitle ?? wishlist.title;
	const eventLabel =
		EVENT_TYPE_PRESETS[wishlist.eventType as EventType]?.label ??
		wishlist.eventType;
	const slots = resolveHeroSlots(wishlist.coverImageUrls, 3);

	return (
		<div className="flex flex-col">
			<header
				className="relative"
				style={{
					background:
						"linear-gradient(135deg, var(--card) 0%, var(--card) 46%, var(--accent) 46%, var(--accent) 100%)",
				}}
			>
				<div className="grid grid-cols-1 items-center gap-8 px-6 py-10 sm:px-10 lg:grid-cols-[1fr_320px]">
					<div className="flex flex-col gap-4 text-center lg:text-left">
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
					<div className="relative mx-auto h-64 w-full max-w-[300px] sm:h-80">
						<HeroImageSlot
							alt={`${heading} 1`}
							className="absolute top-0 left-0 size-40 rounded-full border-4 border-card shadow-lg"
							priority
							src={slots[0] ?? null}
						/>
						<HeroImageSlot
							alt={`${heading} 2`}
							className="absolute right-0 bottom-0 aspect-[3/4] w-44 rounded-md border-4 border-card shadow-xl"
							src={slots[1] ?? null}
						/>
					</div>
				</div>
			</header>
			<PublicWishlistBody layout={layout} mode={mode} wishlist={wishlist} />
		</div>
	);
}
