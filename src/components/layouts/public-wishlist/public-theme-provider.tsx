import type { CSSProperties, ReactNode } from "react";
import type { PublicButtonStylePreset } from "@/config/public-button-styles";
import type { PublicFontOption } from "@/config/public-fonts";
import type { ThemePreset } from "@/config/public-themes";
import { cn } from "@/lib/utils";

type PublicThemeStyle = CSSProperties & Record<`--${string}`, string>;

type Props = {
	children: ReactNode;
	theme: ThemePreset;
	headingFont: PublicFontOption;
	bodyFont: PublicFontOption;
	buttonStyle: PublicButtonStylePreset;
	className?: string;
};

export function PublicThemeProvider({
	children,
	theme,
	headingFont,
	bodyFont,
	buttonStyle,
	className,
}: Props) {
	const style: PublicThemeStyle = {
		...theme.vars,
		"--radius": "18px",
		"--public-font-heading": `var(${headingFont.cssVariable}), ${headingFont.fallback}`,
		"--public-font-body": `var(${bodyFont.cssVariable}), ${bodyFont.fallback}`,
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
			data-btn-variant={buttonStyle.variant}
			data-theme={theme.id}
			style={style}
		>
			{children}
		</div>
	);
}
