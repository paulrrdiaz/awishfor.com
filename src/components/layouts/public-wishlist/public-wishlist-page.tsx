import { resolveButtonStyle } from "@/config/public-button-styles";
import { resolveBodyFont, resolveHeadingFont } from "@/config/public-fonts";
import { resolveLayout } from "@/config/public-layouts";
import { resolveTheme } from "@/config/public-themes";
import type { PublicWishlistViewModel } from "@/server/mappers/view-models";
import { ArchHeroPartyLayout } from "./arch-hero-party-layout";
import { ArchSplitLayout } from "./arch-split-layout";
import { ArchTrioLayout } from "./arch-trio-layout";
import { CarouselHeroLayout } from "./carousel-hero-layout";
import { CollageStaggeredLayout } from "./collage-staggered-layout";
import { DiagonalDuoLayout } from "./diagonal-duo-layout";
import { EditorialWishlistLayout } from "./editorial-wishlist-layout";
import { GridWishlistLayout } from "./grid-wishlist-layout";
import { HeroCinematicLayout } from "./hero-cinematic-layout";
import { MagazineEditorialLayout } from "./magazine-editorial-layout";
import { MinimalWishlistLayout } from "./minimal-wishlist-layout";
import { OverlapDuoLayout } from "./overlap-duo-layout";
import { PanoramicBandLayout } from "./panoramic-band-layout";
import { PortraitFrameSplitLayout } from "./portrait-frame-split-layout";
import { PublicThemeProvider } from "./public-theme-provider";
import { ScrapbookPolaroidsLayout } from "./scrapbook-polaroids-layout";
import { SplitImageRightLayout } from "./split-image-right-layout";
import { WeddingFormalLayout } from "./wedding-formal-layout";

export type PublicWishlistMode = "full" | "preview" | "compact";

type Props = {
	wishlist: PublicWishlistViewModel;
	mode: PublicWishlistMode;
};

type LayoutComponentType = typeof GridWishlistLayout;

const LAYOUT_COMPONENTS: Record<string, LayoutComponentType> = {
	"hero-cinematic": HeroCinematicLayout,
	"split-image-right": SplitImageRightLayout,
	"arch-split": ArchSplitLayout,
	"collage-staggered": CollageStaggeredLayout,
	"magazine-editorial": MagazineEditorialLayout,
	"overlap-duo": OverlapDuoLayout,
	"arch-hero-party": ArchHeroPartyLayout,
	"arch-trio": ArchTrioLayout,
	"wedding-formal": WeddingFormalLayout,
	"panoramic-band": PanoramicBandLayout,
	"carousel-hero": CarouselHeroLayout,
	"diagonal-duo": DiagonalDuoLayout,
	"scrapbook-polaroids": ScrapbookPolaroidsLayout,
	"portrait-frame-split": PortraitFrameSplitLayout,
	editorial: EditorialWishlistLayout,
	minimal: MinimalWishlistLayout,
	grid: GridWishlistLayout,
};

export function PublicWishlistPage({ wishlist, mode }: Props) {
	const theme = resolveTheme(wishlist.themeId);
	const layout = resolveLayout(wishlist.layoutId);
	const headingFont = resolveHeadingFont(
		wishlist.headingFont,
		wishlist.fontPairing,
	);
	const bodyFont = resolveBodyFont(wishlist.bodyFont, wishlist.fontPairing);
	const buttonStyle = resolveButtonStyle(wishlist.buttonStyle);

	const LayoutComponent = LAYOUT_COMPONENTS[layout.id] ?? GridWishlistLayout;

	return (
		<PublicThemeProvider
			bodyFont={bodyFont}
			buttonStyle={buttonStyle}
			// Compact is an embedded preview (e.g. the marketing example); it must
			// not stretch to the full viewport height like a standalone page.
			className={mode === "compact" ? "min-h-0" : undefined}
			headingFont={headingFont}
			theme={theme}
		>
			{mode === "preview" && (
				<div className="sticky top-0 z-50 border-amber-200 border-b bg-amber-50 px-6 py-3 text-center font-medium text-amber-900 text-sm">
					Vista previa — esta lista aún no es pública
				</div>
			)}
			<LayoutComponent layout={layout} mode={mode} wishlist={wishlist} />
		</PublicThemeProvider>
	);
}
