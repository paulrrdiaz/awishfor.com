import type { EventType } from "@/generated/prisma/enums";

export type SampleGift = {
	name: string;
	imageUrl?: string;
	price?: number;
};

export type EventTypePreset = {
	eventType: EventType;
	label: string;
	defaultHeroTitleTemplate: string;
	defaultWelcomeMessage: string;
	defaultThankYouMessage: string;
	defaultCategories: string[];
	sampleGifts: SampleGift[];
	defaultThemeId: string;
	defaultLayoutId: string;
};

export const EVENT_TYPE_PRESETS: Record<EventType, EventTypePreset> = {
	baby_shower: {
		eventType: "baby_shower",
		label: "Baby shower",
		defaultHeroTitleTemplate: "Baby shower de {name}",
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
		defaultThemeId: "cielo-suave",
		defaultLayoutId: "editorial",
	},
	birthday: {
		eventType: "birthday",
		label: "Cumpleaños",
		defaultHeroTitleTemplate: "Wishlist de cumpleaños de {name}",
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
		defaultThemeId: "lavanda-fiesta",
		defaultLayoutId: "grid",
	},
	wedding: {
		eventType: "wedding",
		label: "Boda",
		defaultHeroTitleTemplate: "Wishlist de boda de {name}",
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
		defaultThemeId: "crema-elegante",
		defaultLayoutId: "editorial",
	},
	housewarming: {
		eventType: "housewarming",
		label: "Nuevo hogar",
		defaultHeroTitleTemplate: "Wishlist de nuevo hogar de {name}",
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
		defaultThemeId: "jardin-verde",
		defaultLayoutId: "minimal",
	},
	general: {
		eventType: "general",
		label: "Wishlist general",
		defaultHeroTitleTemplate: "Wishlist de {name}",
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
		defaultThemeId: "clasico-minimal",
		defaultLayoutId: "grid",
	},
};
