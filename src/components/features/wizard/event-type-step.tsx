"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
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
	const searchParams = useSearchParams();

	useEffect(() => {
		const typeParam = searchParams.get("type");
		if (
			!selectedType &&
			typeParam &&
			EVENT_TYPES.includes(typeParam as EventType)
		) {
			setEventType(typeParam as EventType);
		}
	}, [searchParams, selectedType, setEventType]);

	return (
		<div className="mx-auto w-full max-w-3xl px-4 py-10 lg:h-full lg:max-w-none lg:overflow-y-auto lg:px-8 lg:py-16">
			<div className="mx-auto mb-8 max-w-[560px] text-center lg:mb-10">
				<h1 className="mb-2 font-semibold text-2xl text-foreground lg:font-serif lg:text-[32px] lg:tracking-tight">
					¿Qué vas a celebrar?
				</h1>
				<p className="text-muted-foreground text-sm">
					Elige el tipo de evento para tu wishlist. Podrás afinar todo lo demás
					en los siguientes pasos.
				</p>
			</div>

			<div className="mx-auto grid max-w-[1080px] grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
				{EVENT_TYPES.map((type) => {
					const preset = EVENT_TYPE_PRESETS[type];
					const isSelected = selectedType === type;

					return (
						<Button
							className={cn(
								"flex h-auto flex-col items-center justify-center gap-3 whitespace-normal rounded-xl border-2 bg-card px-4 py-7 text-center text-card-foreground transition-all hover:border-primary/50 hover:bg-accent",
								isSelected &&
									"border-primary bg-primary/5 hover:border-primary hover:bg-primary/5",
							)}
							key={type}
							onClick={() => setEventType(type)}
							type="button"
							variant="outline"
						>
							<span aria-hidden className="text-[32px] leading-none">
								{EVENT_TYPE_ICONS[type]}
							</span>
							<span className="font-semibold text-[15px]">{preset.label}</span>
						</Button>
					);
				})}
			</div>
		</div>
	);
}
