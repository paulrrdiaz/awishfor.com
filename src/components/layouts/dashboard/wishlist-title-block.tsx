"use client";

import { useEffect, useState } from "react";
import { toCanonicalWishlistUrl } from "@/lib/wishlist/share";

type CopyState = "idle" | "success" | "error";

const COPY_LABEL: Record<CopyState, string> = {
	idle: "copiar",
	success: "copiado",
	error: "error",
};

type Props = {
	title: string;
	slug: string;
	publicUrlPath: string;
};

export function WishlistTitleBlock({ title, slug, publicUrlPath }: Props) {
	const [copyState, setCopyState] = useState<CopyState>("idle");

	useEffect(() => {
		if (copyState !== "success") {
			return;
		}
		const timeoutId = window.setTimeout(() => setCopyState("idle"), 1800);
		return () => window.clearTimeout(timeoutId);
	}, [copyState]);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(
				toCanonicalWishlistUrl(publicUrlPath),
			);
			setCopyState("success");
		} catch {
			setCopyState("error");
		}
	};

	return (
		<div className="flex flex-wrap items-baseline gap-3 px-7 pt-7 pb-3">
			<h1 className="font-heading font-semibold text-[22px] text-foreground">
				{title}
			</h1>
			<span className="text-[13px] text-muted-foreground">
				awishfor.com/w/{slug}
			</span>
			<button
				className="rounded-[5px] bg-black/5 px-[7px] py-0.5 font-mono text-[11px] text-muted-foreground"
				onClick={() => void handleCopy()}
				type="button"
			>
				{COPY_LABEL[copyState]}
			</button>
			{copyState === "error" && (
				<span className="text-destructive text-xs" role="alert">
					No pudimos copiar el enlace.
				</span>
			)}
		</div>
	);
}
