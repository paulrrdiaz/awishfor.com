"use client";

import { useState } from "react";

const CONFIRMATION_MS = 2000;

export function BlogShareControl({
	title,
	url,
}: {
	title: string;
	url: string;
}) {
	const [copied, setCopied] = useState(false);

	const handleShare = async () => {
		if (typeof navigator !== "undefined" && navigator.share) {
			try {
				await navigator.share({ title, url });
			} catch {
				// Visitor dismissed the native share sheet — no fallback needed.
			}
			return;
		}

		try {
			await navigator.clipboard.writeText(url);
			setCopied(true);
			setTimeout(() => setCopied(false), CONFIRMATION_MS);
		} catch {
			// Clipboard access denied — nothing further we can do without a UI to paste into.
		}
	};

	return (
		<button
			className="m-tag min-h-11 cursor-pointer px-[10px] py-[6px]"
			onClick={handleShare}
			type="button"
		>
			{copied ? "¡Copiado!" : "↗ Compartir"}
		</button>
	);
}
