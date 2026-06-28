"use client";

import { Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { DashboardWishlistOverviewViewModel } from "@/server/mappers/view-models";
import { api } from "@/trpc/react";
import { OverviewShare } from "./overview-share";

type Props = {
	wishlist: Pick<
		DashboardWishlistOverviewViewModel,
		"id" | "slug" | "status" | "publicUrlPath" | "readiness" | "eventType"
	>;
};

export function PublishButton({ wishlist }: Props) {
	const router = useRouter();
	const [isPublished, setIsPublished] = useState(
		wishlist.status === "published",
	);
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
			setIsPublished(true);
			router.refresh();
		},
	});

	if (isPublished) {
		return (
			<section className="space-y-3">
				<div>
					<h2 className="font-heading font-semibold text-xl">Compartir</h2>
					<p className="mt-1 text-muted-foreground text-sm">
						Esta wishlist ya está publicada.
					</p>
				</div>
				<OverviewShare
					eventType={wishlist.eventType}
					publicUrlPath={wishlist.publicUrlPath}
					slug={wishlist.slug}
				/>
			</section>
		);
	}

	return (
		<section className="rounded-xl border border-border bg-card p-5 shadow-sm">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 className="font-heading font-semibold text-xl">Publicar</h2>
					<p className="mt-1 text-muted-foreground text-sm">
						Al publicar, tus invitados podrán abrir el enlace público.
					</p>
				</div>
				<Button
					disabled={!wishlist.readiness.ready || publish.isPending}
					onClick={() => {
						setErrorMessage(null);
						publish.mutate({ wishlistId: wishlist.id });
					}}
					type="button"
				>
					<Send />
					Publicar
				</Button>
			</div>
			{!wishlist.readiness.ready && (
				<p className="mt-3 text-muted-foreground text-sm">
					Completa la lista de publicación para habilitar esta acción.
				</p>
			)}
			{errorMessage && (
				<p className="mt-3 text-destructive text-sm">{errorMessage}</p>
			)}
		</section>
	);
}
