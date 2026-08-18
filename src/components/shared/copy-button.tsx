"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const COPIED_REVERT_MS = 1500;

type Props = {
	value: string;
	label?: string;
	copiedLabel?: string;
	treatment?: "button" | "link";
	className?: string;
};

/**
 * Owns clipboard write + copied-state revert so the delivery card and the
 * purchase drawer share identical copy behavior. A rejected or
 * unavailable clipboard fails silently — the composed line is always
 * readable as text next to the button, so this is an accelerator, not the
 * only path to the data.
 */
export function CopyButton({
	value,
	label = "Copiar",
	copiedLabel = "Copiado",
	treatment = "button",
	className,
}: Props) {
	const [copied, setCopied] = useState(false);

	const handleClick = async () => {
		try {
			await navigator.clipboard.writeText(value);
			setCopied(true);
			window.setTimeout(() => setCopied(false), COPIED_REVERT_MS);
		} catch {
			// Clipboard unavailable or write rejected: no visible error, the
			// composed line remains readable as text.
		}
	};

	return (
		<Button
			className={cn(
				treatment === "button"
					? "gap-1.5"
					: "h-auto px-0 font-mono text-[9px] uppercase tracking-[0.16em]",
				className,
			)}
			onClick={handleClick}
			size={treatment === "button" ? "sm" : undefined}
			type="button"
			variant={treatment === "button" ? "outline" : "link"}
		>
			{treatment === "button" &&
				(copied ? (
					<Check className="size-3.5" />
				) : (
					<Copy className="size-3.5" />
				))}
			{copied ? copiedLabel : label}
		</Button>
	);
}
