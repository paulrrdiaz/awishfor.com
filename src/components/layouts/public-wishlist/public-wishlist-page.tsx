import { resolveButtonStyle } from "@/config/public-button-styles";
import { resolveFontPairing } from "@/config/public-fonts";
import { resolveLayout } from "@/config/public-layouts";
import { resolveTheme } from "@/config/public-themes";
import type { PublicWishlistViewModel } from "@/server/mappers/view-models";
import { EditorialWishlistLayout } from "./editorial-wishlist-layout";
import { GridWishlistLayout } from "./grid-wishlist-layout";
import { MinimalWishlistLayout } from "./minimal-wishlist-layout";
import { PublicThemeProvider } from "./public-theme-provider";

export type PublicWishlistMode = "full" | "preview" | "compact";

type Props = {
	wishlist: PublicWishlistViewModel;
	mode: PublicWishlistMode;
};

export function PublicWishlistPage({ wishlist, mode }: Props) {
	const theme = resolveTheme(wishlist.themeId);
	const layout = resolveLayout(wishlist.layoutId);
	const fontPairing = resolveFontPairing(wishlist.fontPairing);
	const buttonStyle = resolveButtonStyle(wishlist.buttonStyle);

	const LayoutComponent =
		layout.id === "editorial"
			? EditorialWishlistLayout
			: layout.id === "minimal"
				? MinimalWishlistLayout
				: GridWishlistLayout;

	return (
		<PublicThemeProvider
			buttonStyle={buttonStyle}
			// Compact is an embedded preview (e.g. the marketing example); it must
			// not stretch to the full viewport height like a standalone page.
			className={mode === "compact" ? "min-h-0" : undefined}
			fontPairing={fontPairing}
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
