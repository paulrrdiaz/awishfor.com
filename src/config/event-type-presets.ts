import type { ImageOrientation } from "@/config/public-layouts";
import type { EventType } from "@/generated/prisma/enums";

export type SampleGift = {
	name: string;
	imageUrl?: string;
	price?: number;
};

export type SampleCoverImage = {
	url: string;
	width: number;
	height: number;
	orientation: ImageOrientation;
};

export type SampleCoverImages = {
	landscape: SampleCoverImage[];
	portrait: SampleCoverImage[];
};

export type EventTypePreset = {
	eventType: EventType;
	label: string;
	defaultWelcomeMessage: string;
	defaultThankYouMessage: string;
	defaultCategories: string[];
	sampleGifts: SampleGift[];
	sampleCoverImages: SampleCoverImages;
	defaultThemeId: string;
	defaultLayoutId: string;
};

function landscape(id: string): SampleCoverImage {
	return {
		url: `https://images.unsplash.com/photo-${id}?w=1600&h=1000&fit=crop`,
		width: 1600,
		height: 1000,
		orientation: "landscape",
	};
}

function portrait(id: string): SampleCoverImage {
	return {
		url: `https://images.unsplash.com/photo-${id}?w=1000&h=1400&fit=crop`,
		width: 1000,
		height: 1400,
		orientation: "portrait",
	};
}

