import type { CSSProperties } from "react";

type Gift = {
	name: string;
	price: string;
	badge: "avail" | "part" | "done";
	badgeText: string;
	image: string;
};

export type HeroOccasion = {
	id: "boda" | "cumpleanos" | "baby-shower" | "nuevo-hogar";
	label: string;
	photo: { desktop: string; mobile: string };
	scrim: "light" | "medium" | "heavy";
	rail: {
		eyebrow: string;
		name: string;
		meta: string;
		gifts: readonly { name: string; image: string }[];
		url: string;
	};
	card: {
		eyebrow: string;
		title: string;
		countdown: string;
		photo: string;
		accentBg: string;
		accentFg: string;
		btn: string;
		btnFg: string;
		gifts: readonly [Gift, Gift];
	};
};

export type HeroScrimVariables = CSSProperties & {
	"--hero-scrim-horizontal-start": string;
	"--hero-scrim-horizontal-middle": string;
	"--hero-scrim-horizontal-end": string;
	"--hero-scrim-vertical-top": string;
	"--hero-scrim-vertical-bottom": string;
	"--hero-scrim-header": string;
};

export const HERO_SCRIM_VALUES: Record<
	HeroOccasion["scrim"],
	HeroScrimVariables
> = {
	light: {
		"--hero-scrim-horizontal-start": "66%",
		"--hero-scrim-horizontal-middle": "34%",
		"--hero-scrim-horizontal-end": "2%",
		"--hero-scrim-vertical-top": "26%",
		"--hero-scrim-vertical-bottom": "36%",
		"--hero-scrim-header": "46%",
	},
	medium: {
		"--hero-scrim-horizontal-start": "74%",
		"--hero-scrim-horizontal-middle": "43%",
		"--hero-scrim-horizontal-end": "5%",
		"--hero-scrim-vertical-top": "32%",
		"--hero-scrim-vertical-bottom": "42%",
		"--hero-scrim-header": "52%",
	},
	heavy: {
		"--hero-scrim-horizontal-start": "82%",
		"--hero-scrim-horizontal-middle": "52%",
		"--hero-scrim-horizontal-end": "9%",
		"--hero-scrim-vertical-top": "38%",
		"--hero-scrim-vertical-bottom": "48%",
		"--hero-scrim-header": "58%",
	},
};

