"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { startTransition } from "react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
	{ label: "Resumen", segment: "" },
	{ label: "Regalos", segment: "gifts" },
	{ label: "Diseño", segment: "design" },
	{ label: "Configuración", segment: "settings" },
] as const;

type NavItem = (typeof NAV_ITEMS)[number];

type Props = {
	wishlistId: string;
};

function hrefFor(wishlistId: string, segment: NavItem["segment"]) {
	const base = `/dashboard/wishlists/${wishlistId}`;
	return segment ? `${base}/${segment}` : base;
}

function activeSegmentFromPathname(pathname: string, wishlistId: string) {
	const base = `/dashboard/wishlists/${wishlistId}`;
	if (pathname === base) {
		return "";
	}

	const suffix = pathname.startsWith(`${base}/`)
		? pathname.slice(base.length + 1)
		: "";
	const segment = suffix.split("/")[0] ?? "";
	return NAV_ITEMS.some((item) => item.segment === segment) ? segment : "";
}

export function WishlistDetailNav({ wishlistId }: Props) {
	const pathname = usePathname();
	const router = useRouter();
	const activeSegment = activeSegmentFromPathname(pathname, wishlistId);

	return (
		<nav
			aria-label="Secciones de la wishlist"
			className="border-border border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70"
		>
			<div className="mx-auto w-full max-w-6xl px-4 py-3">
				<div className="hidden items-center gap-1 rounded-full border bg-muted/50 p-1 md:flex">
					{NAV_ITEMS.map((item) => {
						const isActive = activeSegment === item.segment;
						return (
							<Link
								aria-current={isActive ? "page" : undefined}
								className={cn(
									"rounded-full px-4 py-2 font-medium text-sm transition-colors",
									isActive
										? "bg-background text-foreground shadow-sm"
										: "text-muted-foreground hover:bg-background/70 hover:text-foreground",
								)}
								href={hrefFor(wishlistId, item.segment)}
								key={item.segment || "summary"}
							>
								{item.label}
							</Link>
						);
					})}
				</div>

				<div className="md:hidden">
					<label
						className="mb-1.5 block font-medium text-muted-foreground text-xs"
						htmlFor="wishlist-section"
					>
						Sección
					</label>
					<select
						className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
						id="wishlist-section"
						onChange={(event) => {
							const nextSegment = event.target.value as NavItem["segment"];
							startTransition(() => {
								router.push(hrefFor(wishlistId, nextSegment));
							});
						}}
						value={activeSegment}
					>
						{NAV_ITEMS.map((item) => (
							<option key={item.segment || "summary"} value={item.segment}>
								{item.label}
							</option>
						))}
					</select>
				</div>
			</div>
		</nav>
	);
}