export const EVENT_TYPE_PRESETS: Record<EventType, EventTypePreset> = {
	baby_shower: {
		eventType: "baby_shower",
		label: "Baby shower",
		defaultWelcomeMessage:
			"¡Estamos emocionados de compartir este momento tan especial con ustedes! Gracias por ser parte de la llegada de nuestro bebé.",
		defaultThankYouMessage:
			"Gracias por su cariño y por ayudarnos a preparar la llegada de nuestro bebé. ¡Su apoyo significa todo para nosotros!",
		defaultCategories: [
			"Pañales",
			"Ropa",
			"Lactancia",
			"Baño",
			"Dormitorio",
			"Juguetes",
			"Otros",
		],
		sampleGifts: [
			{ name: "Pack de pañales talla RN", price: 45 },
			{ name: "Mameluco de algodón orgánico", price: 30 },
			{ name: "Cojín de lactancia", price: 60 },
			{ name: "Bañera plegable", price: 55 },
		],
		sampleCoverImages: {
			landscape: [
				landscape("1519689680058-324335c77eba"),
				landscape("1492725764893-90b379c2b6e7"),
				landscape("1555252333-9f8e92e65df9"),
				landscape("1522771930-78848d9293e8"),
				landscape("1544126592-807ade215a0b"),
				landscape("1476703993599-0035a21b17a9"),
			],
			portrait: [
				portrait("1519689680058-324335c77eba"),
				portrait("1492725764893-90b379c2b6e7"),
				portrait("1555252333-9f8e92e65df9"),
				portrait("1522771930-78848d9293e8"),
				portrait("1544126592-807ade215a0b"),
				portrait("1476703993599-0035a21b17a9"),
			],
		},
		defaultThemeId: "cielo-suave",
		defaultLayoutId: "collage-staggered",
	},
	birthday: {
		eventType: "birthday",
		label: "Cumpleaños",
		defaultWelcomeMessage:
			"¡Gracias por querer celebrar este día especial conmigo! Aquí encontrarás algunas ideas de regalos que me harían muy feliz.",
		defaultThankYouMessage:
			"¡Muchas gracias por tu regalo y por hacerme sentir tan especial en mi cumpleaños! Significa mucho para mí.",
		defaultCategories: [
			"Juguetes",
			"Ropa",
			"Libros",
			"Experiencias",
			"Tecnología",
			"Otros",
		],
		sampleGifts: [
			{ name: "Set de juegos de mesa", price: 40 },
			{ name: "Libro de aventuras", price: 20 },
			{ name: "Auriculares inalámbricos", price: 80 },
			{ name: "Experiencia de cocina", price: 70 },
		],
		sampleCoverImages: {
			landscape: [
				landscape("1464349095431-e9a21285b5f3"),
				landscape("1530103862676-de8c9debad1d"),
				landscape("1558636508-e0db3814bd1d"),
				landscape("1513151233558-d860c5398176"),
				landscape("1519671482749-fd09be7ccebf"),
				landscape("1470753937643-efeb931202a9"),
			],
			portrait: [
				portrait("1464349095431-e9a21285b5f3"),
				portrait("1530103862676-de8c9debad1d"),
				portrait("1558636508-e0db3814bd1d"),
				portrait("1513151233558-d860c5398176"),
				portrait("1519671482749-fd09be7ccebf"),
				portrait("1470753937643-efeb931202a9"),
			],
		},
		defaultThemeId: "lavanda-fiesta",
		defaultLayoutId: "arch-hero-party",
	},
	wedding: {
		eventType: "wedding",
		label: "Boda",
		defaultWelcomeMessage:
			"Estamos construyendo nuestro hogar juntos y nos encantaría tu ayuda. Cada regalo es un gesto que atesoraremos para siempre.",
		defaultThankYouMessage:
			"Gracias de todo corazón por celebrar nuestra boda con nosotros y por tu generoso regalo. Tu presencia y cariño hacen este momento aún más especial.",
		defaultCategories: [
			"Cocina",
			"Hogar",
			"Decoración",
			"Experiencias",
			"Luna de miel",
			"Otros",
		],
		sampleGifts: [
			{ name: "Juego de sartenes antiadherentes", price: 120 },
			{ name: "Set de sábanas de lino", price: 90 },
			{ name: "Cafetera espresso", price: 150 },
			{ name: "Noche en hotel boutique", price: 200 },
		],
		sampleCoverImages: {
			landscape: [
				landscape("1519741497674-611481863552"),
				landscape("1519225421980-715cb0215aed"),
				landscape("1465495976277-4387d4b0b4c6"),
				landscape("1583939003579-730e3918a45a"),
				landscape("1522673607200-164d1b6ce486"),
				landscape("1520854221256-17451cc331bf"),
			],
			portrait: [
				portrait("1519741497674-611481863552"),
				portrait("1519225421980-715cb0215aed"),
				portrait("1465495976277-4387d4b0b4c6"),
				portrait("1583939003579-730e3918a45a"),
				portrait("1522673607200-164d1b6ce486"),
				portrait("1520854221256-17451cc331bf"),
			],
		},
		defaultThemeId: "crema-elegante",
		defaultLayoutId: "carousel-hero",
	},
	housewarming: {
		eventType: "housewarming",
		label: "Nuevo hogar",
		defaultWelcomeMessage:
			"¡Estamos estrenando hogar y nos emociona comenzar esta nueva etapa! Si quieres ayudarnos a equipar nuestra casa, aquí encontrarás algunas ideas.",
		defaultThankYouMessage:
			"Gracias por ayudarnos a convertir nuestra casa en un hogar. Tu regalo es parte de este nuevo comienzo que tanto hemos soñado.",
		defaultCategories: [
			"Cocina",
			"Muebles",
			"Decoración",
			"Electrodomésticos",
			"Herramientas",
			"Otros",
		],
		sampleGifts: [
			{ name: "Juego de utensilios de cocina", price: 55 },
			{ name: "Lámpara de piso", price: 85 },
			{ name: "Set de herramientas básicas", price: 65 },
			{ name: "Aspiradora inalámbrica", price: 130 },
		],
		sampleCoverImages: {
			landscape: [
				landscape("1493552152660-f915ab47ae9d"),
				landscape("1600585154340-be6161a56a0c"),
				landscape("1583847268964-b28dc8f51f92"),
				landscape("1518291344630-4857135fb581"),
				landscape("1484154218962-a197022b5858"),
				landscape("1512917774080-9991f1c4c750"),
			],
			portrait: [
				portrait("1493552152660-f915ab47ae9d"),
				portrait("1600585154340-be6161a56a0c"),
				portrait("1583847268964-b28dc8f51f92"),
				portrait("1518291344630-4857135fb581"),
				portrait("1484154218962-a197022b5858"),
				portrait("1512917774080-9991f1c4c750"),
			],
		},
		defaultThemeId: "jardin-verde",
		defaultLayoutId: "split-image-right",
	},
	general: {
		eventType: "general",
		label: "Wishlist general",
		defaultWelcomeMessage:
			"¡Bienvenido a mi wishlist! Aquí encontrarás algunas cosas que me gustarían. Gracias por pensar en mí.",
		defaultThankYouMessage:
			"¡Muchas gracias por tu regalo! Es muy detallista de tu parte y lo voy a disfrutar muchísimo.",
		defaultCategories: [
			"Favoritos",
			"Útiles",
			"Diversión",
			"Experiencias",
			"Otros",
		],
		sampleGifts: [
			{ name: "Libro recomendado", price: 25 },
			{ name: "Vela aromática", price: 30 },
			{ name: "Experiencia gastronómica", price: 90 },
			{ name: "Accesorio favorito", price: 50 },
		],
		sampleCoverImages: {
			landscape: [
				landscape("1607344645866-009c320b63e0"),
				landscape("1513885535751-8b9238bd345a"),
				landscape("1544005313-94ddf0286df2"),
				landscape("1519689373023-dd07c7988603"),
				landscape("1543269865-cbf427effbad"),
				landscape("1449824913935-59a10b8d2000"),
			],
			portrait: [
				portrait("1607344645866-009c320b63e0"),
				portrait("1513885535751-8b9238bd345a"),
				portrait("1544005313-94ddf0286df2"),
				portrait("1519689373023-dd07c7988603"),
				portrait("1543269865-cbf427effbad"),
				portrait("1449824913935-59a10b8d2000"),
			],
		},
		defaultThemeId: "clasico-minimal",
		defaultLayoutId: "magazine-editorial",
	},
};
