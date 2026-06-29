"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useWizardStore } from "./wizard-provider";

export function RecoveryPrompt() {
	const needsRecovery = useWizardStore((s) => s.needsRecovery);
	const dismissRecovery = useWizardStore((s) => s.dismissRecovery);

	if (!needsRecovery) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm">
			<Card className="mx-4 w-full max-w-sm shadow-xl">
				<CardContent className="p-6">
					<h2 className="mb-2 font-semibold text-foreground text-lg">
						Tienes un borrador guardado
					</h2>
					<p className="mb-6 text-muted-foreground text-sm">
						Encontramos un borrador que guardaste hace más de 30 días. ¿Quieres
						continuar desde donde lo dejaste o empezar de cero?
					</p>
					<div className="flex flex-col gap-3">
						<Button
							className="w-full"
							onClick={() => dismissRecovery(false)}
							type="button"
						>
							Continuar borrador
						</Button>
						<Button
							className="w-full"
							onClick={() => dismissRecovery(true)}
							type="button"
							variant="outline"
						>
							Empezar de cero
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
