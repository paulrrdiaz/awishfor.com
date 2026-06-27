import type { CSSProperties, ReactNode } from "react";
import type { PublicButtonStylePreset } from "@/config/public-button-styles";
import type { PublicFontPairing } from "@/config/public-fonts";
import type { ThemePreset } from "@/config/public-themes";
import { cn } from "@/lib/utils";

type PublicThemeStyle = CSSProperties & Record<`--${string}`, string>;

type Props = {
	children: ReactNode;
	theme: ThemePreset;
	fontPairing: PublicFontPairing;
	buttonStyle: PublicButtonStylePreset;
	className?: string;
};

export function PublicThemeProvider({
	children,
	theme,
	fontPairing,
	buttonStyle,
	className,
}: Props) {
	const style: PublicThemeStyle = {
		...theme.vars,
		"--radius": "18px",
		"--public-btn-radius": buttonStyle.borderRadius,
		"--public-btn-border-width": buttonStyle.borderWidth,
		"--public-btn-weight": buttonStyle.fontWeight,
	};

	return (
		<div
			className={cn(
				"public-theme min-h-svh bg-background text-foreground",
				className,
			)}
			data-font-pairing={fontPairing.dataAttribute}
			data-theme={theme.id}
			style={style}
		>
			{children}
		</div>
	);
}
