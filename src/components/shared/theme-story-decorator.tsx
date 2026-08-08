import type { CSSProperties, ReactElement } from "react";
import { resolveTheme, type ThemePresetId } from "@/config/public-themes";

/**
 * Wraps a story in a theme preset's CSS custom properties, mirroring
 * `PublicThemeProvider`, so Storybook can demonstrate that a component's
 * color comes entirely from theme tokens rather than hardcoded values.
 */
export function withThemeVars(themeId: ThemePresetId) {
	const theme = resolveTheme(themeId);

	return (Story: () => ReactElement) => (
		<div
			className="bg-background p-8 text-foreground"
			style={theme.vars as CSSProperties}
		>
			<Story />
		</div>
	);
}
