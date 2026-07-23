export type ImageOrientation = "landscape" | "portrait" | "square";

export type LayoutImageGuidance = {
	ratio: "16:9" | "4:3" | "3:4" | "2:3" | "1:1";
	orientation: ImageOrientation;
	/** Circle crops benefit from placing the subject near the center. */
	centeredSubject?: boolean;
	/** The composition uses multiple crop shapes; ratio is the safe default. */
	mixed?: boolean;
};

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
	/** Recommended source-image shape for this layout's hero composition. */
	imageGuidance: LayoutImageGuidance;
	deprecated?: boolean;
};

export const IMAGE_ORIENTATION_GLYPHS: Record<ImageOrientation, string> = {
	landscape: "▭",
	portrait: "▯",
	square: "◻",
};

const IMAGE_ORIENTATION_LABELS: Record<ImageOrientation, string> = {
	landscape: "horizontal",
	portrait: "vertical",
	square: "cuadrada",
};

export function buildImageGuidanceHint(layout: PublicLayoutPreset): string {
	const { imageGuidance, heroImageSlots } = layout;
	const count = `${heroImageSlots} ${heroImageSlots === 1 ? "foto" : "fotos"}`;
	const orientation = IMAGE_ORIENTATION_LABELS[imageGuidance.orientation];
	const glyph = IMAGE_ORIENTATION_GLYPHS[imageGuidance.orientation];
	const centeredSubject = imageGuidance.centeredSubject
		? " · centra el sujeto"
		: "";

	return `Este diseño muestra ${count} · ${orientation} ${glyph} ${imageGuidance.ratio}${centeredSubject}`;
}

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
		imageGuidance: { ratio: "16:9", orientation: "landscape" },
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
		imageGuidance: { ratio: "3:4", orientation: "portrait" },
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
		imageGuidance: { ratio: "2:3", orientation: "portrait" },
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
		imageGuidance: {
			ratio: "3:4",
			orientation: "portrait",
			mixed: true,
		},
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
		imageGuidance: { ratio: "1:1", orientation: "square" },
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
		imageGuidance: { ratio: "3:4", orientation: "portrait" },
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
		imageGuidance: { ratio: "2:3", orientation: "portrait" },
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
		imageGuidance: {
			ratio: "1:1",
			orientation: "square",
			centeredSubject: true,
		},
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
		// Known heroImageSlots/no-render mismatch is intentionally out of scope.
		imageGuidance: { ratio: "1:1", orientation: "square" },
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
		imageGuidance: { ratio: "16:9", orientation: "landscape" },
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
		imageGuidance: { ratio: "16:9", orientation: "landscape" },
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
		imageGuidance: {
			ratio: "3:4",
			orientation: "portrait",
			centeredSubject: true,
		},
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
		imageGuidance: { ratio: "4:3", orientation: "landscape" },
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
		imageGuidance: { ratio: "3:4", orientation: "portrait" },
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
		imageGuidance: { ratio: "16:9", orientation: "landscape" },
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
		imageGuidance: { ratio: "16:9", orientation: "landscape" },
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
		imageGuidance: { ratio: "16:9", orientation: "landscape" },
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
