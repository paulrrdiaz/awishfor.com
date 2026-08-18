"use client";

import { usePathname } from "next/navigation";

const NAV_LINKS = [
	{ href: "/", label: "Inicio" },
	{ href: "/blog", label: "Blog" },
] as const;

export function SiteHeaderNavLinks() {
	const pathname = usePathname();

	return (
		<>
			{NAV_LINKS.map(({ href, label }) => {
				const isActive =
					href === "/" ? pathname === "/" : pathname.startsWith(href);
				return (
					<a
						aria-current={isActive ? "page" : undefined}
						className="border-transparent border-b-2 pb-[3px] font-mono text-[11px] text-white/[.75] uppercase tracking-[0.12em] transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-4 data-[active=true]:border-[var(--mlime)] data-[active=true]:text-white"
						data-active={isActive}
						href={href}
						key={href}
					>
						{label}
					</a>
				);
			})}
		</>
	);
}
