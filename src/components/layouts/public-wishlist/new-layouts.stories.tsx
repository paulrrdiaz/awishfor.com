import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DEMO_WISHLIST } from "@/config/demo-wishlist";
import type { PublicWishlistViewModel } from "@/server/mappers/view-models";
import { PublicWishlistPage } from "./public-wishlist-page";

const ZERO_IMAGES: string[] = [];
const ONE_IMAGE = [
	"https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&h=800&fit=crop",
];
const MANY_IMAGES = [
	"https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&h=800&fit=crop",
	"https://images.unsplash.com/photo-1519689680058-324335c77eba?w=1200&h=800&fit=crop",
	"https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?w=1200&h=800&fit=crop",
	"https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=1200&h=800&fit=crop",
];

function wishlistWithLayout(
	layoutId: string,
	coverImageUrls: string[] = ONE_IMAGE,
): PublicWishlistViewModel {
	return {
		...DEMO_WISHLIST,
		layoutId,
		coverImageUrls,
		coverImageUrl: coverImageUrls[0] ?? null,
	};
}

const meta = {
	component: PublicWishlistPage,
	parameters: {
		layout: "fullscreen",
	},
	title: "Public Wishlist/New Layouts",
} satisfies Meta<typeof PublicWishlistPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HeroCinematic: Story = {
	args: { mode: "compact", wishlist: wishlistWithLayout("hero-cinematic") },
};
export const HeroCinematicNoImages: Story = {
	args: {
		mode: "compact",
		wishlist: wishlistWithLayout("hero-cinematic", ZERO_IMAGES),
	},
};
export const HeroCinematicManyImages: Story = {
	args: {
		mode: "compact",
		wishlist: wishlistWithLayout("hero-cinematic", MANY_IMAGES),
	},
};

export const SplitImageRight: Story = {
	args: { mode: "compact", wishlist: wishlistWithLayout("split-image-right") },
};
export const SplitImageRightNoImages: Story = {
	args: {
		mode: "compact",
		wishlist: wishlistWithLayout("split-image-right", ZERO_IMAGES),
	},
};

export const ArchSplit: Story = {
	args: { mode: "compact", wishlist: wishlistWithLayout("arch-split") },
};
export const ArchSplitManyImages: Story = {
	args: {
		mode: "compact",
		wishlist: wishlistWithLayout("arch-split", MANY_IMAGES),
	},
};

export const CollageStaggered: Story = {
	args: { mode: "compact", wishlist: wishlistWithLayout("collage-staggered") },
};
export const CollageStaggeredNoImages: Story = {
	args: {
		mode: "compact",
		wishlist: wishlistWithLayout("collage-staggered", ZERO_IMAGES),
	},
};
export const CollageStaggeredManyImages: Story = {
	args: {
		mode: "compact",
		wishlist: wishlistWithLayout("collage-staggered", MANY_IMAGES),
	},
};

export const MagazineEditorial: Story = {
	args: { mode: "compact", wishlist: wishlistWithLayout("magazine-editorial") },
};
export const MagazineEditorialNoImages: Story = {
	args: {
		mode: "compact",
		wishlist: wishlistWithLayout("magazine-editorial", ZERO_IMAGES),
	},
};

export const OverlapDuo: Story = {
	args: { mode: "compact", wishlist: wishlistWithLayout("overlap-duo") },
};
export const OverlapDuoNoImages: Story = {
	args: {
		mode: "compact",
		wishlist: wishlistWithLayout("overlap-duo", ZERO_IMAGES),
	},
};
export const OverlapDuoManyImages: Story = {
	args: {
		mode: "compact",
		wishlist: wishlistWithLayout("overlap-duo", MANY_IMAGES),
	},
};

export const ArchHeroParty: Story = {
	args: { mode: "compact", wishlist: wishlistWithLayout("arch-hero-party") },
};
export const ArchHeroPartyManyImages: Story = {
	args: {
		mode: "compact",
		wishlist: wishlistWithLayout("arch-hero-party", MANY_IMAGES),
	},
};

export const ArchTrio: Story = {
	args: { mode: "compact", wishlist: wishlistWithLayout("arch-trio") },
};
export const ArchTrioNoImages: Story = {
	args: {
		mode: "compact",
		wishlist: wishlistWithLayout("arch-trio", ZERO_IMAGES),
	},
};
export const ArchTrioManyImages: Story = {
	args: {
		mode: "compact",
		wishlist: wishlistWithLayout("arch-trio", MANY_IMAGES),
	},
};

export const WeddingFormal: Story = {
	args: { mode: "compact", wishlist: wishlistWithLayout("wedding-formal") },
};

export const PanoramicBand: Story = {
	args: { mode: "compact", wishlist: wishlistWithLayout("panoramic-band") },
};
export const PanoramicBandManyImages: Story = {
	args: {
		mode: "compact",
		wishlist: wishlistWithLayout("panoramic-band", MANY_IMAGES),
	},
};

export const CarouselHero: Story = {
	args: { mode: "compact", wishlist: wishlistWithLayout("carousel-hero") },
};
export const CarouselHeroNoImages: Story = {
	args: {
		mode: "compact",
		wishlist: wishlistWithLayout("carousel-hero", ZERO_IMAGES),
	},
};
export const CarouselHeroManyImages: Story = {
	args: {
		mode: "compact",
		wishlist: wishlistWithLayout("carousel-hero", MANY_IMAGES),
	},
};

export const DiagonalDuo: Story = {
	args: { mode: "compact", wishlist: wishlistWithLayout("diagonal-duo") },
};
export const DiagonalDuoNoImages: Story = {
	args: {
		mode: "compact",
		wishlist: wishlistWithLayout("diagonal-duo", ZERO_IMAGES),
	},
};
export const DiagonalDuoManyImages: Story = {
	args: {
		mode: "compact",
		wishlist: wishlistWithLayout("diagonal-duo", MANY_IMAGES),
	},
};

export const ScrapbookPolaroids: Story = {
	args: {
		mode: "compact",
		wishlist: wishlistWithLayout("scrapbook-polaroids"),
	},
};
export const ScrapbookPolaroidsNoImages: Story = {
	args: {
		mode: "compact",
		wishlist: wishlistWithLayout("scrapbook-polaroids", ZERO_IMAGES),
	},
};
export const ScrapbookPolaroidsManyImages: Story = {
	args: {
		mode: "compact",
		wishlist: wishlistWithLayout("scrapbook-polaroids", MANY_IMAGES),
	},
};

export const PortraitFrameSplit: Story = {
	args: {
		mode: "compact",
		wishlist: wishlistWithLayout("portrait-frame-split"),
	},
};
export const PortraitFrameSplitNoImages: Story = {
	args: {
		mode: "compact",
		wishlist: wishlistWithLayout("portrait-frame-split", ZERO_IMAGES),
	},
};
