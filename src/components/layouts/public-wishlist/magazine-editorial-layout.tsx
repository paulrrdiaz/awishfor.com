import Image from "next/image";
import { GuestWelcomeSection } from "@/components/shared/guest-welcome-section";
import { HeroCtas } from "@/components/shared/hero-ctas";
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

export function MagazineEditorialLayout({ wishlist, layout, mode }: Props) {
	const isCompact = mode === "compact";
	const heading = wishlist.heroTitle ?? wishlist.title;
	const eventLabel =
		EVENT_TYPE_PRESETS[wishlist.eventType as EventType]?.label ??
		wishlist.eventType;
	const monogram = heading.trim().charAt(0).toUpperCase() || "?";
	const stripImages = wishlist.coverImageUrls.slice(0, 5);

	return (
		<div className="flex flex-col">
			<header className="px-6 pt-9 sm:px-10">
				<div className="grid grid-cols-1 items-end gap-2 border-foreground border-b-2 pb-7 sm:grid-cols-[140px_1fr] sm:gap-0">
					<div className="hidden border-foreground border-r-2 pr-6 pb-1 sm:block">
						<p className="mb-1.5 font-mono text-muted-foreground text-xs uppercase tracking-[0.14em]">
							{eventLabel}
						</p>
						<div
							aria-hidden
							className="font-bold font-heading text-[88px] text-foreground/10 leading-[0.85]"
						>
							{monogram}
						</div>
					</div>
					<div className="sm:pl-7">
						<h1 className="font-heading font-semibold text-4xl leading-tight sm:text-5xl">
							{heading}
						</h1>
						{wishlist.displayName && (
							<p className="mt-3 text-muted-foreground text-sm">
								{wishlist.displayName}
							</p>
						)}
						<GuestWelcomeSection
							className="mt-3"
							guest={wishlist.guest}
							wishlistSlug={wishlist.slug}
						/>
					</div>
				</div>
				{!isCompact && (
					<div className="mt-6">
						<HeroCtas className="justify-start" />
					</div>
				)}
				{stripImages.length > 0 && (
					<div className="mt-6 grid grid-cols-3 gap-2 pb-8 sm:grid-cols-5">
						{stripImages.map((src, index) => (
							<div
								className={cn(
									"relative aspect-square overflow-hidden rounded-md bg-accent/50",
									index >= 3 && "hidden sm:block",
								)}
								key={src}
							>
								<Image
									alt={`${heading} ${index + 1}`}
									className="object-cover"
									fill
									src={src}
								/>
							</div>
						))}
					</div>
				)}
			</header>
			<PublicWishlistBody layout={layout} mode={mode} wishlist={wishlist} />
		</div>
	);
}
