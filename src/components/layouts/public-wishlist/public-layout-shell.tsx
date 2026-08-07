"use client";

import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
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

export function PublicLayoutShell({ mode, heading, children }: Props) {
	function shareWishlist() {
		if (navigator.share) {
			void navigator.share({ title: heading, url: window.location.href });
			return;
		}
		void navigator.clipboard?.writeText(window.location.href);
	}

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
				<div className="flex items-center justify-between px-5 py-3.5 sm:px-7">
					<Image
						alt="A Wish For"
						height={22}
						src="/assets/isotype.svg"
						width={22}
					/>
					<div className="flex items-center gap-2">
						<span className="rounded-full bg-[#e4f3e8] px-2.5 py-1 font-medium text-[#2f7d43] text-[11px]">
							● Publicada
						</span>
						<button
							className="rounded-full border border-border bg-card px-3.5 py-1.5 font-medium text-xs transition-colors hover:bg-muted"
							onClick={shareWishlist}
							type="button"
						>
							Compartir
						</button>
					</div>
				</div>
			</header>
			<main className="mx-auto w-full max-w-[1160px]">{children}</main>
		</div>
	);
}
