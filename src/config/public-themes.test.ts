import { describe, expect, it } from "vitest";

import {
	getAllThemes,
	type ThemePresetId,
	type ThemePresetVars,
} from "./public-themes";

const EXPECTED_TOKEN_NAMES = [
	"--background",
	"--foreground",
	"--card",
	"--card-foreground",
	"--primary",
	"--primary-foreground",
	"--accent",
	"--accent-foreground",
	"--muted",
	"--muted-foreground",
	"--border",
] as const;

type ExpectedTokenName = (typeof EXPECTED_TOKEN_NAMES)[number];

const EXPECTED_TOKENS: Record<
	ThemePresetId,
	Pick<ThemePresetVars, ExpectedTokenName>
> = {
	"cielo-suave": {
		"--background": "#EEF5FB",
		"--foreground": "#33425C",
		"--card": "#FFFFFF",
		"--card-foreground": "#33425C",
		"--primary": "#8FBEE0",
		"--primary-foreground": "#1B2A40",
		"--accent": "#DCEAF6",
		"--accent-foreground": "#496781",
		"--muted": "#F2F6FB",
		"--muted-foreground": "#6C7C95",
		"--border": "#DCE7F2",
	},
	"dulce-rosa": {
		"--background": "#FBF0F2",
		"--foreground": "#4A3640",
		"--card": "#FFFFFF",
		"--card-foreground": "#4A3640",
		"--primary": "#E2A0B3",
		"--primary-foreground": "#4A2531",
		"--accent": "#F5E3E9",
		"--accent-foreground": "#815064",
		"--muted": "#F8EDF0",
		"--muted-foreground": "#927581",
		"--border": "#F0DCE2",
	},
	"cielo-suave-rosa": {
		"--background": "#FBF1F4",
		"--foreground": "#4A3845",
		"--card": "#FFFFFF",
		"--card-foreground": "#4A3845",
		"--primary": "#E6A6BC",
		"--primary-foreground": "#4A2533",
		"--accent": "#F5E2E9",
		"--accent-foreground": "#85556A",
		"--muted": "#F8EEF1",
		"--muted-foreground": "#927986",
		"--border": "#F1DEE5",
	},
	"jardin-verde": {
		"--background": "#EEF4EC",
		"--foreground": "#34433A",
		"--card": "#FFFFFF",
		"--card-foreground": "#34433A",
		"--primary": "#9CC4A0",
		"--primary-foreground": "#22382A",
		"--accent": "#DFEEDD",
		"--accent-foreground": "#4F6B54",
		"--muted": "#F0F5EE",
		"--muted-foreground": "#6C7E6F",
		"--border": "#DCE7DA",
	},
	"crema-elegante": {
		"--background": "#F7F2EA",
		"--foreground": "#443D31",
		"--card": "#FFFFFF",
		"--card-foreground": "#443D31",
		"--primary": "#BFA06B",
		"--primary-foreground": "#332B18",
		"--accent": "#EDE3D2",
		"--accent-foreground": "#6E5B38",
		"--muted": "#F4EEE3",
		"--muted-foreground": "#8A7E68",
		"--border": "#E7DCC8",
	},
	"lavanda-fiesta": {
		"--background": "#F3EFFA",
		"--foreground": "#3E3654",
		"--card": "#FFFFFF",
		"--card-foreground": "#3E3654",
		"--primary": "#B79CE0",
		"--primary-foreground": "#2C2342",
		"--accent": "#EBE3F5",
		"--accent-foreground": "#62537A",
		"--muted": "#F4EFFA",
		"--muted-foreground": "#7A6F92",
		"--border": "#E4DAF2",
	},
	"clasico-minimal": {
		"--background": "#FAFAF8",
		"--foreground": "#1F1F1D",
		"--card": "#FFFFFF",
		"--card-foreground": "#1F1F1D",
		"--primary": "#2A2A28",
		"--primary-foreground": "#FFFFFF",
		"--accent": "#EFEFEC",
		"--accent-foreground": "#3A3A36",
		"--muted": "#F4F4F1",
		"--muted-foreground": "#77756E",
		"--border": "#E4E4DF",
	},
};

function relativeLuminance(hex: string) {
	const channels = hex
		.match(/[a-f\d]{2}/gi)
		?.map((channel) => Number.parseInt(channel, 16));
	if (channels?.length !== 3) {
		throw new Error(`Expected a six-digit hex color, received ${hex}`);
	}

	const [red = 0, green = 0, blue = 0] = channels.map((channel) => {
		const value = channel / 255;
		return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
	});

	return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(first: string, second: string) {
	const [lighter = 0, darker = 0] = [
		relativeLuminance(first),
		relativeLuminance(second),
	].sort((a, b) => b - a);

	return (lighter + 0.05) / (darker + 0.05);
}

describe("public theme presets", () => {
	const themes = getAllThemes();

	it("matches the approved token table case-insensitively", () => {
		for (const theme of themes) {
			for (const token of EXPECTED_TOKEN_NAMES) {
				expect(theme.vars[token].toLowerCase(), `${theme.id} ${token}`).toBe(
					EXPECTED_TOKENS[theme.id][token].toLowerCase(),
				);
			}
		}
	});

	it("derives shadcn tokens from their specified sources", () => {
		for (const theme of themes) {
			expect(theme.vars["--popover"]).toBe(theme.vars["--card"]);
			expect(theme.vars["--popover-foreground"]).toBe(
				theme.vars["--card-foreground"],
			);
			expect(theme.vars["--input"]).toBe(theme.vars["--border"]);
			expect(theme.vars["--ring"]).toBe(theme.vars["--primary"]);
		}
	});

	it("defines a placeholder tint for every preset", () => {
		for (const theme of themes) {
			expect(theme.vars["--ph-tint"].trim(), theme.id).not.toBe("");
		}
	});

	it("keeps preview swatches aligned with their theme tokens", () => {
		for (const theme of themes) {
			expect(theme.preview.background).toBe(theme.vars["--background"]);
			expect(theme.preview.primary).toBe(theme.vars["--primary"]);
			expect(theme.preview.accent).toBe(theme.vars["--accent"]);
		}
	});

	it("meets 4.5:1 contrast for foreground, primary, and accent labels", () => {
		for (const theme of themes) {
			expect(
				contrastRatio(theme.vars["--foreground"], theme.vars["--background"]),
				`${theme.id} foreground on background`,
			).toBeGreaterThanOrEqual(4.5);
			expect(
				contrastRatio(
					theme.vars["--primary-foreground"],
					theme.vars["--primary"],
				),
				`${theme.id} primary foreground on primary`,
			).toBeGreaterThanOrEqual(4.5);
			expect(
				contrastRatio(
					theme.vars["--accent-foreground"],
					theme.vars["--accent"],
				),
				`${theme.id} accent foreground on accent`,
			).toBeGreaterThanOrEqual(4.5);
		}
	});
});
