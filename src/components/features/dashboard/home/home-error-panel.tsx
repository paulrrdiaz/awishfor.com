import { AlertCircleIcon, RefreshCwIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PreparationRibbon, RibbonNode } from "./preparation-ribbon";

type Props = {
	onRetry: () => void;
};

export function HomeErrorPanel({ onRetry }: Props) {
	return (
		<PreparationRibbon>
			<RibbonNode label="Tu siguiente paso" tone="error">
				<div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 md:p-6">
					<span className="flex size-9 shrink-0 items-center justify-center rounded-[11px] bg-[#FDF3F2] text-[#A8443A]">
						<AlertCircleIcon className="size-5" />
					</span>
					<div className="min-w-0">
						<h2 className="font-semibold text-base">
							No pudimos cargar tus acciones
						</h2>
						<p className="mt-1.5 text-muted-foreground text-sm">
							Falló la lectura del resumen de tus wishlists. Tus listas y tus
							regalos están a salvo — solo no podemos calcular qué sigue.
						</p>
						<div className="mt-4 flex flex-wrap items-center gap-4">
							<Button
								className="rounded-full bg-foreground text-background hover:bg-foreground/90"
								onClick={onRetry}
								type="button"
							>
								<RefreshCwIcon />
								Reintentar
							</Button>
							<Button asChild variant="link">
								<Link href="/dashboard/wishlists">Ir a Mis wishlists</Link>
							</Button>
						</div>
					</div>
				</div>
			</RibbonNode>
			<RibbonNode label="Después" tone="pending">
				<div className="rounded-xl border border-border border-dashed bg-card px-4 py-5 text-center">
					<p className="text-muted-foreground text-sm">
						Las tareas siguientes aparecerán aquí cuando el resumen vuelva a
						cargar.
					</p>
				</div>
			</RibbonNode>
		</PreparationRibbon>
	);
}
