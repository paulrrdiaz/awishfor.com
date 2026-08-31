import {
	GiftIcon,
	LayoutGridIcon,
	PaletteIcon,
	SettingsIcon,
	Users2Icon,
	UsersIcon,
} from "lucide-react";

export const NAV_ITEMS = [
	{ label: "Resumen", segment: "", icon: LayoutGridIcon, ownerOnly: false },
	{ label: "Regalos", segment: "gifts", icon: GiftIcon, ownerOnly: false },
	{ label: "Invitados", segment: "guests", icon: UsersIcon, ownerOnly: false },
	{ label: "Tema", segment: "design", icon: PaletteIcon, ownerOnly: false },
	{
		label: "Colaboradores",
		segment: "collaborators",
		icon: Users2Icon,
		ownerOnly: true,
	},
	{
		label: "Ajustes",
		segment: "settings",
		icon: SettingsIcon,
		ownerOnly: false,
	},
] as const;

export type WishlistSection = (typeof NAV_ITEMS)[number]["segment"];

export function navItemsFor(isOwner: boolean) {
	return NAV_ITEMS.filter((item) => isOwner || !item.ownerOnly);
}

export type SectionBadgeVariant = "default" | "warning";

export type SectionBadge = {
	count: number;
	variant?: SectionBadgeVariant;
};

export type SectionBadges = Partial<Record<WishlistSection, SectionBadge>>;

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
