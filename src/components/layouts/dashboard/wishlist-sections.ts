import {
	GiftIcon,
	LayoutGridIcon,
	PaletteIcon,
	SettingsIcon,
	UsersIcon,
} from "lucide-react";

export const NAV_ITEMS = [
	{ label: "Resumen", segment: "", icon: LayoutGridIcon },
	{ label: "Regalos", segment: "gifts", icon: GiftIcon },
	{ label: "Invitados", segment: "guests", icon: UsersIcon },
	{ label: "Diseño", segment: "design", icon: PaletteIcon },
	{ label: "Configuración", segment: "settings", icon: SettingsIcon },
] as const;

export type WishlistSection = (typeof NAV_ITEMS)[number]["segment"];

const SEGMENT_ALIASES: Record<string, WishlistSection> = {
	categories: "gifts",
};

export function hrefFor(wishlistId: string, segment: WishlistSection) {
	const base = `/dashboard/wishlists/${wishlistId}`;
	return segment ? `${base}/${segment}` : base;
}

export function activeSegmentFromPathname(
	pathname: string,
	wishlistId: string,
): WishlistSection {
	const base = `/dashboard/wishlists/${wishlistId}`;
	if (pathname === base) {
		return "";
	}

	const suffix = pathname.startsWith(`${base}/`)
		? pathname.slice(base.length + 1)
		: "";
	const rawSegment = suffix.split("/")[0] ?? "";
	const resolvedSegment = SEGMENT_ALIASES[rawSegment] ?? rawSegment;
	return NAV_ITEMS.some((item) => item.segment === resolvedSegment)
		? (resolvedSegment as WishlistSection)
		: "";
}

export function sectionLabel(segment: WishlistSection) {
	return NAV_ITEMS.find((item) => item.segment === segment)?.label ?? "";
}
