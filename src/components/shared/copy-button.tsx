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
	className?: string;
};

/**
 * Owns clipboard write + copied-state revert so the hero postscript and the
 * purchase modal block share identical copy behavior. A rejected or
 * unavailable clipboard fails silently — the composed line is always
 * readable as text next to the button, so this is an accelerator, not the
 * only path to the data.
 */
export function CopyButton({
	value,
	label = "Copiar",
	copiedLabel = "Copiado",
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
			className={cn("gap-1.5", className)}
			onClick={handleClick}
			size="sm"
			type="button"
			variant="outline"
		>
			{copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
			{copied ? copiedLabel : label}
		</Button>
	);
}
