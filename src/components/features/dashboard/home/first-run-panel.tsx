import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PreparationRibbon, RibbonNode } from "./preparation-ribbon";

const STEPS = [
	{
		title: "Crea tu wishlist",
		description: "Nombre, tipo de evento y fecha.",
	},
	{
		title: "Añade regalos",
		description: "Enlázalos de cualquier tienda o escríbelos a mano.",
	},
	{
		title: "Compártela",
		description: "Un enlace por WhatsApp y listo.",
	},
];

export function FirstRunPanel() {
	return (
		<PreparationRibbon>
			<RibbonNode label="Empieza aquí" tone="pending">
				<div className="rounded-2xl border border-border bg-card p-5 md:p-6">
					<h2 className="font-heading font-semibold text-xl">
						Tu wishlist en tres pasos
					</h2>
					<p className="mt-2 text-muted-foreground text-sm">
						Cada paso queda guardado, así que puedes volver cuando quieras.
					</p>

					<ol className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
						{STEPS.map((step, index) => (
							<li
								className="flex flex-col gap-2 md:items-start"
								key={step.title}
							>
								<span
									className={cn(
										"flex size-[26px] shrink-0 items-center justify-center rounded-full font-semibold text-xs",
										index === 0
											? "bg-[#C3E63E] text-[#1A2400]"
											: "border-2 border-[#CFE0AE] text-muted-foreground",
									)}
								>
									{index + 1}
								</span>
								<div>
									<p className="font-semibold text-sm">{step.title}</p>
									<p className="mt-0.5 text-muted-foreground text-xs">
										{step.description}
									</p>
								</div>
							</li>
						))}
					</ol>

					<div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
						<Button asChild className="rounded-full">
							<Link href="/create">Crear mi primera wishlist</Link>
						</Button>
						<Button asChild variant="link">
							<Link href="/w/esperando-a-mateo">
								Ver una wishlist de ejemplo
							</Link>
						</Button>
					</div>
				</div>
			</RibbonNode>
		</PreparationRibbon>
	);
}
