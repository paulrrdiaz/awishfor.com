import type { Preview } from "@storybook/nextjs-vite";
import type { ReactNode } from "react";
import { PublicThemeProvider } from "../src/components/layouts/public-wishlist/public-theme-provider";
import { resolveButtonStyle } from "../src/config/public-button-styles";
import {
	resolveBodyFont,
	resolveHeadingFont,
} from "../src/config/public-fonts";
import {
	DEFAULT_THEME_ID,
	getAllThemes,
	resolveTheme,
} from "../src/config/public-themes";
import "../src/styles/globals.css";

const themeItems = getAllThemes().map((theme) => ({
	value: theme.id,
	title: theme.label,
}));

const preview: Preview = {
	globalTypes: {
		theme: {
			description: "Public theme preset",
			toolbar: {
				title: "Theme",
				icon: "paintbrush",
				items: themeItems,
				dynamicTitle: true,
			},
		},
	},
	initialGlobals: {
		theme: DEFAULT_THEME_ID,
	},
	parameters: {
		nextjs: {
			appDirectory: true,
		},
		docs: {
			autodocs: true,
		},
	},
	decorators: [
		(Story, context) => {
			const themeId =
				typeof context.globals.theme === "string"
					? context.globals.theme
					: DEFAULT_THEME_ID;

			return (
				<PublicThemeProvider
					bodyFont={resolveBodyFont(null)}
					buttonStyle={resolveButtonStyle("pill")}
					className="min-h-screen p-6"
					headingFont={resolveHeadingFont(null)}
					theme={resolveTheme(themeId)}
				>
					<div className="mx-auto max-w-5xl">
						<Story />
					</div>
				</PublicThemeProvider>
			) as ReactNode;
		},
	],
};

export default preview;
