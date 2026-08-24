/* biome-ignore-all lint/performance/noImgElement: local SVG mark does not need the next/image client runtime. */
import { SUPPORT_EMAIL } from "@/config/contact";
import { MarketingCtaLink } from "./marketing-cta-link";
import { SiteHeaderNavLinks } from "./site-header-nav-links";

export function SiteHeader() {
	return (
		<header className="bg-[#173E29] px-5 py-4 text-white md:px-11 md:py-5">
			<div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-x-6 gap-y-3">
				<a
					aria-label="A Wish For"
					className="flex shrink-0 items-center gap-[9px] focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-4"
					href="/"
				>
					<img
						alt=""
						className="h-[26px] w-[26px]"
						height={26}
						loading="lazy"
						src="/assets/isotype.svg"
						width={26}
					/>
					<span className="m-serif font-semibold text-[18px] text-white tracking-[-0.012em]">
						A Wish For
					</span>
				</a>

				<nav
					aria-label="Navegación"
					className="order-3 flex basis-full flex-wrap items-center gap-x-5 gap-y-2 md:order-none md:basis-auto"
				>
					<SiteHeaderNavLinks />
					<a
						className="pb-[3px] font-mono text-[11px] text-white/[.75] uppercase tracking-[0.12em] transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-4"
						href={`mailto:${SUPPORT_EMAIL}`}
					>
						Contacto
					</a>
				</nav>

				<div className="flex shrink-0 items-center gap-4">
					<a
						className="whitespace-nowrap font-semibold text-[13.5px] text-white hover:opacity-80 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-4"
						data-marketing-account-link
						href="/sign-in"
					>
						Iniciar sesión
					</a>
					<MarketingCtaLink
						className="whitespace-nowrap rounded-full bg-[var(--mlime)] px-5 py-[10px] font-semibold text-[#1B3A12] text-[13.5px] shadow-[0_8px_22px_rgba(140,200,60,0.4)] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-4"
						href="/create"
						placement="desktop_nav"
					>
						Crea un wishlist
					</MarketingCtaLink>
				</div>
			</div>
		</header>
	);
}
