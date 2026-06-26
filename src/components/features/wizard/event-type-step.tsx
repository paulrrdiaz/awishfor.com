"use client";

import { EVENT_TYPE_PRESETS } from "@/config/event-type-presets";
import { EventType } from "@/generated/prisma/enums";
import { useWizardStore } from "./wizard-provider";

const EVENT_TYPES = Object.values(EventType) as EventType[];

const EVENT_TYPE_ICONS: Record<EventType, string> = {
	baby_shower: "🍼",
	birthday: "🎂",
	wedding: "💍",
	housewarming: "🏠",
	general: "🎁",
};

export function EventTypeStep() {
	const selectedType = useWizardStore((s) => s.draft.eventType);
	const setEventType = useWizardStore((s) => s.setEventType);
	const regenerateCopy = useWizardStore((s) => s.regenerateCopy);

	return (
		<div className="mx-auto w-full max-w-2xl px-4 py-8">
			<h1 className="mb-2 text-center font-semibold text-2xl text-gray-900">
				¿Cuál es la ocasión?
			</h1>
			<p className="mb-8 text-center text-gray-500 text-sm">
				Elige el tipo de evento para tu wishlist
			</p>

			<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
				{EVENT_TYPES.map((type) => {
					const preset = EVENT_TYPE_PRESETS[type];
					const isSelected = selectedType === type;

					return (
						<button
							className={[
								"flex flex-col items-center gap-2 rounded-2xl border-2 px-4 py-5 text-center transition-all",
								isSelected
									? "border-gray-900 bg-gray-900 text-white"
									: "border-gray-200 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50",
							].join(" ")}
							key={type}
							onClick={() => setEventType(type)}
							type="button"
						>
							<span aria-hidden className="text-2xl">
								{EVENT_TYPE_ICONS[type]}
							</span>
							<span className="font-medium text-sm">{preset.label}</span>
						</button>
					);
				})}
			</div>

			{selectedType && (
				<div className="mt-6 text-center">
					<button
						className="text-gray-500 text-sm underline underline-offset-4 hover:text-gray-700"
						onClick={regenerateCopy}
						type="button"
					>
						Regenerar sugerencias de texto
					</button>
				</div>
			)}
		</div>
	);
}
