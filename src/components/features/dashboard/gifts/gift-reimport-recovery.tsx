"use client";

import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
	isPending: boolean;
	error?: string | null;
	onReimport: () => void;
};

export function GiftReimportRecovery({ isPending, error, onReimport }: Props) {
	return (
		<div className="mt-3 flex flex-col gap-3 rounded-lg border border-dashed bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between">
			<div className="min-w-0">
				<p className="font-medium text-sm">¿La imagen dejó de cargar?</p>
				<p className="mt-0.5 text-foreground/75 text-xs">
					Vuelve a traer la imagen y los datos disponibles desde la tienda.
				</p>
				{error && <p className="mt-1.5 text-destructive text-xs">{error}</p>}
			</div>
			<Button
				className="shrink-0"
				disabled={isPending}
				onClick={onReimport}
				size="sm"
				type="button"
				variant="outline"
			>
				{isPending ? <Loader2 className="animate-spin" /> : <RefreshCw />}
				Reimportar datos
			</Button>
		</div>
	);
}
