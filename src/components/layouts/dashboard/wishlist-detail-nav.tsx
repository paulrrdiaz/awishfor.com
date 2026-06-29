"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { startTransition } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
	return NAV_ITEMS.some((item) => item.segment === segment)
		? (segment as NavItem["segment"])
		: "";
}

type WishlistDetailNavViewProps = {
	activeSegment: NavItem["segment"];
	onSegmentChange: (segment: NavItem["segment"]) => void;
	wishlistId: string;
};

export function WishlistDetailNavView({
	activeSegment,
	onSegmentChange,
	wishlistId,
}: WishlistDetailNavViewProps) {
	return (
		<nav
			aria-label="Secciones de la wishlist"
			className="border-border border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70"
		>
			<div className="mx-auto w-full max-w-6xl px-4 py-3">
				<div className="hidden md:block">
					<Tabs
						onValueChange={(value) =>
							onSegmentChange(value as NavItem["segment"])
						}
						value={activeSegment}
					>
						<TabsList>
							{NAV_ITEMS.map((item) => {
								const isActive = activeSegment === item.segment;
								return (
									<TabsTrigger
										className={cn(
											isActive
												? "bg-background text-foreground shadow-sm"
												: undefined,
										)}
										key={item.segment || "summary"}
										render={<Link href={hrefFor(wishlistId, item.segment)} />}
										value={item.segment}
									>
										{item.label}
									</TabsTrigger>
								);
							})}
						</TabsList>
					</Tabs>
				</div>

				<div className="md:hidden">
					<label
						className="mb-1.5 block font-medium text-muted-foreground text-xs"
						htmlFor="wishlist-section"
					>
						Sección
					</label>
					<Select
						onValueChange={(value) =>
							onSegmentChange(value as NavItem["segment"])
						}
						value={activeSegment}
					>
						<SelectTrigger className="h-10" id="wishlist-section">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{NAV_ITEMS.map((item) => (
								<SelectItem
									key={item.segment || "summary"}
									value={item.segment}
								>
									{item.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>
		</nav>
	);
}

export function WishlistDetailNav({ wishlistId }: Props) {
	const pathname = usePathname();
	const router = useRouter();
	const activeSegment = activeSegmentFromPathname(pathname, wishlistId);

	return (
		<WishlistDetailNavView
			activeSegment={activeSegment}
			onSegmentChange={(nextSegment) => {
				startTransition(() => {
					router.push(hrefFor(wishlistId, nextSegment));
				});
			}}
			wishlistId={wishlistId}
		/>
	);
}
