import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";

import { MobileNavDrawer } from "./mobile-nav-drawer";

export async function MarketingNav() {
	const { userId } = await auth();

	return (
		<nav className="flex items-center justify-between border-[var(--mline)] border-b bg-[rgba(238,249,230,0.95)] px-5 py-3 backdrop-blur md:px-11 md:py-[18px]">
			<Link className="flex items-center" href="/">
				<Image
					alt="A Wish For"
					className="h-10 w-auto md:h-12"
					height={198.26}
					priority
					src="/assets/logo.svg"
					width={910}
				/>
			</Link>

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
				<Link
					className="font-medium text-[14px] text-[var(--mmut)] hover:text-[var(--mink)]"
					href={userId ? "/dashboard" : "/sign-in"}
				>
					{userId ? "Dashboard" : "Iniciar sesión"}
				</Link>
				<Link
					className="!px-[22px] !py-[11px] !text-[14px] m-btn m-btn-lime"
					data-glow
					href="/create"
				>
					Crear mi wishlist
				</Link>
			</div>

			{/* condensed nav, below md */}
			<div className="flex items-center gap-2 md:hidden">
				<Link
					className="!px-4 !text-[13.5px] m-btn m-btn-lime"
					data-glow
					href="/create"
				>
					Crear
				</Link>
				<MobileNavDrawer isSignedIn={!!userId} />
			</div>
		</nav>
	);
}
