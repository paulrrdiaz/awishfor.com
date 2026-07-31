import type { CSSProperties } from "react";

type Gift = {
	name: string;
	price: string;
	badge: "avail" | "part" | "done";
	badgeText: string;
	image: string;
};

export type HeroOccasion = {
	id: string;
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
			desktop: "/assets/hero/wedding-hero.jpg",
			mobile: "/assets/hero/wedding-hero-mobile.jpg",
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
			photo: "/assets/hero/photo-1519741497674-611481863552.jpeg",
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
			desktop: "/assets/hero/photo-1503266980949-bd30d04d0b7a.jpeg",
			mobile: "/assets/hero/photo-1503266980949-bd30d04d0b7a.jpeg",
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
			photo: "/assets/hero/photo-1503266980949-bd30d04d0b7a.jpeg",
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
			desktop: "/assets/hero/photo-1492725764893-90b379c2b6e7.jpeg",
			mobile: "/assets/hero/photo-1492725764893-90b379c2b6e7.jpeg",
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
			photo: "/assets/hero/photo-1492725764893-90b379c2b6e7.jpeg",
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
			desktop: "/assets/hero/photo-1758523671285-9ff3f4e0ff38.jpeg",
			mobile: "/assets/hero/photo-1758523671285-9ff3f4e0ff38.jpeg",
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
			photo: "/assets/hero/photo-1758523671285-9ff3f4e0ff38.jpeg",
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
	{
		id: "revelacion",
		label: "Revelación",
		photo: {
			desktop: "/assets/hero/gabriel-campos-gHsVQsrVGFY-unsplash.jpg",
			mobile: "/assets/hero/gabriel-campos-gHsVQsrVGFY-unsplash.jpg",
		},
		scrim: "heavy",
		rail: {
			eyebrow: "Ejemplo real",
			name: "Baby de Valentina",
			meta: "Revelación · 18 días · 11 regalos",
			gifts: [
				{
					name: "Moisés de mimbre",
					image:
						"https://images.unsplash.com/photo-1542901689-8917f44e3541?w=96&h=96&fit=crop&auto=format",
				},
				{
					name: "Manta suave",
					image:
						"https://images.unsplash.com/photo-1622290319146-7b63df48a635?w=96&h=96&fit=crop&auto=format",
				},
			],
			url: "awishfor.com/w/baby-valentina",
		},
		card: {
			eyebrow: "Revelación · 3 de noviembre",
			title: "Baby de Valentina",
			countdown: "Faltan 18 días",
			photo: "/assets/hero/gabriel-campos-gHsVQsrVGFY-unsplash.jpg",
			accentBg: "#F4EFF9",
			accentFg: "#473052",
			btn: "#C6ACE4",
			btnFg: "#30213A",
			gifts: [
				{
					name: "Moisés de mimbre",
					price: "$1,850",
					badge: "avail",
					badgeText: "Disponible",
					image: "https://images.unsplash.com/photo-1542901689-8917f44e3541",
				},
				{
					name: "Manta suave",
					price: "$240",
					badge: "part",
					badgeText: "1 de 3",
					image: "https://images.unsplash.com/photo-1622290319146-7b63df48a635",
				},
			],
		},
	},
	{
		id: "boda-intima",
		label: "Boda íntima",
		photo: {
			desktop: "/assets/hero/hannah-busing-6NUUZZ16hJk-unsplash.jpg",
			mobile: "/assets/hero/hannah-busing-6NUUZZ16hJk-unsplash.jpg",
		},
		scrim: "heavy",
		rail: {
			eyebrow: "Ejemplo real",
			name: "Sofía & Diego",
			meta: "Boda · 46 días · 18 regalos",
			gifts: [
				{
					name: "Copas de cristal",
					image:
						"https://images.unsplash.com/photo-1546567379-1af2e0d527e8?w=96&h=96&fit=crop&auto=format",
				},
				{
					name: "Vajilla artesanal",
					image:
						"https://images.unsplash.com/photo-1737681707230-04eebda96529?w=96&h=96&fit=crop&auto=format",
				},
			],
			url: "awishfor.com/w/sofia-y-diego",
		},
		card: {
			eyebrow: "Boda · 28 de septiembre",
			title: "Sofía & Diego",
			countdown: "Faltan 46 días",
			photo: "/assets/hero/hannah-busing-6NUUZZ16hJk-unsplash.jpg",
			accentBg: "#F8F1E8",
			accentFg: "#3B2B20",
			btn: "#D2A978",
			btnFg: "#3B2B20",
			gifts: [
				{
					name: "Copas de cristal",
					price: "$320",
					badge: "avail",
					badgeText: "Disponible",
					image: "https://images.unsplash.com/photo-1546567379-1af2e0d527e8",
				},
				{
					name: "Vajilla artesanal",
					price: "$760",
					badge: "part",
					badgeText: "2 de 6",
					image: "https://images.unsplash.com/photo-1737681707230-04eebda96529",
				},
			],
		},
	},
	{
		id: "baby-en-camino",
		label: "Baby en camino",
		photo: {
			desktop: "/assets/hero/siora-photography-_TvsS-0Qef4-unsplash.jpg",
			mobile: "/assets/hero/siora-photography-_TvsS-0Qef4-unsplash.jpg",
		},
		scrim: "medium",
		rail: {
			eyebrow: "Ejemplo real",
			name: "Esperando a Emma",
			meta: "Baby Shower · 27 días · 13 regalos",
			gifts: [
				{
					name: "Cuna de madera",
					image:
						"https://images.unsplash.com/photo-1542901689-8917f44e3541?w=96&h=96&fit=crop&auto=format",
				},
				{
					name: "Kit de baño",
					image:
						"https://images.unsplash.com/photo-1522771930-78848d9293e8?w=96&h=96&fit=crop&auto=format",
				},
			],
			url: "awishfor.com/w/esperando-a-emma",
		},
		card: {
			eyebrow: "Baby Shower · 24 de agosto",
			title: "Esperando a Emma",
			countdown: "Faltan 27 días",
			photo: "/assets/hero/siora-photography-_TvsS-0Qef4-unsplash.jpg",
			accentBg: "#EEF5FB",
			accentFg: "#1B2A40",
			btn: "#9CC8E6",
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
					name: "Kit de baño",
					price: "$390",
					badge: "done",
					badgeText: "✓ Comprado",
					image: "https://images.unsplash.com/photo-1522771930-78848d9293e8",
				},
			],
		},
	},
	{
		id: "boda-jardin",
		label: "Boda en jardín",
		photo: {
			desktop: "/assets/hero/zhouxing-lu-wz52C93GD78-unsplash.jpg",
			mobile: "/assets/hero/zhouxing-lu-wz52C93GD78-unsplash.jpg",
		},
		scrim: "heavy",
		rail: {
			eyebrow: "Ejemplo real",
			name: "Luisa & Andrés",
			meta: "Boda · 73 días · 20 regalos",
			gifts: [
				{
					name: "Set de mantelería",
					image:
						"https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=96&h=96&fit=crop&auto=format",
				},
				{
					name: "Lámpara de mesa",
					image:
						"https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=96&h=96&fit=crop&auto=format",
				},
			],
			url: "awishfor.com/w/luisa-y-andres",
		},
		card: {
			eyebrow: "Boda · 16 de noviembre",
			title: "Luisa & Andrés",
			countdown: "Faltan 73 días",
			photo: "/assets/hero/zhouxing-lu-wz52C93GD78-unsplash.jpg",
			accentBg: "#EFF4EA",
			accentFg: "#253920",
			btn: "#A8C889",
			btnFg: "#253920",
			gifts: [
				{
					name: "Set de mantelería",
					price: "$480",
					badge: "avail",
					badgeText: "Disponible",
					image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261",
				},
				{
					name: "Lámpara de mesa",
					price: "$560",
					badge: "part",
					badgeText: "1 de 2",
					image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c",
				},
			],
		},
	},
] as const satisfies readonly HeroOccasion[];

export const HERO_FEATURED_OCCASIONS = HERO_OCCASIONS.slice(0, 4);
