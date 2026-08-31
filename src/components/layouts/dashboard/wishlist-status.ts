export type WishlistStatusBadgeVariant = "published" | "draft" | "archived";

const STATUS_LABEL: Record<string, string> = {
	published: "Publicada",
	draft: "Borrador",
	archived: "Archivada",
};

const STATUS_DOT_CLASS: Record<WishlistStatusBadgeVariant, string> = {
	published: "bg-[#3f7c44]",
	draft: "bg-[#a9afb8]",
	archived: "bg-[#9a5d48]",
};

export function wishlistStatusBadgeVariant(
	status: string,
): WishlistStatusBadgeVariant {
	const key = status.toLowerCase();
	return key === "published" || key === "archived" ? key : "draft";
}

export function wishlistStatusLabel(status: string): string {
	return STATUS_LABEL[status.toLowerCase()] ?? status;
}

export function wishlistStatusDotClassName(status: string): string {
	return STATUS_DOT_CLASS[wishlistStatusBadgeVariant(status)];
}
