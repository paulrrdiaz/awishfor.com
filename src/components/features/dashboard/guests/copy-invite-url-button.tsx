"use client";

import { Check, Link2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
	url: string;
};

export function CopyInviteUrlButton({ url }: Props) {
	const [copied, setCopied] = useState(false);

	async function handleCopy() {
		try {
			await navigator.clipboard.writeText(url);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			setCopied(false);
		}
	}

	return (
		<Button onClick={handleCopy} size="sm" type="button" variant="outline">
			{copied ? <Check /> : <Link2 />}
			{copied ? "Copiado" : "Copiar enlace"}
		</Button>
	);
}
