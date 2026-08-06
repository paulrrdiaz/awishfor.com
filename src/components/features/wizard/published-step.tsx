"use client";

import confetti from "canvas-confetti";
import {
	ExternalLink,
	LoaderCircle,
	Mail,
	MessageCircle,
	QrCode,
	ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import type { FloatingEmojiVariant } from "@/lib/gsap/use-floating-emoji-motion";
import { useFloatingEmojiMotion } from "@/lib/gsap/use-floating-emoji-motion";
import { downloadQrCodePng } from "@/lib/qr";
import { cn } from "@/lib/utils";
import {
	toCanonicalWishlistUrl,
	toEmailShareUrl,
	toWhatsAppShareUrl,
} from "@/lib/wishlist/share";
import { useWizardStore } from "./wizard-provider";

const CONFETTI_COLORS = ["#BCE25A", "#173E29", "#8FBEE0", "#E6A6BC"];

const FLOATING_EMOJIS: Array<{
	emoji: string;
	top: string;
	left: string;
	size: string;
	variant: FloatingEmojiVariant;
}> = [
	{ emoji: "🎉", left: "10%", size: "text-3xl", top: "14%", variant: "sway" },
	{ emoji: "🎈", left: "46%", size: "text-2xl", top: "8%", variant: "bounce" },
	{ emoji: "🎁", left: "84%", size: "text-3xl", top: "16%", variant: "zoom" },
	{ emoji: "✨", left: "6%", size: "text-xl", top: "38%", variant: "zoom" },
	{ emoji: "🎈", left: "90%", size: "text-2xl", top: "42%", variant: "bounce" },
	{ emoji: "🎊", left: "8%", size: "text-2xl", top: "72%", variant: "sway" },
	{ emoji: "🥳", left: "88%", size: "text-2xl", top: "78%", variant: "bounce" },
];

function FloatingEmojiBackground() {
	return (
		<div aria-hidden="true" className="pointer-events-none absolute inset-0">
			{FLOATING_EMOJIS.map((item) => (
				<span
					className={cn(
						item.size,
						"absolute select-none opacity-70 drop-shadow-sm",
					)}
					data-float-emoji={item.variant}
					key={`${item.emoji}-${item.top}-${item.left}`}
					style={{ left: item.left, top: item.top }}
				>
					{item.emoji}
				</span>
			))}
		</div>
	);
}

function fireConfetti() {
	if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
		return;
	}

	const base = { colors: CONFETTI_COLORS, spread: 70, ticks: 200 };
	confetti({ ...base, particleCount: 70, angle: 60, origin: { x: 0, y: 0.6 } });
	confetti({
		...base,
		particleCount: 70,
		angle: 120,
		origin: { x: 1, y: 0.6 },
	});
	confetti({
		...base,
		particleCount: 50,
		spread: 100,
		origin: { x: 0.5, y: 0.4 },
	});
}

