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
import { ScrapbookPolaroidsLayout } from "./scrapbook-polaroids-layout";
import { SplitImageRightLayout } from "./split-image-right-layout";

export type PublicWishlistMode = "full" | "preview" | "compact";

type Props = {
	wishlist: PublicWishlistViewModel;
	mode: PublicWishlistMode;
};

type LayoutComponentType = typeof MagazineEditorialLayout;

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

export function PublicWishlistPage({ wishlist, mode }: Props) {
	const theme = resolveTheme(wishlist.themeId);
	const layout = resolveLayout(wishlist.layoutId);
	const headingFont = resolveHeadingFont(wishlist.headingFont);
	const bodyFont = resolveBodyFont(wishlist.bodyFont);
	const buttonStyle = resolveButtonStyle(wishlist.buttonStyle);

	const LayoutComponent =
		LAYOUT_COMPONENTS[layout.id] ?? MagazineEditorialLayout;

	return (
		<PublicThemeProvider
			bodyFont={bodyFont}
			buttonStyle={buttonStyle}
			// Compact and preview are embedded previews (marketing example, wizard
			// steps); they must not stretch to the full viewport height like a
			// standalone page — only "full" (the real public route) should.
			className={mode !== "full" ? "min-h-0" : undefined}
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
