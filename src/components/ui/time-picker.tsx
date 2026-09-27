"use client";

import { ClockIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type TimePickerProps = {
	/** "HH:mm" (24h) or null */
	time: string | null;
	onTimeChange: (time: string | null) => void;
	placeholder?: string;
	disabled?: boolean;
	className?: string;
	id?: string;
	/** Minutes between suggested slots. */
	step?: number;
};

function buildSlots(step: number): string[] {
	const slots: string[] = [];
	for (let minutes = 0; minutes < 24 * 60; minutes += step) {
		const h = String(Math.floor(minutes / 60)).padStart(2, "0");
		const m = String(minutes % 60).padStart(2, "0");
		slots.push(`${h}:${m}`);
	}
	return slots;
}

function formatTimeLabel(time: string): string {
	const [hours = 0, minutes = 0] = time.split(":").map(Number);
	const period = hours < 12 ? "a. m." : "p. m.";
	const displayHour = hours % 12 === 0 ? 12 : hours % 12;
	return `${displayHour}:${String(minutes).padStart(2, "0")} ${period}`;
}

function TimePicker({
	time,
	onTimeChange,
	placeholder = "Seleccionar hora",
	disabled = false,
	className,
	id,
	step = 15,
}: TimePickerProps) {
	const [open, setOpen] = useState(false);

	const baseSlots = buildSlots(step);
	const slots =
		time && !baseSlots.includes(time) ? [...baseSlots, time].sort() : baseSlots;

	return (
		<div className="relative flex items-center">
			<Popover onOpenChange={setOpen} open={open}>
				<PopoverTrigger asChild>
					<Button
						className={cn(
							"min-h-11 w-full justify-start gap-2 font-normal",
							time && "pr-9",
							!time && "text-muted-foreground",
							className,
						)}
						disabled={disabled}
						id={id}
						type="button"
						variant="outline"
					>
						<ClockIcon className="size-4 shrink-0" />
						<span className="flex-1 truncate text-left">
							{time ? formatTimeLabel(time) : placeholder}
						</span>
					</Button>
				</PopoverTrigger>
				<PopoverContent
					align="start"
					className="max-h-64 w-(--radix-popover-trigger-width) min-w-40 overflow-y-auto p-1"
					onOpenAutoFocus={(e) => {
						e.preventDefault();
						const target = e.currentTarget as HTMLElement | null;
						const selected =
							target?.querySelector<HTMLElement>("[aria-selected=true]") ??
							target?.querySelector<HTMLElement>('[data-time="09:00"]');
						selected?.scrollIntoView({ block: "center" });
						selected?.focus();
					}}
				>
					<div aria-label="Horas disponibles" role="listbox">
						{slots.map((slot) => {
							const isSelected = slot === time;
							return (
								<button
									aria-selected={isSelected}
									className={cn(
										"flex w-full items-center rounded-md px-3 py-2 text-left text-sm outline-none hover:bg-accent focus-visible:bg-accent",
										isSelected &&
											"bg-primary text-primary-foreground hover:bg-primary focus-visible:bg-primary",
									)}
									data-time={slot}
									key={slot}
									onClick={() => {
										onTimeChange(slot);
										setOpen(false);
									}}
									role="option"
									type="button"
								>
									{formatTimeLabel(slot)}
								</button>
							);
						})}
					</div>
				</PopoverContent>
			</Popover>
			{time && !disabled && (
				<Button
					aria-label="Borrar hora"
					className="absolute right-1 text-muted-foreground hover:text-foreground"
					onClick={() => onTimeChange(null)}
					size="icon-sm"
					type="button"
					variant="ghost"
				>
					<XIcon className="size-4" />
				</Button>
			)}
		</div>
	);
}

export { formatTimeLabel, TimePicker };
