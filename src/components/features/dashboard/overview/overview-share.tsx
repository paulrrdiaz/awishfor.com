"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SharePanel } from "@/components/shared/share-panel";
import { usePopMotion } from "@/lib/gsap/use-pop-motion";
import { downloadQrCodePng } from "@/lib/qr";
import {
	toCanonicalWishlistUrl,
	toWhatsAppShareUrl,
} from "@/lib/wishlist/share";

type CopyState = "idle" | "success" | "error";

type Props = {
	publicUrlPath: string;
	slug: string;
	eventType?: string | null;
	className?: string;
	copyStateOverride?: CopyState;
};

export function ShareCopyFeedback({
	status,
	url,
}: {
	status: CopyState;
	url: string;
}) {
	const ref = useRef<HTMLParagraphElement>(null);

	usePopMotion(ref, status !== "idle");

	if (status === "idle") {
		return null;
	}

	if (status === "error") {
		return (
			<p className="mt-2 text-destructive text-sm" ref={ref}>
				No pudimos copiar el enlace. Puedes seleccionarlo manualmente: {url}
			</p>
		);
	}

	return (
		<p className="mt-2 text-primary text-sm" ref={ref}>
			Enlace copiado
		</p>
	);
}

export function OverviewShare({
	publicUrlPath,
	slug,
	eventType,
	className,
	copyStateOverride,
}: Props) {
	const [copyState, setCopyState] = useState<CopyState>("idle");
	const renderedCopyState = copyStateOverride ?? copyState;
	const publicUrl = useMemo(
		() => toCanonicalWishlistUrl(publicUrlPath),
		[publicUrlPath],
	);
	const whatsAppUrl = useMemo(
		() => toWhatsAppShareUrl(publicUrl, eventType),
		[publicUrl, eventType],
	);

	useEffect(() => {
		if (copyStateOverride != null || copyState !== "success") {
			return;
		}

		const timeoutId = window.setTimeout(() => setCopyState("idle"), 1800);
		return () => window.clearTimeout(timeoutId);
	}, [copyState, copyStateOverride]);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(publicUrl);
			setCopyState("success");
		} catch {
			setCopyState("error");
		}
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
			<ShareCopyFeedback status={renderedCopyState} url={publicUrl} />
		</div>
	);
}
