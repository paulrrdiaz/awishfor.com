"use client";

import { useClerk } from "@clerk/nextjs";
import { CircleUserRound, Heart, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const EDITOR_ROUTE_PATTERN =
	/\/dashboard\/wishlists\/[^/]+\/(settings|design)(\/|$)/;

const tabClassName = (active: boolean) =>
	cn(
		"flex min-w-16 flex-col items-center gap-0.5 rounded-lg px-3 py-1 font-medium text-[11px]",
		active ? "text-foreground" : "text-muted-foreground",
	);

export function MobileTabBar() {
	const pathname = usePathname();
	const clerk = useClerk();

	if (EDITOR_ROUTE_PATTERN.test(pathname)) {
		return null;
	}

	const isInicio = pathname === "/dashboard";
	const isWishlists = pathname.startsWith("/dashboard/wishlists");

	return (
		<nav
			aria-label="Navegación principal"
			className="flex shrink-0 items-center justify-around border-border border-t bg-card pt-1.5 pb-[calc(env(safe-area-inset-bottom)+0.375rem)] md:hidden"
		>
			<Link
				aria-current={isInicio ? "page" : undefined}
				className={tabClassName(isInicio)}
				href="/dashboard"
			>
				<Home className="size-5" />
				Inicio
			</Link>
			<Link
				aria-current={isWishlists ? "page" : undefined}
				className={tabClassName(isWishlists)}
				href="/dashboard/wishlists"
			>
				<Heart className="size-5" />
				Wishlists
			</Link>
			<button
				className={tabClassName(false)}
				onClick={() => clerk.openUserProfile()}
				type="button"
			>
				<CircleUserRound className="size-5" />
				Cuenta
			</button>
		</nav>
	);
}
