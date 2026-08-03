/* biome-ignore-all lint/performance/noImgElement: local SVG marks do not need the next/image client runtime. */
import { H2bNavController } from "./h2b-nav-controller";
import { MobileNavDrawer } from "./mobile-nav-drawer";

type MarketingNavProps = {
	variant?: "default" | "h2b";
};

/** Scrollspy targets for the H2b nav — `id` must match the anchored section's `id`. */
const NAV_ITEMS = [
	{ id: "como-funciona", href: "#como-funciona", label: "Cómo funciona" },
	{ id: "ocasiones", href: "#ocasiones", label: "Ocasiones" },
	{ id: "ejemplo", href: "#ejemplo", label: "Ejemplos" },
] as const;

export function MarketingNav({ variant = "default" }: MarketingNavProps) {
	if (variant === "h2b") {
		return (
			<>
				<H2bNavController />
				<div
					aria-hidden
					className="fixed top-0 right-0 left-0 z-50 hidden h-1 bg-white/[.16] lg:block"
				>
					<div
						className="h-full w-full origin-left bg-[linear-gradient(90deg,var(--mlime),#7FB069)] shadow-[0_0_10px_rgba(188,226,90,.9)] will-change-transform"
						data-h2b-scroll-progress
						style={{ transform: "scaleX(0)" }}
					/>
				</div>
				<nav
					aria-label="Navegación principal"
					className="group/h2b fixed top-0 right-0 left-0 z-40 hidden border-white/[.24] border-b bg-transparent text-white transition-[background-color,backdrop-filter,border-color,color,box-shadow] duration-300 ease-out data-[scrolled=true]:border-[rgba(23,62,41,.08)] data-[scrolled=true]:bg-[rgba(241,247,236,.75)] data-[scrolled=true]:text-[var(--mink)] data-[scrolled=true]:shadow-[0_8px_28px_rgba(23,62,41,.07)] data-[scrolled=true]:backdrop-blur-[20px] data-[scrolled=true]:backdrop-saturate-150 motion-reduce:transition-none lg:block"
					data-h2b-nav
					data-scrolled="false"
				>
					<div className="mx-auto max-w-[1240px] transition-[padding] duration-300 ease-out group-data-[scrolled=true]/h2b:px-8 motion-reduce:transition-none">
						<div className="flex items-center justify-between pt-[22px] pb-[18px] transition-[padding] duration-300 ease-out group-data-[scrolled=true]/h2b:pt-4 group-data-[scrolled=true]/h2b:pb-[13px] motion-reduce:transition-none">
							<a
								aria-label="A Wish For"
								className="flex items-center gap-[9px] focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-4 group-data-[scrolled=true]/h2b:gap-2 group-data-[scrolled=true]/h2b:focus-visible:outline-[var(--mink)]"
								href="/"
							>
								<img
									alt=""
									className="h-7 w-7 transition-[width,height] duration-300 ease-out group-data-[scrolled=true]/h2b:h-[22px] group-data-[scrolled=true]/h2b:w-[22px] motion-reduce:transition-none"
									height={28}
									loading="lazy"
									src="/assets/isotype.svg"
									width={28}
								/>
								<span className="m-serif font-semibold text-[19px] tracking-[-0.012em] transition-[font-size] duration-300 ease-out group-data-[scrolled=true]/h2b:text-[16px] motion-reduce:transition-none">
									A Wish For
								</span>
							</a>

							<div className="flex items-center gap-[26px] transition-[gap] duration-300 ease-out group-data-[scrolled=true]/h2b:gap-[22px] motion-reduce:transition-none">
								{NAV_ITEMS.map(({ href, id, label }) => (
									<a
										className="-mb-[5px] border-transparent border-b-2 pb-[3px] font-mono font-semibold text-[11px] text-white/[.82] uppercase tracking-[0.13em] transition-colors duration-300 ease-out hover:opacity-80 focus-visible:outline-2 focus-visible:outline-current focus-visible:outline-offset-4 data-[active=true]:border-[var(--mlime)] data-[active=true]:text-white group-data-[scrolled=true]/h2b:text-[10px] group-data-[scrolled=true]/h2b:text-[var(--mmut)] group-data-[scrolled=true]/h2b:tracking-[0.12em] group-data-[scrolled=true]/h2b:data-[active=true]:border-transparent group-data-[scrolled=true]/h2b:data-[active=true]:text-[var(--mink)] motion-reduce:transition-none"
										data-active="false"
										data-nav-link={id}
										href={href}
										key={id}
									>
										{label}
									</a>
								))}
							</div>

							<div className="flex items-center gap-[16px] transition-[gap] duration-300 ease-out group-data-[scrolled=true]/h2b:gap-[14px] motion-reduce:transition-none">
								<a
									className="whitespace-nowrap font-semibold text-[13.5px] hover:opacity-70 focus-visible:outline-2 focus-visible:outline-current focus-visible:outline-offset-4 group-data-[scrolled=true]/h2b:text-[12.5px]"
									data-marketing-account-link
									href="/sign-in"
								>
									Iniciar sesión
								</a>
								<a
									className="rounded-full bg-[var(--mlime)] px-5 py-[10px] font-semibold text-[#1B3A12] text-[13.5px] shadow-[0_8px_22px_rgba(140,200,60,0.4)] transition-[padding,transform] duration-300 ease-out hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-current focus-visible:outline-offset-4 group-data-[scrolled=true]/h2b:px-4 group-data-[scrolled=true]/h2b:py-2 group-data-[scrolled=true]/h2b:text-[12.5px] motion-reduce:transition-none"
									href="/create"
								>
									Crear mi wishlist
								</a>
							</div>
						</div>
					</div>
				</nav>
				<div className="lg:hidden">
					<DefaultMarketingNav />
				</div>
			</>
		);
	}

	return <DefaultMarketingNav />;
}

function DefaultMarketingNav() {
	return (
		<nav className="flex items-center justify-between border-[var(--mline)] border-b bg-[rgba(238,249,230,0.95)] px-5 py-3 backdrop-blur">
			<a className="flex items-center" href="/">
				<img
					alt="A Wish For"
					className="h-10 w-auto md:h-12"
					height={40}
					loading="lazy"
					src="/assets/isotype.svg"
					width={40}
				/>
			</a>

			{/* full inline nav, md:+ */}
			<div className="hidden items-center gap-[22px] md:flex">
				<a
					className="cursor-pointer font-medium text-[14px] text-[var(--mmut)] hover:text-[var(--mink)]"
					href="#ocasiones"
				>
					Ocasiones
				</a>
				<a
					className="cursor-pointer font-medium text-[14px] text-[var(--mmut)] hover:text-[var(--mink)]"
					href="#como-funciona"
				>
					Cómo funciona
				</a>
				<a
					className="font-medium text-[14px] text-[var(--mmut)] hover:text-[var(--mink)]"
					data-marketing-account-link
					href="/sign-in"
				>
					Iniciar sesión
				</a>
				<a
					className="!px-[22px] !py-[11px] !text-[14px] m-btn m-btn-lime"
					href="/create"
				>
					Crear mi wishlist
				</a>
			</div>

			{/* condensed nav, below md */}
			<div className="flex items-center gap-2 md:hidden">
				<a className="!px-4 !text-[13.5px] m-btn m-btn-lime" href="/create">
					Crear
				</a>
				<MobileNavDrawer isSignedIn={false} />
			</div>
		</nav>
	);
}
