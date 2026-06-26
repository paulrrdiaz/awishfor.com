"use client";

import { useWizardStore } from "./wizard-provider";

export function RecoveryPrompt() {
	const needsRecovery = useWizardStore((s) => s.needsRecovery);
	const dismissRecovery = useWizardStore((s) => s.dismissRecovery);

	if (!needsRecovery) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
			<div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
				<h2 className="mb-2 font-semibold text-gray-900 text-lg">
					Tienes un borrador guardado
				</h2>
				<p className="mb-6 text-gray-600 text-sm">
					Encontramos un borrador que guardaste hace más de 30 días. ¿Quieres
					continuar desde donde lo dejaste o empezar de cero?
				</p>
				<div className="flex flex-col gap-3">
					<button
						className="w-full rounded-xl bg-gray-900 px-4 py-2.5 font-medium text-sm text-white transition-colors hover:bg-gray-700"
						onClick={() => dismissRecovery(false)}
						type="button"
					>
						Continuar borrador
					</button>
					<button
						className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 font-medium text-gray-700 text-sm transition-colors hover:bg-gray-50"
						onClick={() => dismissRecovery(true)}
						type="button"
					>
						Empezar de cero
					</button>
				</div>
			</div>
		</div>
	);
}
