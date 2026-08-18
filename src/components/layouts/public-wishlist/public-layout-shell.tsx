import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { SUPPORT_EMAIL } from "@/config/contact";
import type { PublicWishlistMode } from "./public-wishlist-page";

// What actually pins to the top of the viewport differs per mode: the fixed
// header (measured height, `full` only), the unpublished-preview banner
// (`preview` only — the header scrolls away with it), or nothing (`compact`).
// `PublicWishlistPage` renders the shared footer itself, after the layout
// component — the shell owns only the header, wrapper and main.
const STICKY_OFFSET_BY_MODE: Record<PublicWishlistMode, string> = {
	full: "59px",
	preview: "45px",
	compact: "0px",
};

type ShellStyle = CSSProperties & Record<"--sticky-offset", string>;

type Props = {
	mode: PublicWishlistMode;
	heading: string;
	children: ReactNode;
};

export function PublicLayoutShell({ mode, children }: Props) {
	const style: ShellStyle = {
		"--sticky-offset": STICKY_OFFSET_BY_MODE[mode],
	};

	return (
		<div
			className={
				mode === "full"
					? "relative ml-[calc(50%-50vw)] min-h-full w-screen bg-background pt-[53px] text-foreground"
					: "min-h-full bg-background text-foreground"
			}
			style={style}
		>
			<header
				className={`border-border border-b bg-background ${mode === "full" ? "fixed inset-x-0 top-0 z-50" : ""}`}
			>
				<div className="flex items-center justify-between gap-4 px-5 py-3.5 sm:px-7">
					<a
						aria-label="A Wish For"
						className="flex shrink-0 items-center"
						href="/"
					>
						<Image alt="" height={22} src="/assets/isotype.svg" width={22} />
					</a>

					<div className="flex items-center gap-6">
						<nav
							aria-label="Navegación"
							className="hidden items-center gap-5 md:flex"
						>
							<a
								className="font-medium text-muted-foreground text-xs hover:text-foreground"
								href="/"
							>
								Inicio
							</a>
							<a
								className="font-medium text-muted-foreground text-xs hover:text-foreground"
								href="/blog"
							>
								Blog
							</a>
							<a
								className="font-medium text-muted-foreground text-xs hover:text-foreground"
								href={`mailto:${SUPPORT_EMAIL}`}
							>
								Contacto
							</a>
						</nav>

						<div className="flex items-center gap-2">
							<a
								className="hidden font-medium text-foreground text-xs hover:opacity-70 sm:inline-flex"
								data-marketing-account-link
								href="/sign-in"
							>
								Iniciar sesión
							</a>
							<a
								className="rounded-full border border-border bg-card px-3.5 py-1.5 font-medium text-xs transition-colors hover:bg-muted"
								href="/create"
							>
								Crea un wishlist
							</a>
						</div>
					</div>
				</div>
			</header>
			<main className="mx-auto w-full max-w-[1160px]">{children}</main>
		</div>
	);
}
