export type PublicThemePreset = {
	id: string;
	label: string;
	vars: Record<string, string>;
};

const linen: PublicThemePreset = {
	id: "linen",
	label: "Linen",
	vars: {
		"--public-bg": "#faf8f5",
		"--public-surface": "#f5f1ec",
		"--public-text": "#2c2521",
		"--public-text-muted": "#7a6f68",
		"--public-accent": "#b87c5c",
		"--public-border": "#e0d8cf",
	},
};

const themes: Record<string, PublicThemePreset> = {
	linen,
	midnight: {
		id: "midnight",
		label: "Midnight",
		vars: {
			"--public-bg": "#0f1117",
			"--public-surface": "#1a1d27",
			"--public-text": "#f0f0f2",
			"--public-text-muted": "#9395a5",
			"--public-accent": "#7c6ff5",
			"--public-border": "#2c2f3e",
		},
	},
	sky: {
		id: "sky",
		label: "Sky",
		vars: {
			"--public-bg": "#f0f7ff",
			"--public-surface": "#e2f0fd",
			"--public-text": "#1a2e42",
			"--public-text-muted": "#6a88a3",
			"--public-accent": "#2c80c8",
			"--public-border": "#c5dff5",
		},
	},
	rose: {
		id: "rose",
		label: "Rose",
		vars: {
			"--public-bg": "#fff5f6",
			"--public-surface": "#fde8eb",
			"--public-text": "#3d1a1e",
			"--public-text-muted": "#a0636b",
			"--public-accent": "#d94f5c",
			"--public-border": "#f5cdd2",
		},
	},
	sage: {
		id: "sage",
		label: "Sage",
		vars: {
			"--public-bg": "#f3f7f3",
			"--public-surface": "#e4ede4",
			"--public-text": "#1c2e1c",
			"--public-text-muted": "#5e7d5e",
			"--public-accent": "#3a7a3a",
			"--public-border": "#c4d9c4",
		},
	},
	gold: {
		id: "gold",
		label: "Gold",
		vars: {
			"--public-bg": "#fdf8ee",
			"--public-surface": "#f7efda",
			"--public-text": "#2e2510",
			"--public-text-muted": "#8a7850",
			"--public-accent": "#b8922a",
			"--public-border": "#e8d9ae",
		},
	},
};

export function resolveTheme(id: string | null | undefined): PublicThemePreset {
	return themes[id ?? ""] ?? linen;
}
