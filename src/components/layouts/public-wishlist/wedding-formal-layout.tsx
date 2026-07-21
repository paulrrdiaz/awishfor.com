import { HeroCtas } from "@/components/shared/hero-ctas";
import { PublicWishlistBody } from "@/components/shared/public-wishlist-body";
import type { PublicLayoutPreset } from "@/config/public-layouts";
import type { PublicWishlistViewModel } from "@/server/mappers/view-models";
import type { PublicWishlistMode } from "./public-wishlist-page";

type Props = {
	wishlist: PublicWishlistViewModel;
	layout: PublicLayoutPreset;
	mode: PublicWishlistMode;
};

function initialsFrom(name: string): string {
	const separators = /\s+(?:&|y|e|and)\s+/i;
	const parts = name.split(separators).map((part) => part.trim());

	if (parts.length >= 2 && parts[0] && parts[1]) {
		return `${parts[0].charAt(0)}&${parts[1].charAt(0)}`.toUpperCase();
	}

	const words = name.trim().split(/\s+/);
	return (words[0]?.charAt(0) ?? "?").toUpperCase();
}

function OrnamentDivider() {
	return (
		<div className="flex items-center justify-center gap-3.5 py-1">
			<span className="h-px w-9 bg-border" />
			<span aria-hidden className="text-muted-foreground text-sm">
				✦
			</span>
			<span className="h-px w-9 bg-border" />
		</div>
	);
}

export function WeddingFormalLayout({ wishlist, layout, mode }: Props) {
	const isCompact = mode === "compact";
	const heading = wishlist.heroTitle ?? wishlist.title;
	const monogram = initialsFrom(wishlist.displayName || heading);

	return (
		<div className="flex flex-col">
			<header className="bg-gradient-to-b from-accent to-card px-6 py-12 text-center sm:px-10 sm:py-16">
				<p className="mb-4 font-mono text-muted-foreground text-xs uppercase tracking-[0.24em]">
					{wishlist.eventDate
						? new Date(wishlist.eventDate).toLocaleDateString("es-PE", {
								day: "numeric",
								month: "long",
								year: "numeric",
							})
						: "Boda"}
				</p>
				<div className="flex items-center justify-center gap-5">
					<span className="h-px max-w-16 flex-1 bg-border" />
					<span className="font-heading font-semibold text-6xl text-primary leading-none tracking-tight sm:text-7xl">
						{monogram}
					</span>
					<span className="h-px max-w-16 flex-1 bg-border" />
				</div>
				<h1 className="mt-5 font-heading font-semibold text-3xl leading-tight sm:text-4xl">
					{heading}
				</h1>
				{!isCompact && (
					<>
						<div className="mt-5">
							<OrnamentDivider />
						</div>
						<div className="mt-3">
							<HeroCtas />
						</div>
					</>
				)}
			</header>
			<PublicWishlistBody
				layout={layout}
				maxWidth="max-w-3xl"
				mode={mode}
				wishlist={wishlist}
			/>
		</div>
	);
}
