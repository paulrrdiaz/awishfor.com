import type { CSSProperties, ReactNode } from "react";
import type {
	MotifPalette,
	MotifPreset,
	MotifTreatment,
} from "@/config/motifs";
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
	motif?: MotifPreset | null;
	motifTreatment?: MotifTreatment;
	motifPalette?: MotifPalette;
	className?: string;
};

export function PublicThemeProvider({
	children,
	theme,
	headingFont,
	bodyFont,
	buttonStyle,
	motif = null,
	motifTreatment,
	motifPalette,
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

	if (motif) {
		const isThemed = motifPalette === "themed";
		style["--m1"] = isThemed ? "var(--primary)" : motif.colors.m1;
		style["--m2"] = isThemed ? "var(--accent)" : motif.colors.m2;
		style["--m3"] = isThemed ? "var(--foreground)" : motif.colors.m3;
		if (motif.colors.mc1) {
			style["--mc1"] = motif.colors.mc1;
		}
		style["--motif-m3-inverted"] = motif.m3Inverted;
	}

	return (
		<div
			className={cn(
				"public-theme min-h-svh bg-background text-foreground",
				className,
			)}
			data-btn-variant={buttonStyle.variant}
			data-motif={motif?.id}
			data-motif-treatment={motif ? (motifTreatment ?? "scene") : undefined}
			data-theme={theme.id}
			style={style}
		>
			{children}
		</div>
	);
}
