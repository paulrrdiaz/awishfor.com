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
			background: "#fff7f8",
			primary: "#d65b78",
			accent: "#f8d7df",
		},
		vars: {
			"--background": "#fff7f8",
			"--foreground": "#3a1f29",
			"--card": "#ffffff",
			"--card-foreground": "#3a1f29",
			"--popover": "#ffffff",
			"--popover-foreground": "#3a1f29",
			"--primary": "#d65b78",
			"--primary-foreground": "#fff7f8",
			"--secondary": "#f8d7df",
			"--secondary-foreground": "#6f2c3e",
			"--muted": "#fde8ed",
			"--muted-foreground": "#8a5c68",
			"--accent": "#f2b6c7",
			"--accent-foreground": "#5c2537",
			"--border": "#f0cbd4",
			"--input": "#f0cbd4",
			"--ring": "#d65b78",
		},
	},
	{
		id: "cielo-suave",
		label: "Cielo Suave",
		description: "Azul nube con acento marfil para baby showers y bautizos.",
		preview: {
			background: "#f3f8ff",
			primary: "#4d8fcf",
			accent: "#fff3d6",
		},
		vars: {
			"--background": "#f3f8ff",
			"--foreground": "#17304a",
			"--card": "#ffffff",
			"--card-foreground": "#17304a",
			"--popover": "#ffffff",
			"--popover-foreground": "#17304a",
			"--primary": "#4d8fcf",
			"--primary-foreground": "#f9fcff",
			"--secondary": "#dcecff",
			"--secondary-foreground": "#1d4e7f",
			"--muted": "#e8f2fb",
			"--muted-foreground": "#607a93",
			"--accent": "#fff3d6",
			"--accent-foreground": "#6d4c12",
			"--border": "#c9dff2",
			"--input": "#c9dff2",
			"--ring": "#4d8fcf",
		},
	},
	{
		id: "cielo-suave-rosa",
		label: "Cielo Suave Rosa",
		description: "Variante niña en rosa suave con el mismo acento marfil.",
		preview: {
			background: "#fff6fa",
			primary: "#d96f9a",
			accent: "#fff3d6",
		},
		vars: {
			"--background": "#fff6fa",
			"--foreground": "#3d2330",
			"--card": "#ffffff",
			"--card-foreground": "#3d2330",
			"--popover": "#ffffff",
			"--popover-foreground": "#3d2330",
			"--primary": "#d96f9a",
			"--primary-foreground": "#fff8fb",
			"--secondary": "#ffe0eb",
			"--secondary-foreground": "#7d3553",
			"--muted": "#fdeaf1",
			"--muted-foreground": "#8a6172",
			"--accent": "#fff3d6",
			"--accent-foreground": "#6d4c12",
			"--border": "#f3cddc",
			"--input": "#f3cddc",
			"--ring": "#d96f9a",
		},
	},
	{
		id: "jardin-verde",
		label: "Jardín Verde",
		description:
			"Verde natural para hogar nuevo y celebraciones al aire libre.",
		preview: {
			background: "#f1f7ec",
			primary: "#3d7a4e",
			accent: "#d8edc9",
		},
		vars: {
			"--background": "#f1f7ec",
			"--foreground": "#173e29",
			"--card": "#fbfff8",
			"--card-foreground": "#173e29",
			"--popover": "#fbfff8",
			"--popover-foreground": "#173e29",
			"--primary": "#3d7a4e",
			"--primary-foreground": "#f8fff3",
			"--secondary": "#d8edc9",
			"--secondary-foreground": "#245236",
			"--muted": "#e4efdb",
			"--muted-foreground": "#5e7865",
			"--accent": "#c9eb7a",
			"--accent-foreground": "#284315",
			"--border": "#cbdcc3",
			"--input": "#cbdcc3",
			"--ring": "#3d7a4e",
		},
	},
	{
		id: "crema-elegante",
		label: "Crema Elegante",
		description: "Marfil y dorado discreto para bodas y listas editoriales.",
		preview: {
			background: "#fbf6ea",
			primary: "#9c7a2e",
			accent: "#ead9ad",
		},
		vars: {
			"--background": "#fbf6ea",
			"--foreground": "#332817",
			"--card": "#fffdf6",
			"--card-foreground": "#332817",
			"--popover": "#fffdf6",
			"--popover-foreground": "#332817",
			"--primary": "#9c7a2e",
			"--primary-foreground": "#fff9e8",
			"--secondary": "#ead9ad",
			"--secondary-foreground": "#4c3a16",
			"--muted": "#f1e7cf",
			"--muted-foreground": "#827150",
			"--accent": "#d7b85f",
			"--accent-foreground": "#332817",
			"--border": "#e2d3b3",
			"--input": "#e2d3b3",
			"--ring": "#9c7a2e",
		},
	},
	{
		id: "lavanda-fiesta",
		label: "Lavanda Fiesta",
		description: "Lavanda expresiva para cumpleaños, shower y regalos lúdicos.",
		preview: {
			background: "#f8f3ff",
			primary: "#875bd6",
			accent: "#ffd166",
		},
		vars: {
			"--background": "#f8f3ff",
			"--foreground": "#2d2142",
			"--card": "#ffffff",
			"--card-foreground": "#2d2142",
			"--popover": "#ffffff",
			"--popover-foreground": "#2d2142",
			"--primary": "#875bd6",
			"--primary-foreground": "#fbf8ff",
			"--secondary": "#eadfff",
			"--secondary-foreground": "#4d3281",
			"--muted": "#efe7fb",
			"--muted-foreground": "#75688c",
			"--accent": "#ffd166",
			"--accent-foreground": "#4f3500",
			"--border": "#ddd0f2",
			"--input": "#ddd0f2",
			"--ring": "#875bd6",
		},
	},
	{
		id: "clasico-minimal",
		label: "Clásico Minimal",
		description:
			"Blanco cálido, tinta sobria y líneas limpias para cualquier lista.",
		preview: {
			background: "#fbfaf7",
			primary: "#1f2937",
			accent: "#e5e0d6",
		},
		vars: {
			"--background": "#fbfaf7",
			"--foreground": "#1f2937",
			"--card": "#ffffff",
			"--card-foreground": "#1f2937",
			"--popover": "#ffffff",
			"--popover-foreground": "#1f2937",
			"--primary": "#1f2937",
			"--primary-foreground": "#ffffff",
			"--secondary": "#ece7dd",
			"--secondary-foreground": "#343a46",
			"--muted": "#f0ede7",
			"--muted-foreground": "#6b7280",
			"--accent": "#d8d1c4",
			"--accent-foreground": "#343a46",
			"--border": "#ded8cc",
			"--input": "#ded8cc",
			"--ring": "#1f2937",
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
