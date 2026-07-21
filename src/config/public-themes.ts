export type ThemePresetId =
	| "dulce-rosa"
	| "cielo-suave"
	| "cielo-suave-rosa"
	| "jardin-verde"
	| "crema-elegante"
	| "lavanda-fiesta"
	| "clasico-minimal"
	| "terracota-calida"
	| "menta-fresca"
	| "noche-azul"
	| "sol-dorado"
	| "coral-vivo";

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
	{
		id: "terracota-calida",
		label: "Terracota Cálida",
		description: "Arcilla y durazno cálidos para celebraciones acogedoras.",
		preview: {
			background: "#fdf5f0",
			primary: "#a34d2c",
			accent: "#e8b78f",
		},
		vars: {
			"--background": "#fdf5f0",
			"--foreground": "#402a1f",
			"--card": "#ffffff",
			"--card-foreground": "#402a1f",
			"--popover": "#ffffff",
			"--popover-foreground": "#402a1f",
			"--primary": "#a34d2c",
			"--primary-foreground": "#fff6f0",
			"--secondary": "#f3ddd0",
			"--secondary-foreground": "#6b3a24",
			"--muted": "#f7ece3",
			"--muted-foreground": "#8a6650",
			"--accent": "#e8b78f",
			"--accent-foreground": "#4a2c17",
			"--border": "#ecd7c8",
			"--input": "#ecd7c8",
			"--ring": "#a34d2c",
		},
	},
	{
		id: "menta-fresca",
		label: "Menta Fresca",
		description: "Verde menta ligero para listas frescas y primaverales.",
		preview: {
			background: "#f0faf6",
			primary: "#1f7a5f",
			accent: "#b7e8d3",
		},
		vars: {
			"--background": "#f0faf6",
			"--foreground": "#163d34",
			"--card": "#ffffff",
			"--card-foreground": "#163d34",
			"--popover": "#ffffff",
			"--popover-foreground": "#163d34",
			"--primary": "#1f7a5f",
			"--primary-foreground": "#f2fffb",
			"--secondary": "#d3f0e4",
			"--secondary-foreground": "#1f5c49",
			"--muted": "#e3f5ed",
			"--muted-foreground": "#5c8377",
			"--accent": "#b7e8d3",
			"--accent-foreground": "#1c4a3b",
			"--border": "#cbe9dc",
			"--input": "#cbe9dc",
			"--ring": "#1f7a5f",
		},
	},
	{
		id: "noche-azul",
		label: "Noche Azul",
		description: "Azul marino profundo para bodas y galas elegantes.",
		preview: {
			background: "#f5f7fb",
			primary: "#1e3a5f",
			accent: "#c3d3e8",
		},
		vars: {
			"--background": "#f5f7fb",
			"--foreground": "#1a2436",
			"--card": "#ffffff",
			"--card-foreground": "#1a2436",
			"--popover": "#ffffff",
			"--popover-foreground": "#1a2436",
			"--primary": "#1e3a5f",
			"--primary-foreground": "#ffffff",
			"--secondary": "#dde5f0",
			"--secondary-foreground": "#2c3e58",
			"--muted": "#e9edf5",
			"--muted-foreground": "#62748d",
			"--accent": "#c3d3e8",
			"--accent-foreground": "#24344c",
			"--border": "#d8e0ee",
			"--input": "#d8e0ee",
			"--ring": "#1e3a5f",
		},
	},
	{
		id: "sol-dorado",
		label: "Sol Dorado",
		description: "Amarillo cálido y dorado para celebraciones luminosas.",
		preview: {
			background: "#fdf9ec",
			primary: "#c99a1e",
			accent: "#ecd06a",
		},
		vars: {
			"--background": "#fdf9ec",
			"--foreground": "#3d2f0d",
			"--card": "#ffffff",
			"--card-foreground": "#3d2f0d",
			"--popover": "#ffffff",
			"--popover-foreground": "#3d2f0d",
			"--primary": "#c99a1e",
			"--primary-foreground": "#3d2f0d",
			"--secondary": "#f5e6b8",
			"--secondary-foreground": "#5c4813",
			"--muted": "#f7f0d9",
			"--muted-foreground": "#8a7645",
			"--accent": "#ecd06a",
			"--accent-foreground": "#4a3a0c",
			"--border": "#f0e2b0",
			"--input": "#f0e2b0",
			"--ring": "#c99a1e",
		},
	},
	{
		id: "coral-vivo",
		label: "Coral Vivo",
		description: "Coral vibrante para cumpleaños y regalos lúdicos.",
		preview: {
			background: "#fff5f3",
			primary: "#c23f28",
			accent: "#f4a58e",
		},
		vars: {
			"--background": "#fff5f3",
			"--foreground": "#451f1a",
			"--card": "#ffffff",
			"--card-foreground": "#451f1a",
			"--popover": "#ffffff",
			"--popover-foreground": "#451f1a",
			"--primary": "#c23f28",
			"--primary-foreground": "#fff8f6",
			"--secondary": "#fbdad2",
			"--secondary-foreground": "#7a3226",
			"--muted": "#fce8e3",
			"--muted-foreground": "#93695f",
			"--accent": "#f4a58e",
			"--accent-foreground": "#5c2317",
			"--border": "#f6d5cb",
			"--input": "#f6d5cb",
			"--ring": "#c23f28",
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
