import Image from "next/image";
import Link from "next/link";
import { PublicThemeProvider } from "@/components/layouts/public-wishlist/public-theme-provider";
import { GiftEscapedArt } from "@/components/shared/gift-escaped-art";
import { GuestFinderField } from "@/components/shared/guest-finder-field";
import { resolveButtonStyle } from "@/config/public-button-styles";
import { resolveBodyFont, resolveHeadingFont } from "@/config/public-fonts";
import { resolveTheme } from "@/config/public-themes";

export default function PublicWishlistNotFound() {
	return (
		<PublicThemeProvider
			bodyFont={resolveBodyFont(undefined)}
			buttonStyle={resolveButtonStyle(undefined)}
			headingFont={resolveHeadingFont(undefined)}
			theme={resolveTheme(undefined)}
		>
			<header className="flex items-center justify-between border-border border-b px-6 py-3.5 md:px-8">
				<Image
					alt=""
					aria-hidden
					className="h-[22px] w-auto"
					height={22}
					priority
					src="/assets/isotype.svg"
					width={22}
				/>
				<div className="flex items-center gap-3">
					<span className="font-mono text-[11px] text-muted-foreground uppercase tracking-[0.12em]">
						awishfor.com
					</span>
					<Link
						className="public-btn border border-border px-3 py-1.5 text-xs"
						href="/create"
					>
						Crear mi wishlist
					</Link>
				</div>
			</header>

			<main className="relative overflow-hidden bg-gradient-to-b from-accent to-card px-6 py-14 text-center md:px-8 md:py-20">
				<GiftEscapedArt variant="public" />
				<div className="relative mx-auto mt-2 max-w-[520px]">
					<p className="mb-3 font-mono text-[11px] text-muted-foreground uppercase tracking-[0.14em]">
						Error 404 · Página no encontrada
					</p>
					<h1 className="font-heading font-semibold text-[27px] leading-tight tracking-tight md:text-[38px]">
						Este regalo se nos escapó
					</h1>
					<p className="mt-3.5 text-[13.5px] text-muted-foreground leading-relaxed md:text-[15px]">
						No encontramos la lista que buscas. Puede que el enlace haya
						cambiado o que la wishlist ya no esté disponible.
					</p>
					<div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
						<Link
							className="public-btn bg-primary px-5 py-3 text-primary-foreground text-sm"
							href="/"
						>
							Volver al inicio
						</Link>
						<Link
							className="public-btn border border-border px-5 py-3 text-foreground text-sm"
							href="/create"
						>
							Crear mi wishlist
						</Link>
					</div>
					<div className="mt-7">
						<p className="mb-2 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.14em]">
							¿Buscas la lista de alguien?
						</p>
						<GuestFinderField />
					</div>
				</div>
			</main>
		</PublicThemeProvider>
	);
}
