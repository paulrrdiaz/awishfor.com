import type { ReactNode } from "react";
import { MotifBand } from "@/components/shared/motif/motif-band";
import { WishlistFooter } from "@/components/shared/wishlist-footer";
import {
	resolveMotif,
	resolveMotifPalette,
	resolveMotifTreatment,
} from "@/config/motifs";
import { resolveButtonStyle } from "@/config/public-button-styles";
import { resolveBodyFont, resolveHeadingFont } from "@/config/public-fonts";
import { resolveLayout } from "@/config/public-layouts";
import { resolveTheme } from "@/config/public-themes";
import type { PublicWishlistViewModel } from "@/server/mappers/view-models";
import { ArchHeroPartyLayout } from "./arch-hero-party-layout";
import { ArchTrioLayout } from "./arch-trio-layout";
import { CarouselHeroLayout } from "./carousel-hero-layout";
import { CollageStaggeredLayout } from "./collage-staggered-layout";
import { MagazineEditorialLayout } from "./magazine-editorial-layout";
import { OverlapDuoLayout } from "./overlap-duo-layout";
import { PortraitFrameSplitLayout } from "./portrait-frame-split-layout";
import { PublicThemeProvider } from "./public-theme-provider";
import { PublicWishlistAnalyticsProvider } from "./public-wishlist-analytics";
import { ScrapbookPolaroidsLayout } from "./scrapbook-polaroids-layout";
import { SELF_CONTAINED_LAYOUT_IDS } from "./self-contained-layouts";
import { SplitImageRightLayout } from "./split-image-right-layout";

export type PublicWishlistMode = "full" | "preview" | "compact";
export type PublicWishlistSurface = "standalone" | "embedded";

type Props = {
	wishlist: PublicWishlistViewModel;
	mode: PublicWishlistMode;
	surface?: PublicWishlistSurface;
	rsvpSection?: ReactNode;
	analyticsRouteVariant?: "public" | "personalized";
};

type LayoutComponentType = (props: {
	wishlist: PublicWishlistViewModel;
	layout: ReturnType<typeof resolveLayout>;
	mode: PublicWishlistMode;
	surface?: PublicWishlistSurface;
	rsvpSection?: ReactNode;
}) => ReturnType<typeof MagazineEditorialLayout>;

const LAYOUT_COMPONENTS: Record<string, LayoutComponentType> = {
	"split-image-right": SplitImageRightLayout,
	"collage-staggered": CollageStaggeredLayout,
	"magazine-editorial": MagazineEditorialLayout,
	"overlap-duo": OverlapDuoLayout,
	"arch-hero-party": ArchHeroPartyLayout,
	"arch-trio": ArchTrioLayout,
	"carousel-hero": CarouselHeroLayout,
	"scrapbook-polaroids": ScrapbookPolaroidsLayout,
	"portrait-frame-split": PortraitFrameSplitLayout,
};

export function PublicWishlistPage({
	wishlist,
	mode,
	surface = "embedded",
	rsvpSection,
	analyticsRouteVariant = "public",
}: Props) {
	const theme = resolveTheme(wishlist.themeId);
	const layout = resolveLayout(wishlist.layoutId);
	const headingFont = resolveHeadingFont(wishlist.headingFont);
	const bodyFont = resolveBodyFont(wishlist.bodyFont);
	const buttonStyle = resolveButtonStyle(wishlist.buttonStyle);
	const motif = resolveMotif(wishlist.motifId);
	const motifTreatment = resolveMotifTreatment(wishlist.motifTreatment);
	const motifPalette = resolveMotifPalette(wishlist.motifPalette);

	const LayoutComponent =
		LAYOUT_COMPONENTS[layout.id] ?? MagazineEditorialLayout;
	const isSelfContainedLayout = SELF_CONTAINED_LAYOUT_IDS.has(layout.id);

	return (
		<PublicWishlistAnalyticsProvider
			enabled={mode === "full" && surface === "standalone"}
			eventType={wishlist.eventType}
			giftCount={wishlist.gifts.length}
			layoutId={layout.id}
			routeVariant={analyticsRouteVariant}
			themeId={theme.id}
			wishlistId={wishlist.id}
			wishlistSlug={wishlist.slug}
		>
			<PublicThemeProvider
				bodyFont={bodyFont}
				buttonStyle={buttonStyle}
				// Embedded previews must not stretch to the full viewport height.
				// Standalone owner previews still use mode="preview", so render surface
				// determines page sizing independently of interaction mode.
				className={
					isSelfContainedLayout
						? surface === "embedded"
							? "min-h-0 bg-background"
							: "bg-background"
						: surface === "embedded"
							? "min-h-0"
							: undefined
				}
				headingFont={headingFont}
				motif={motif}
				motifPalette={motifPalette}
				motifTreatment={motifTreatment}
				theme={theme}
			>
				{motif && (
					<MotifBand
						motif={motif}
						palette={motifPalette}
						position="header"
						treatment={motifTreatment}
					/>
				)}
				{mode === "preview" && (
					<div className="sticky top-0 z-50 border-amber-200 border-b bg-amber-50 px-6 py-3 text-center font-medium text-amber-900 text-sm">
						Vista previa — esta lista aún no es pública
					</div>
				)}
				<LayoutComponent
					layout={layout}
					mode={mode}
					rsvpSection={rsvpSection}
					surface={surface}
					wishlist={wishlist}
				/>
				{mode !== "compact" && (
					<WishlistFooter
						variant={surface === "standalone" ? "expanded" : "compact"}
						wishlistSlug={wishlist.slug}
					/>
				)}
			</PublicThemeProvider>
		</PublicWishlistAnalyticsProvider>
	);
}
