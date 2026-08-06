export type ThemePresetId =
	| "dulce-rosa"
	| "cielo-suave"
	| "cielo-suave-rosa"
	| "jardin-verde"
	| "crema-elegante"
	| "lavanda-fiesta"
	| "clasico-minimal";

export type ThemePresetVars = {
	"--background": string;
	"--foreground": string;
	"--card": string;
	"--card-foreground": string;
	"--popover": string;
	"--popover-foreground": string;
	"--primary": string;
	"--primary-foreground": string;
	"--secondary": string;
	"--secondary-foreground": string;
	"--muted": string;
	"--muted-foreground": string;
	"--accent": string;
	"--accent-foreground": string;
	"--border": string;
	"--input": string;
	"--ring": string;
	"--ph-tint": string;
};

export type ThemePreset = {
	id: ThemePresetId;
	label: string;
	description: string;
	preview: {
		background: string;
		primary: string;
		accent: string;
	};
	vars: ThemePresetVars;
};

export const DEFAULT_THEME_ID = "cielo-suave" satisfies ThemePresetId;

export const PUBLIC_THEME_PRESETS: ThemePreset[] = [
	{
		id: "dulce-rosa",
		label: "Dulce Rosa",
		description:
			"Blush cálido para cumpleaños, bienvenida y listas familiares.",
		preview: {
			background: "#fbf0f2",
			primary: "#e2a0b3",
			accent: "#f5e3e9",
		},
		vars: {
			"--background": "#fbf0f2",
			"--foreground": "#4a3640",
			"--card": "#ffffff",
			"--card-foreground": "#4a3640",
			"--popover": "#ffffff",
			"--popover-foreground": "#4a3640",
			"--primary": "#e2a0b3",
			"--primary-foreground": "#4a2531",
			"--secondary": "#f8d7df",
			"--secondary-foreground": "#6f2c3e",
			"--muted": "#f8edf0",
			"--muted-foreground": "#927581",
			"--accent": "#f5e3e9",
			"--accent-foreground": "#815064",
			"--border": "#f0dce2",
			"--input": "#f0dce2",
			"--ring": "#e2a0b3",
			"--ph-tint": "#f2dce2",
		},
	},
	{
		id: "cielo-suave",
		label: "Cielo Suave",
		description: "Azul nube en una paleta tonal para baby showers y bautizos.",
		preview: {
			background: "#eef5fb",
			primary: "#8fbee0",
			accent: "#dceaf6",
		},
		vars: {
			"--background": "#eef5fb",
			"--foreground": "#33425c",
			"--card": "#ffffff",
			"--card-foreground": "#33425c",
			"--popover": "#ffffff",
			"--popover-foreground": "#33425c",
			"--primary": "#8fbee0",
			"--primary-foreground": "#1b2a40",
			"--secondary": "#dcecff",
			"--secondary-foreground": "#1d4e7f",
			"--muted": "#f2f6fb",
			"--muted-foreground": "#6c7c95",
			"--accent": "#dceaf6",
			"--accent-foreground": "#496781",
			"--border": "#dce7f2",
			"--input": "#dce7f2",
			"--ring": "#8fbee0",
			"--ph-tint": "#dceaf6",
		},
	},
	{
		id: "cielo-suave-rosa",
		label: "Cielo Suave Rosa",
		description: "Variante niña construida con tonos de rosa suave.",
		preview: {
			background: "#fbf1f4",
			primary: "#e6a6bc",
			accent: "#f5e2e9",
		},
		vars: {
			"--background": "#fbf1f4",
			"--foreground": "#4a3845",
			"--card": "#ffffff",
			"--card-foreground": "#4a3845",
			"--popover": "#ffffff",
			"--popover-foreground": "#4a3845",
			"--primary": "#e6a6bc",
			"--primary-foreground": "#4a2533",
			"--secondary": "#ffe0eb",
			"--secondary-foreground": "#7d3553",
			"--muted": "#f8eef1",
			"--muted-foreground": "#927986",
			"--accent": "#f5e2e9",
			"--accent-foreground": "#85556a",
			"--border": "#f1dee5",
			"--input": "#f1dee5",
			"--ring": "#e6a6bc",
			"--ph-tint": "#f2dde6",
		},
	},
	{
		id: "jardin-verde",
		label: "Jardín Verde",
		description:
			"Verde natural para hogar nuevo y celebraciones al aire libre.",
		preview: {
			background: "#eef4ec",
			primary: "#9cc4a0",
			accent: "#dfeedd",
		},
		vars: {
			"--background": "#eef4ec",
			"--foreground": "#34433a",
			"--card": "#ffffff",
			"--card-foreground": "#34433a",
			"--popover": "#ffffff",
			"--popover-foreground": "#34433a",
			"--primary": "#9cc4a0",
			"--primary-foreground": "#22382a",
			"--secondary": "#d8edc9",
			"--secondary-foreground": "#245236",
			"--muted": "#f0f5ee",
			"--muted-foreground": "#6c7e6f",
			"--accent": "#dfeedd",
			"--accent-foreground": "#4f6b54",
			"--border": "#dce7da",
			"--input": "#dce7da",
			"--ring": "#9cc4a0",
			"--ph-tint": "#dde9da",
		},
	},
	{
		id: "crema-elegante",
		label: "Crema Elegante",
		description: "Marfil y dorado discreto para bodas y listas editoriales.",
		preview: {
			background: "#f7f2ea",
			primary: "#bfa06b",
			accent: "#ede3d2",
		},
		vars: {
			"--background": "#f7f2ea",
			"--foreground": "#443d31",
			"--card": "#ffffff",
			"--card-foreground": "#443d31",
			"--popover": "#ffffff",
			"--popover-foreground": "#443d31",
			"--primary": "#bfa06b",
			"--primary-foreground": "#332b18",
			"--secondary": "#ead9ad",
			"--secondary-foreground": "#4c3a16",
			"--muted": "#f4eee3",
			"--muted-foreground": "#8a7e68",
			"--accent": "#ede3d2",
			"--accent-foreground": "#6e5b38",
			"--border": "#e7dcc8",
			"--input": "#e7dcc8",
			"--ring": "#bfa06b",
			"--ph-tint": "#ebe1ce",
		},
	},
	{
		id: "lavanda-fiesta",
		label: "Lavanda Fiesta",
		description: "Lavanda expresiva para cumpleaños, shower y regalos lúdicos.",
		preview: {
			background: "#f3effa",
			primary: "#b79ce0",
			accent: "#ebe3f5",
		},
		vars: {
			"--background": "#f3effa",
			"--foreground": "#3e3654",
			"--card": "#ffffff",
			"--card-foreground": "#3e3654",
			"--popover": "#ffffff",
			"--popover-foreground": "#3e3654",
			"--primary": "#b79ce0",
			"--primary-foreground": "#2c2342",
			"--secondary": "#eadfff",
			"--secondary-foreground": "#4d3281",
			"--muted": "#f4effa",
			"--muted-foreground": "#7a6f92",
			"--accent": "#ebe3f5",
			"--accent-foreground": "#62537a",
			"--border": "#e4daf2",
			"--input": "#e4daf2",
			"--ring": "#b79ce0",
			"--ph-tint": "#e6dbf5",
		},
	},
	{
		id: "clasico-minimal",
		label: "Clásico Minimal",
		description:
			"Blanco cálido, tinta sobria y líneas limpias para cualquier lista.",
		preview: {
			background: "#fafaf8",
			primary: "#2a2a28",
			accent: "#efefec",
		},
		vars: {
			"--background": "#fafaf8",
			"--foreground": "#1f1f1d",
			"--card": "#ffffff",
			"--card-foreground": "#1f1f1d",
			"--popover": "#ffffff",
			"--popover-foreground": "#1f1f1d",
			"--primary": "#2a2a28",
			"--primary-foreground": "#ffffff",
			"--secondary": "#ece7dd",
			"--secondary-foreground": "#343a46",
			"--muted": "#f4f4f1",
			"--muted-foreground": "#77756e",
			"--accent": "#efefec",
			"--accent-foreground": "#3a3a36",
			"--border": "#e4e4df",
			"--input": "#e4e4df",
			"--ring": "#2a2a28",
			"--ph-tint": "#ecece8",
		},
	},
];

const themesById = new Map(
	PUBLIC_THEME_PRESETS.map((theme) => [theme.id, theme]),
);

export function resolveTheme(id: string | null | undefined): ThemePreset {
	return themesById.get(id as ThemePresetId) ?? resolveTheme(DEFAULT_THEME_ID);
}

export function getAllThemes(): ThemePreset[] {
	return PUBLIC_THEME_PRESETS;
}