export const HERO_OCCASIONS = [
	// The canvas bouquet is dark in the headline area, so the original light scrim holds contrast.
	{
		id: "boda",
		label: "Boda",
		photo: {
			desktop:
				"https://images.unsplash.com/photo-1519741497674-611481863552?w=1280&h=560&fit=crop&auto=format",
			mobile:
				"https://images.unsplash.com/photo-1519741497674-611481863552?w=720&h=1000&fit=crop&auto=format",
		},
		scrim: "light",
		rail: {
			eyebrow: "Ejemplo real",
			name: "María & Tomás",
			meta: "Boda · 68 días · 16 regalos",
			gifts: [
				{
					name: "Copas de cristal",
					image:
						"https://images.unsplash.com/photo-1546567379-1af2e0d527e8?w=96&h=96&fit=crop&auto=format",
				},
				{
					name: "Vajilla 12 pzs",
					image:
						"https://images.unsplash.com/photo-1737681707230-04eebda96529?w=96&h=96&fit=crop&auto=format",
				},
				{
					name: "Set de mantelería",
					image:
						"https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=96&h=96&fit=crop&auto=format",
				},
			],
			url: "awishfor.com/w/maria-y-tomas",
		},
		card: {
			eyebrow: "Boda · 14 de septiembre",
			title: "María & Tomás",
			countdown: "Faltan 60 días",
			photo: "https://images.unsplash.com/photo-1777651929448-055c21fef72e",
			accentBg: "#F7F2EA",
			accentFg: "#3A2E18",
			btn: "#BFA06B",
			btnFg: "#3A2E18",
			gifts: [
				{
					name: "Copas de cristal",
					price: "$320",
					badge: "avail",
					badgeText: "Disponible",
					image: "https://images.unsplash.com/photo-1546567379-1af2e0d527e8",
				},
				{
					name: "Vajilla 12 pzs",
					price: "$890",
					badge: "part",
					badgeText: "2 de 4",
					image: "https://images.unsplash.com/photo-1737681707230-04eebda96529",
				},
			],
		},
	},
	// The candle-lit birthday crop needs a little more protection over its brighter left edge.
	{
		id: "cumpleanos",
		label: "Cumpleaños",
		photo: {
			desktop:
				"https://images.unsplash.com/photo-1503266980949-bd30d04d0b7a?w=1280&h=560&fit=crop&auto=format",
			mobile:
				"https://images.unsplash.com/photo-1503266980949-bd30d04d0b7a?w=720&h=1000&fit=crop&auto=format",
		},
		scrim: "medium",
		rail: {
			eyebrow: "Ejemplo real",
			name: "Mis 30 🎉",
			meta: "Cumpleaños · 9 días · 9 regalos",
			gifts: [
				{
					name: "Cámara instantánea",
					image:
						"https://images.unsplash.com/photo-1516962126636-27ad087061cc?w=96&h=96&fit=crop&auto=format",
				},
				{
					name: "Audífonos",
					image:
						"https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=96&h=96&fit=crop&auto=format",
				},
				{
					name: "Libro de fotos",
					image:
						"https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=96&h=96&fit=crop&auto=format",
				},
			],
			url: "awishfor.com/w/mis-30",
		},
		card: {
			eyebrow: "Cumpleaños · 5 de julio",
			title: "Mis 30 🎉",
			countdown: "Faltan 9 días",
			photo: "https://images.unsplash.com/photo-1503266980949-bd30d04d0b7a",
			accentBg: "#F3EFFA",
			accentFg: "#3A2A52",
			btn: "#B79CE0",
			btnFg: "#3A2A52",
			gifts: [
				{
					name: "Cámara instantánea",
					price: "$1,100",
					badge: "avail",
					badgeText: "Disponible",
					image: "https://images.unsplash.com/photo-1516962126636-27ad087061cc",
				},
				{
					name: "Audífonos",
					price: "$650",
					badge: "done",
					badgeText: "✓ Comprado",
					image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b",
				},
			],
		},
	},
	// The pastel baby-shower photograph is high-key where the headline sits, requiring the strongest scrim.
	{
		id: "baby-shower",
		label: "Baby Shower",
		photo: {
			desktop:
				"https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?w=1280&h=560&fit=crop&auto=format",
			mobile:
				"https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?w=720&h=1000&fit=crop&auto=format",
		},
		scrim: "heavy",
		rail: {
			eyebrow: "Ejemplo real",
			name: "Esperando a Mateo",
			meta: "Baby Shower · 21 días · 12 regalos",
			gifts: [
				{
					name: "Cuna de madera",
					image:
						"https://images.unsplash.com/photo-1542901689-8917f44e3541?w=96&h=96&fit=crop&auto=format",
				},
				{
					name: "Body de algodón",
					image:
						"https://images.unsplash.com/photo-1622290319146-7b63df48a635?w=96&h=96&fit=crop&auto=format",
				},
				{
					name: "Pañales ecológicos",
					image:
						"https://images.unsplash.com/photo-1522771930-78848d9293e8?w=96&h=96&fit=crop&auto=format",
				},
			],
			url: "awishfor.com/w/esperando-a-mateo",
		},
		card: {
			eyebrow: "Baby Shower · 12 de agosto",
			title: "Esperando a Mateo",
			countdown: "Faltan 21 días",
			photo: "https://images.unsplash.com/photo-1492725764893-90b379c2b6e7",
			accentBg: "#EEF5FB",
			accentFg: "#1B2A40",
			btn: "#8FBEE0",
			btnFg: "#1B2A40",
			gifts: [
				{
					name: "Cuna de madera",
					price: "$2,400",
					badge: "avail",
					badgeText: "Disponible",
					image: "https://images.unsplash.com/photo-1542901689-8917f44e3541",
				},
				{
					name: "Body de algodón",
					price: "$320",
					badge: "part",
					badgeText: "2 de 5",
					image: "https://images.unsplash.com/photo-1622290319146-7b63df48a635",
				},
			],
		},
	},
	// The indoor home scene has mixed daylight, so a medium scrim keeps the left copy legible without flattening it.
	{
		id: "nuevo-hogar",
		label: "Nuevo hogar",
		photo: {
			desktop:
				"https://images.unsplash.com/photo-1758523671285-9ff3f4e0ff38?w=1280&h=560&fit=crop&auto=format",
			mobile:
				"https://images.unsplash.com/photo-1758523671285-9ff3f4e0ff38?w=720&h=1000&fit=crop&auto=format",
		},
		scrim: "medium",
		rail: {
			eyebrow: "Ejemplo real",
			name: "Nuestra casa nueva",
			meta: "Nuevo hogar · 32 días · 14 regalos",
			gifts: [
				{
					name: "Vajilla cerámica",
					image:
						"https://images.unsplash.com/photo-1525973779373-015bdf68e579?w=96&h=96&fit=crop&auto=format",
				},
				{
					name: "Set de ollas",
					image:
						"https://images.unsplash.com/photo-1604414499020-f9ac575bc5ec?w=96&h=96&fit=crop&auto=format",
				},
				{
					name: "Lámpara de mesa",
					image:
						"https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=96&h=96&fit=crop&auto=format",
				},
			],
			url: "awishfor.com/w/nuestra-casa-nueva",
		},
		card: {
			eyebrow: "Nuevo hogar · 20 de octubre",
			title: "Nuestra casa nueva",
			countdown: "Faltan 32 días",
			photo: "https://images.unsplash.com/photo-1758523671285-9ff3f4e0ff38",
			accentBg: "#EEF4EC",
			accentFg: "#22382A",
			btn: "#9CC4A0",
			btnFg: "#22382A",
			gifts: [
				{
					name: "Vajilla cerámica",
					price: "$1,200",
					badge: "avail",
					badgeText: "Disponible",
					image: "https://images.unsplash.com/photo-1525973779373-015bdf68e579",
				},
				{
					name: "Set de ollas",
					price: "$980",
					badge: "done",
					badgeText: "✓ Comprado",
					image: "https://images.unsplash.com/photo-1604414499020-f9ac575bc5ec",
				},
			],
		},
	},
] as const satisfies readonly HeroOccasion[];