export function PublishSuccessPanel({
	publishedUrl,
	dashboardUrlPath,
	whatsAppUrl,
	emailUrl,
	onCopyLink,
	onDownloadQr,
	isDownloadingQr,
}: {
	publishedUrl: string;
	dashboardUrlPath: string;
	whatsAppUrl: string;
	emailUrl: string;
	onCopyLink: () => void;
	onDownloadQr: () => void;
	isDownloadingQr: boolean;
}) {
	return (
		<div className="relative z-10 mx-auto w-full max-w-md text-center">
			<div
				className="mx-auto flex size-[72px] items-center justify-center rounded-full bg-primary text-[32px]"
				style={{ boxShadow: "0 12px 30px rgba(140,200,60,.4)" }}
			>
				🎉
			</div>
			<h1 className="mt-5 font-semibold font-serif text-[34px] text-foreground">
				¡Tu wishlist ya está publicada!
			</h1>
			<p className="mx-auto mt-2 max-w-[360px] text-[14px] text-muted-foreground">
				Compártela con tus invitados por enlace, WhatsApp o código QR.
			</p>

			<div className="mt-6 flex items-center gap-2.5 rounded-[14px] border border-border bg-card px-4 py-3.5 text-left">
				<span className="min-w-0 flex-1 truncate font-mono font-semibold text-[13px] text-foreground">
					{publishedUrl}
				</span>
				<Button
					className="min-h-9 shrink-0 rounded-full px-3.5 text-[12.5px]"
					onClick={onCopyLink}
					size="sm"
					type="button"
					variant="outline"
				>
					Copiar
				</Button>
			</div>

			<div className="mt-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
				<a
					className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-normal rounded-full bg-[#25D366] px-4 py-2 text-center font-medium text-sm text-white transition-colors hover:bg-[#1ebe57]"
					href={whatsAppUrl}
					rel="noreferrer"
					target="_blank"
				>
					<MessageCircle className="size-4 shrink-0" />
					WhatsApp
				</a>
				<Button
					className="min-h-11 whitespace-normal rounded-full"
					disabled={isDownloadingQr}
					onClick={onDownloadQr}
					type="button"
					variant="outline"
				>
					{isDownloadingQr ? (
						<LoaderCircle className="size-4 shrink-0 animate-spin" />
					) : (
						<QrCode className="size-4 shrink-0" />
					)}
					QR
				</Button>
				<a
					className={cn(
						buttonVariants({ variant: "outline" }),
						"min-h-11 whitespace-normal rounded-full",
					)}
					href={emailUrl}
				>
					<Mail className="size-4 shrink-0" />
					Email
				</a>
			</div>

			<a
				className={cn(
					buttonVariants(),
					"mt-6 min-h-12 w-full rounded-full px-[30px] text-[15px]",
				)}
				href={publishedUrl}
				rel="noreferrer"
				target="_blank"
			>
				<ExternalLink className="size-4" />
				Ver mi página
			</a>
			<Link
				className={cn(
					buttonVariants({ variant: "outline" }),
					"mt-2.5 min-h-11 w-full rounded-full",
				)}
				href={dashboardUrlPath}
			>
				<ShieldCheck className="size-4" />
				Gestionar en dashboard
			</Link>
		</div>
	);
}

export function PublishedStep() {
	const draft = useWizardStore((state) => state.draft);
	const publishSuccess = useWizardStore((state) => state.publishSuccess);
	const [isDownloadingQr, setIsDownloadingQr] = useState(false);
	const backgroundRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!publishSuccess) {
			return;
		}
		fireConfetti();
	}, [publishSuccess]);

	useFloatingEmojiMotion(backgroundRef, Boolean(publishSuccess));

	if (!publishSuccess) {
		return null;
	}

	const publishedUrl = toCanonicalWishlistUrl(publishSuccess.publicUrlPath);

	const handleCopyLink = async () => {
		try {
			await navigator.clipboard.writeText(publishedUrl);
			toast.success("Enlace copiado");
		} catch {
			toast.error("No se pudo copiar el enlace");
		}
	};

	const handleDownloadQr = async () => {
		if (isDownloadingQr) {
			return;
		}

		setIsDownloadingQr(true);

		try {
			await downloadQrCodePng({
				text: publishedUrl,
				fileName: `${publishSuccess.slug}-qr.png`,
			});
			toast.success("QR descargado");
		} catch {
			toast.error("No se pudo generar el QR");
		} finally {
			setIsDownloadingQr(false);
		}
	};

	return (
		<div
			className="relative mx-auto flex w-full max-w-4xl items-center justify-center overflow-hidden px-4 py-10 lg:h-full lg:px-10"
			ref={backgroundRef}
			style={{
				background:
					"radial-gradient(circle at 50% 0%, #F3FBE8, var(--background) 60%)",
			}}
		>
			<FloatingEmojiBackground />
			<PublishSuccessPanel
				dashboardUrlPath={publishSuccess.dashboardUrlPath}
				emailUrl={toEmailShareUrl(publishedUrl, draft.eventType)}
				isDownloadingQr={isDownloadingQr}
				onCopyLink={handleCopyLink}
				onDownloadQr={handleDownloadQr}
				publishedUrl={publishedUrl}
				whatsAppUrl={toWhatsAppShareUrl(publishedUrl, draft.eventType)}
			/>
		</div>
	);
}
