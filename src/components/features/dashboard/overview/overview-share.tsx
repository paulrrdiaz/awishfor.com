"use client";

import { useMemo, useState } from "react";
import { SharePanel } from "@/components/shared/share-panel";
import { downloadQrCodePng } from "@/lib/qr";
import {
	toCanonicalWishlistUrl,
	toWhatsAppShareUrl,
} from "@/lib/wishlist/share";

type Props = {
	publicUrlPath: string;
	slug: string;
	eventType?: string | null;
	className?: string;
};

export function OverviewShare({
	publicUrlPath,
	slug,
	eventType,
	className,
}: Props) {
	const [copied, setCopied] = useState(false);
	const publicUrl = useMemo(
		() => toCanonicalWishlistUrl(publicUrlPath),
		[publicUrlPath],
	);
	const whatsAppUrl = useMemo(
		() => toWhatsAppShareUrl(publicUrl, eventType),
		[publicUrl, eventType],
	);

	const handleCopy = async () => {
		await navigator.clipboard.writeText(publicUrl);
		setCopied(true);
		window.setTimeout(() => setCopied(false), 1800);
	};

	const handleQrDownload = async () => {
		await downloadQrCodePng({
			text: publicUrl,
			fileName: `${slug}-qr.png`,
		});
	};

	return (
		<div className={className}>
			<SharePanel
				onCopy={handleCopy}
				onQrDownload={handleQrDownload}
				url={publicUrl}
				whatsAppUrl={whatsAppUrl}
			/>
			{copied && <p className="mt-2 text-primary text-sm">Enlace copiado.</p>}
		</div>
	);
}
