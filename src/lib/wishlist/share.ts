export const PUBLIC_WISHLIST_ORIGIN = "https://awishfor.com";

export type WishlistShareMetadata = {
	wishlistId: string;
	slug: string;
	publicUrlPath: string;
	dashboardUrlPath: string;
};

export const toCanonicalWishlistUrl = (publicUrlPath: string) =>
	new URL(publicUrlPath, PUBLIC_WISHLIST_ORIGIN).toString();

export const toWhatsAppShareUrl = (publicUrl: string) => {
	const message = `Te comparto mi wishlist de awishfor. Mira la lista aqui: ${publicUrl}`;
	return `https://wa.me/?text=${encodeURIComponent(message)}`;
};
