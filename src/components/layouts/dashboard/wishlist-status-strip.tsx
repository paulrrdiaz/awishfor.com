"use client";

import {
	CheckCircle2Icon,
	CircleIcon,
	MessageCircleIcon,
	SendIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RestoreWishlistDialogContent } from "@/components/features/dashboard/settings/wishlist-settings-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { PublishReadinessChecks } from "@/lib/wishlist/publish-readiness";
import {
	toCanonicalWishlistUrl,
	toWhatsAppShareUrl,
} from "@/lib/wishlist/share";
import { api } from "@/trpc/react";

const CHECK_LABELS: Record<keyof PublishReadinessChecks, string> = {
	title: "Tiene título",
	eventType: "Tiene tipo de evento",
	slug: "Tiene enlace público válido",
	language: "Tiene idioma",
	currency: "Tiene moneda",
	visibleGift: "Tiene al menos un regalo visible",
	images: "Tiene suficientes fotos de portada para su disposición",
};

type CopyState = "idle" | "success" | "error";

type Props = {
	wishlistId: string;
	status: string;
	publicUrlPath: string;
	eventType: string;
	isOwner: boolean;
	readiness: {
		ready: boolean;
		checks: PublishReadinessChecks;
	};
	totalViews?: number;
};

export function WishlistStatusStrip({
	wishlistId,
	status,
	publicUrlPath,
	eventType,
	isOwner,
	readiness,
	totalViews,
}: Props) {
	const statusKey = status.toLowerCase();

	if (statusKey === "draft") {
		return <DraftStrip readiness={readiness} wishlistId={wishlistId} />;
	}

	if (statusKey === "archived") {
		return <ArchivedStrip isOwner={isOwner} wishlistId={wishlistId} />;
	}

	return (
		<PublishedStrip
			eventType={eventType}
			publicUrlPath={publicUrlPath}
			totalViews={totalViews}
		/>
	);
}

function DraftStrip({
	wishlistId,
	readiness,
}: {
	wishlistId: string;
	readiness: Props["readiness"];
}) {
	const router = useRouter();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const publish = api.wishlist.publish.useMutation({
		onError: (error) => {
			setErrorMessage(
				error.data?.code === "PRECONDITION_FAILED"
					? "Completa los puntos pendientes antes de publicar."
					: error.message,
			);
		},
		onSuccess: () => {
			setErrorMessage(null);
			router.refresh();
		},
	});

	const checks = Object.entries(readiness.checks) as [
		keyof PublishReadinessChecks,
		boolean,
	][];
	const metCount = checks.filter(([, passed]) => passed).length;

	return (
		<div className="flex flex-col gap-2 border-amber-200 border-b bg-amber-50 px-7 py-3">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="min-w-0">
					<p className="font-semibold text-amber-900 text-sm">
						Esta wishlist aún no es pública
					</p>
					<p className="text-amber-800 text-xs">
						{metCount} de {checks.length} listos
					</p>
				</div>
				<Button
					disabled={!readiness.ready || publish.isPending}
					onClick={() => {
						setErrorMessage(null);
						publish.mutate({ wishlistId });
					}}
					size="sm"
					type="button"
				>
					<SendIcon />
					Publicar
				</Button>
			</div>
			<ul className="flex flex-wrap gap-x-4 gap-y-1">
				{checks.map(([key, passed]) => (
					<li className="flex items-center gap-1.5 text-xs" key={key}>
						{passed ? (
							<CheckCircle2Icon className="size-3.5 text-amber-700" />
						) : (
							<CircleIcon className="size-3.5 text-amber-400" />
						)}
						<span className={passed ? "text-amber-900" : "text-amber-700"}>
							{CHECK_LABELS[key]}
						</span>
					</li>
				))}
			</ul>
			{errorMessage && (
				<p className="text-destructive text-xs">{errorMessage}</p>
			)}
		</div>
	);
}

function PublishedStrip({
	publicUrlPath,
	eventType,
	totalViews,
}: {
	publicUrlPath: string;
	eventType: string;
	totalViews?: number;
}) {
	const [copyState, setCopyState] = useState<CopyState>("idle");
	const publicUrl = toCanonicalWishlistUrl(publicUrlPath);
	const whatsAppUrl = toWhatsAppShareUrl(publicUrl, eventType);

	useEffect(() => {
		if (copyState !== "success") {
			return;
		}
		const timeoutId = window.setTimeout(() => setCopyState("idle"), 1800);
		return () => window.clearTimeout(timeoutId);
	}, [copyState]);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(publicUrl);
			setCopyState("success");
		} catch {
			setCopyState("error");
		}
	};

	return (
		<div className="flex flex-wrap items-center justify-between gap-3 border-border border-b bg-[#edf7e9] px-7 py-2.5">
			<div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
				<span className="truncate text-[#3f7c44] text-sm">{publicUrl}</span>
				{typeof totalViews === "number" && (
					<span className="text-[#3f7c44]/70 text-xs">
						{totalViews} {totalViews === 1 ? "vista" : "vistas"}
					</span>
				)}
				{copyState === "success" && (
					<span className="text-[#3f7c44] text-xs">Enlace copiado</span>
				)}
				{copyState === "error" && (
					<span className="text-destructive text-xs" role="alert">
						No pudimos copiar el enlace.
					</span>
				)}
			</div>
			<div className="flex shrink-0 items-center gap-2">
				<Button
					onClick={() => void handleCopy()}
					size="sm"
					type="button"
					variant="outline"
				>
					Copiar enlace
				</Button>
				<Button asChild size="sm" variant="outline">
					<a href={whatsAppUrl} rel="noreferrer" target="_blank">
						<MessageCircleIcon />
						WhatsApp
					</a>
				</Button>
			</div>
		</div>
	);
}

function ArchivedStrip({
	wishlistId,
	isOwner,
}: {
	wishlistId: string;
	isOwner: boolean;
}) {
	const router = useRouter();
	const [restoreOpen, setRestoreOpen] = useState(false);
	const restore = api.wishlist.restore.useMutation({
		onSuccess: () => {
			setRestoreOpen(false);
			router.refresh();
		},
	});

	return (
		<div className="flex flex-wrap items-center justify-between gap-3 border-border border-b bg-muted px-7 py-2.5">
			<p className="text-muted-foreground text-sm">
				Esta wishlist está archivada
			</p>
			{isOwner && (
				<>
					<Button
						onClick={() => setRestoreOpen(true)}
						size="sm"
						type="button"
						variant="outline"
					>
						Restaurar
					</Button>
					<Dialog onOpenChange={setRestoreOpen} open={restoreOpen}>
						<DialogContent>
							<RestoreWishlistDialogContent
								disabled={restore.isPending}
								onRestoreDraft={() =>
									restore.mutate({ id: wishlistId, targetStatus: "draft" })
								}
								onRestorePublished={() =>
									restore.mutate({
										id: wishlistId,
										targetStatus: "published",
									})
								}
							/>
						</DialogContent>
					</Dialog>
				</>
			)}
		</div>
	);
}
