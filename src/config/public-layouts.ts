export type PublicLayoutPreset = {
	id: string;
	label: string;
	description: string;
	giftColumns: number;
	giftCardStyle: "card" | "row" | "minimal";
	showCategoryDividers: boolean;
	/** How many cover images the hero composition displays at once. */
	heroImageSlots: number;
	/** Shows prev/next gallery controls when 2+ cover images exist. */
	supportsCarousel: boolean;
	deprecated?: boolean;
};

const layoutList: PublicLayoutPreset[] = [
	{
		id: "hero-cinematic",
		label: "Cinematográfico",
		description: "Portada cinematográfica a pantalla completa",
		giftColumns: 2,
		giftCardStyle: "card",
		showCategoryDividers: true,
		heroImageSlots: 6,
		supportsCarousel: true,
	},
	{
		id: "split-image-right",
		label: "Imagen Fija",
		description: "Texto a la izquierda, imagen fija a la derecha",
		giftColumns: 2,
		giftCardStyle: "card",
		showCategoryDividers: true,
		heroImageSlots: 1,
		supportsCarousel: false,
	},
	{
		id: "arch-split",
		label: "Arco Dividido",
		description: "Título grande con imagen en arco",
		giftColumns: 3,
		giftCardStyle: "card",
		showCategoryDividers: true,
		heroImageSlots: 6,
		supportsCarousel: true,
	},
	{
		id: "collage-staggered",
		label: "Collage Escalonado",
		description: "Collage escalonado de 3 imágenes",
		giftColumns: 2,
		giftCardStyle: "card",
		showCategoryDividers: true,
		heroImageSlots: 3,
		supportsCarousel: false,
	},
	{
		id: "magazine-editorial",
		label: "Editorial Revista",
		description: "Editorial asimétrico con numeral decorativo",
		giftColumns: 2,
		giftCardStyle: "card",
		showCategoryDividers: true,
		heroImageSlots: 1,
		supportsCarousel: false,
	},
	{
		id: "overlap-duo",
		label: "Dúo Superpuesto",
		description: "Dos fotos superpuestas junto al contenido",
		giftColumns: 2,
		giftCardStyle: "card",
		showCategoryDividers: true,
		heroImageSlots: 2,
		supportsCarousel: false,
	},
	{
		id: "arch-hero-party",
		label: "Arco Festivo",
		description: "Héroe con arco y tarjetas flotantes",
		giftColumns: 3,
		giftCardStyle: "card",
		showCategoryDividers: true,
		heroImageSlots: 6,
		supportsCarousel: true,
	},
	{
		id: "arch-trio",
		label: "Trío en Arco",
		description: "Tres imágenes circulares en arco",
		giftColumns: 3,
		giftCardStyle: "card",
		showCategoryDividers: true,
		heroImageSlots: 3,
		supportsCarousel: false,
	},
	{
		id: "wedding-formal",
		label: "Boda Formal",
		description: "Monograma con divisores ornamentales",
		giftColumns: 2,
		giftCardStyle: "card",
		showCategoryDividers: true,
		heroImageSlots: 1,
		supportsCarousel: false,
	},
	{
		id: "panoramic-band",
		label: "Banda Panorámica",
		description: "Banner panorámico con tarjeta flotante",
		giftColumns: 3,
		giftCardStyle: "card",
		showCategoryDividers: true,
		heroImageSlots: 6,
		supportsCarousel: true,
	},
	{
		id: "carousel-hero",
		label: "Carrusel Principal",
		description: "Galería de portada con carrusel",
		giftColumns: 3,
		giftCardStyle: "card",
		showCategoryDividers: true,
		heroImageSlots: 6,
		supportsCarousel: true,
	},
	{
		id: "diagonal-duo",
		label: "Dúo Diagonal",
		description: "Bloques diagonales con fotos circular y enmarcada",
		giftColumns: 2,
		giftCardStyle: "card",
		showCategoryDividers: true,
		heroImageSlots: 3,
		supportsCarousel: false,
	},
	{
		id: "scrapbook-polaroids",
		label: "Polaroids",
		description: "Polaroids dispersas con regalos como etiquetas",
		giftColumns: 3,
		giftCardStyle: "card",
		showCategoryDividers: true,
		heroImageSlots: 3,
		supportsCarousel: false,
	},
	{
		id: "portrait-frame-split",
		label: "Retrato Enmarcado",
		description: "Retrato enmarcado con estilo boutique",
		giftColumns: 2,
		giftCardStyle: "card",
		showCategoryDividers: true,
		heroImageSlots: 1,
		supportsCarousel: false,
	},
	{
		id: "grid",
		label: "Grid",
		description: "Clásico: héroe compacto y grid denso de regalos",
		giftColumns: 3,
		giftCardStyle: "card",
		showCategoryDividers: true,
		heroImageSlots: 1,
		supportsCarousel: false,
		deprecated: true,
	},
	{
		id: "editorial",
		label: "Editorial",
		description: "Clásico: columna angosta centrada, más espacio en blanco",
		giftColumns: 2,
		giftCardStyle: "card",
		showCategoryDividers: true,
		heroImageSlots: 1,
		supportsCarousel: false,
		deprecated: true,
	},
	{
		id: "minimal",
		label: "Minimal",
		description: "Clásico: columna única de filas horizontales",
		giftColumns: 1,
		giftCardStyle: "row",
		showCategoryDividers: false,
		heroImageSlots: 1,
		supportsCarousel: false,
		deprecated: true,
	},
];

export const DEFAULT_LAYOUT_ID = "magazine-editorial";

const layouts: Record<string, PublicLayoutPreset> = Object.fromEntries(
	layoutList.map((layout) => [layout.id, layout]),
);

export function resolveLayout(
	id: string | null | undefined,
): PublicLayoutPreset {
	return (
		layouts[id ?? ""] ?? (layouts[DEFAULT_LAYOUT_ID] as PublicLayoutPreset)
	);
}

export function getAllLayouts(): PublicLayoutPreset[] {
	return layoutList;
}
