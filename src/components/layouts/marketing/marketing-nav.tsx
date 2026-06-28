import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";

export async function MarketingNav() {
	const { userId } = await auth();

	return (
		<nav className="flex items-center justify-between border-[var(--mline)] border-b bg-[rgba(238,249,230,0.95)] px-11 py-[18px] backdrop-blur">
			<Link className="flex items-center" href="/">
				<Image
					alt="A Wish For"
					className="h-12 w-auto"
					height={198.26}
					priority
					src="/assets/logo.svg"
					width={910}
				/>
			</Link>
			<div className="flex items-center gap-[22px]">
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
		</nav>
	);
}
