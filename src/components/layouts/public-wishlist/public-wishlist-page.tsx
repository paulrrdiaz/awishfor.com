import type { CSSProperties } from "react";
import { resolveButtonStyle } from "@/config/public-button-styles";
import { resolveFontPairing } from "@/config/public-fonts";
import { resolveLayout } from "@/config/public-layouts";
import { resolveTheme } from "@/config/public-themes";
import type { PublicWishlistViewModel } from "@/server/mappers/view-models";
import { EditorialWishlistLayout } from "./editorial-wishlist-layout";
import { GridWishlistLayout } from "./grid-wishlist-layout";
import { MinimalWishlistLayout } from "./minimal-wishlist-layout";

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

	const themeVars = Object.entries(theme.vars).reduce<Record<string, string>>(
		(acc, [key, value]) => {
			acc[key] = value;
			return acc;
		},
		{},
	);

	const buttonVars: Record<string, string> = {
		"--public-btn-radius": buttonStyle.borderRadius,
		"--public-btn-border-width": buttonStyle.borderWidth,
		"--public-btn-weight": buttonStyle.fontWeight,
	};

	const inlineStyle = { ...themeVars, ...buttonVars } as CSSProperties;

	const LayoutComponent =
		layout.id === "editorial"
			? EditorialWishlistLayout
			: layout.id === "minimal"
				? MinimalWishlistLayout
				: GridWishlistLayout;

	return (
		<div
			className={`${fontPairing.heading.className} ${fontPairing.body.className} min-h-svh`}
			style={{
				...inlineStyle,
				backgroundColor: "var(--public-bg)",
				color: "var(--public-text)",
				fontFamily: "var(--public-font-body)",
			}}
		>
			{mode === "preview" && (
				<div
					className="sticky top-0 z-50 px-6 py-3 text-center font-medium text-sm"
					style={{
						backgroundColor: "#fefce8",
						color: "#854d0e",
						borderBottom: "1px solid #fde68a",
					}}
				>
					Vista previa — esta lista aún no es pública
				</div>
			)}
			<LayoutComponent layout={layout} mode={mode} wishlist={wishlist} />
		</div>
	);
}
