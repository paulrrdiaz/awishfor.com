"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";

type Props = {
	wishlistSlug: string;
	guestSlug: string;
	status: string;
	tone?: "default" | "on-photo";
};

export function RsvpControl({
	wishlistSlug,
	guestSlug,
	status,
	tone = "default",
}: Props) {
	const router = useRouter();
	const [localStatus, setLocalStatus] = useState(status);
	const isOnPhoto = tone === "on-photo";

	const respondMutation = api.invite.respond.useMutation({
		onError: () => {
			toast.error("No pudimos guardar tu respuesta. Intenta de nuevo.");
		},
		onSuccess: (data) => {
			setLocalStatus(data.status);
			router.refresh();
			toast.success(
				data.status === "confirmed"
					? "¡Gracias por confirmar!"
					: "Respuesta registrada",
			);
		},
	});

	function respond(next: "confirmed" | "declined") {
		respondMutation.mutate({ wishlistSlug, guestSlug, status: next });
	}

	if (localStatus === "confirmed") {
		return (
			<p className={cn("font-medium text-sm", isOnPhoto && "text-white")}>
				Confirmaste tu asistencia ✓
			</p>
		);
	}

	if (localStatus === "declined") {
		return (
			<p
				className={cn(
					"font-medium text-sm",
					isOnPhoto ? "text-white/90" : "text-muted-foreground",
				)}
			>
				Indicaste que no podrás asistir
			</p>
		);
	}

	return (
		<div className="mt-3 flex flex-wrap gap-2">
			<Button
				className={cn(isOnPhoto && "bg-white text-gray-900 hover:bg-white/90")}
				disabled={respondMutation.isPending}
				onClick={() => respond("confirmed")}
				size="sm"
				type="button"
			>
				{respondMutation.isPending ? (
					<Loader2 className="animate-spin" />
				) : null}
				Confirmar asistencia
			</Button>
			<Button
				className={cn(
					isOnPhoto && "border-white/40 text-white hover:bg-white/10",
				)}
				disabled={respondMutation.isPending}
				onClick={() => respond("declined")}
				size="sm"
				type="button"
				variant="outline"
			>
				No podré asistir
			</Button>
		</div>
	);
}
