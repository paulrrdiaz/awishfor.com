import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DEMO_WISHLIST } from "@/config/demo-wishlist";
import type {
	PublicWishlistViewModel,
	WishlistImageViewModel,
} from "@/server/mappers/view-models";
import { PublicWishlistPage } from "./public-wishlist-page";

function image(url: string): WishlistImageViewModel {
	return { url, width: 1200, height: 800, orientation: "landscape" };
}

function portraitImage(url: string): WishlistImageViewModel {
	return { url, width: 900, height: 1200, orientation: "portrait" };
}

const ZERO_IMAGES: WishlistImageViewModel[] = [];
const ONE_IMAGE = [
	image(
		"https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&h=800&fit=crop",
	),
];
const ONE_PORTRAIT_IMAGE = [
	portraitImage(
		"https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=900&h=1200&fit=crop",
	),
];
const TWO_PORTRAIT_IMAGES = [
	portraitImage(
		"https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=900&h=1200&fit=crop",
	),
	portraitImage(
		"https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=900&h=1200&fit=crop",
	),
];
const MANY_IMAGES = [
	image(
		"https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&h=800&fit=crop",
	),
	image(
		"https://images.unsplash.com/photo-1519689680058-324335c77eba?w=1200&h=800&fit=crop",
	),
	image(
		"https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?w=1200&h=800&fit=crop",
	),
	image(
		"https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=1200&h=800&fit=crop",
	),
];

function wishlistWithLayout(
	layoutId: string,
	images: WishlistImageViewModel[] = ONE_IMAGE,
): PublicWishlistViewModel {
	return {
		...DEMO_WISHLIST,
		layoutId,
		images,
	};
}

const meta = {
	args: {
		surface: "standalone",
	},
	component: PublicWishlistPage,
	parameters: {
		layout: "fullscreen",
	},
	title: "Public Wishlist/New Layouts",
} satisfies Meta<typeof PublicWishlistPage>;

export default meta;
type Story = StoryObj<typeof meta>;

// Story names below mirror the "disposición" labels in
// src/config/public-layouts.ts (the layout picker shown to users).

export const SplitImageRight: Story = {
	args: {
		mode: "full",
		wishlist: wishlistWithLayout("split-image-right", TWO_PORTRAIT_IMAGES),
	},
	name: "Imagen Fija",
};
export const SplitImageRightEmbeddedPreview: Story = {
	args: {
		mode: "preview",
		surface: "embedded",
		wishlist: wishlistWithLayout("split-image-right", TWO_PORTRAIT_IMAGES),
	},
	name: "Imagen Fija — vista previa incrustada",
};
export const SplitImageRightOneImage: Story = {
	args: {
		mode: "full",
		wishlist: wishlistWithLayout("split-image-right", ONE_PORTRAIT_IMAGE),
	},
	name: "Imagen Fija — una foto",
};
export const SplitImageRightNoImages: Story = {
	args: {
		mode: "compact",
		wishlist: wishlistWithLayout("split-image-right", ZERO_IMAGES),
	},
	name: "Imagen Fija — sin fotos",
};

export const CollageStaggered: Story = {
	args: {
		mode: "full",
		wishlist: wishlistWithLayout("collage-staggered", MANY_IMAGES),
	},
	name: "Collage Escalonado",
};
export const CollageStaggeredNoImages: Story = {
	args: {
		mode: "compact",
		wishlist: wishlistWithLayout("collage-staggered", ZERO_IMAGES),
	},
	name: "Collage Escalonado — sin fotos",
};

export const MagazineEditorial: Story = {
	args: { mode: "full", wishlist: wishlistWithLayout("magazine-editorial") },
	name: "Editorial Revista",
};
export const MagazineEditorialNoImages: Story = {
	args: {
		mode: "compact",
		wishlist: wishlistWithLayout("magazine-editorial", ZERO_IMAGES),
	},
	name: "Editorial Revista — sin fotos",
};

export const OverlapDuo: Story = {
	args: {
		mode: "full",
		wishlist: wishlistWithLayout("overlap-duo", MANY_IMAGES),
	},
	name: "Dúo Superpuesto",
};
export const OverlapDuoNoImages: Story = {
	args: {
		mode: "compact",
		wishlist: wishlistWithLayout("overlap-duo", ZERO_IMAGES),
	},
	name: "Dúo Superpuesto — sin fotos",
};

export const ArchHeroParty: Story = {
	args: {
		mode: "full",
		wishlist: wishlistWithLayout("arch-hero-party", MANY_IMAGES),
	},
	name: "Arco Festivo",
};

export const ArchTrio: Story = {
	args: {
		mode: "full",
		wishlist: wishlistWithLayout("arch-trio", MANY_IMAGES),
	},
	name: "Trío en Arco",
};
export const ArchTrioNoImages: Story = {
	args: {
		mode: "compact",
		wishlist: wishlistWithLayout("arch-trio", ZERO_IMAGES),
	},
	name: "Trío en Arco — sin fotos",
};

export const CarouselHero: Story = {
	args: {
		mode: "full",
		wishlist: wishlistWithLayout("carousel-hero", MANY_IMAGES),
	},
	name: "Carrusel Principal",
};
export const CarouselHeroNoImages: Story = {
	args: {
		mode: "compact",
		wishlist: wishlistWithLayout("carousel-hero", ZERO_IMAGES),
	},
	name: "Carrusel Principal — sin fotos",
};

export const ScrapbookPolaroids: Story = {
	args: {
		mode: "full",
		wishlist: wishlistWithLayout("scrapbook-polaroids", MANY_IMAGES),
	},
	name: "Polaroids",
};
export const ScrapbookPolaroidsNoImages: Story = {
	args: {
		mode: "compact",
		wishlist: wishlistWithLayout("scrapbook-polaroids", ZERO_IMAGES),
	},
	name: "Polaroids — sin fotos",
};

export const PortraitFrameSplit: Story = {
	args: {
		mode: "full",
		wishlist: wishlistWithLayout("portrait-frame-split"),
	},
	name: "Retrato Enmarcado",
};
export const PortraitFrameSplitNoImages: Story = {
	args: {
		mode: "compact",
		wishlist: wishlistWithLayout("portrait-frame-split", ZERO_IMAGES),
	},
	name: "Retrato Enmarcado — sin fotos",
};
