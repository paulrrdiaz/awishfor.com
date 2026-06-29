"use client";

import { Button } from "@/components/ui/button";
import { EVENT_TYPE_PRESETS } from "@/config/event-type-presets";
import { EventType } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";
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
		<div className="mx-auto w-full max-w-2xl">
			<h1 className="mb-2 text-center font-semibold text-2xl text-foreground">
				¿Cuál es la ocasión?
			</h1>
			<p className="mb-8 text-center text-muted-foreground text-sm">
				Elige el tipo de evento para tu wishlist
			</p>

			<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
				{EVENT_TYPES.map((type) => {
					const preset = EVENT_TYPE_PRESETS[type];
					const isSelected = selectedType === type;

					return (
						<button
							className={cn(
								"flex min-h-28 flex-col items-center justify-center gap-2 rounded-xl border-2 px-4 py-5 text-center transition-all focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
								isSelected
									? "border-primary bg-primary text-primary-foreground shadow-sm"
									: "border-border bg-card text-card-foreground hover:border-primary/50 hover:bg-accent",
							)}
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
					<Button onClick={regenerateCopy} type="button" variant="link">
						Regenerar sugerencias de texto
					</Button>
				</div>
			)}
		</div>
	);
}
