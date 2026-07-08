"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type DateTimePickerProps = {
	date: Date | null;
	time: string | null;
	onDateChange: (date: Date | null) => void;
	onTimeChange: (time: string | null) => void;
	placeholder?: string;
	disabled?: boolean;
	className?: string;
	id?: string;
};

function normalizeTime(value: string): string | null {
	const match = /^(\d{2}:\d{2})/.exec(value);
	return match?.[1] ?? null;
}

function formatTimeLabel(time: string): string {
	const [hours, minutes] = time.split(":").map(Number);
	const reference = new Date();
	reference.setHours(hours ?? 0, minutes ?? 0, 0, 0);
	return format(reference, "h:mm a");
}

function DateTimePicker({
	date,
	time,
	onDateChange,
	onTimeChange,
	placeholder = "Seleccionar fecha y hora",
	disabled = false,
	className,
	id,
}: DateTimePickerProps) {
	const [open, setOpen] = useState(false);

	const label = date
		? time
			? `${format(date, "d 'de' MMMM 'de' yyyy", { locale: es })}, ${formatTimeLabel(time)}`
			: format(date, "d 'de' MMMM 'de' yyyy", { locale: es })
		: placeholder;

	function handleClear() {
		onDateChange(null);
		onTimeChange(null);
	}

	return (
		<div className="relative flex items-center">
			<Popover onOpenChange={setOpen} open={open}>
				<PopoverTrigger asChild>
					<Button
						className={cn(
							"min-h-11 w-full justify-start gap-2 font-normal",
							date && "pr-9",
							!date && "text-muted-foreground",
							className,
						)}
						disabled={disabled}
						id={id}
						type="button"
						variant="outline"
					>
						<CalendarIcon className="size-4 shrink-0" />
						<span className="flex-1 truncate text-left">{label}</span>
					</Button>
				</PopoverTrigger>
				<PopoverContent align="start" className="w-auto p-0">
					<Calendar
						mode="single"
						onSelect={(selected) => onDateChange(selected ?? null)}
						selected={date ?? undefined}
					/>
					<div className="flex items-center gap-2 border-border border-t p-3">
						<Input
							className="min-h-9"
							disabled={!date}
							onChange={(e) => onTimeChange(normalizeTime(e.target.value))}
							type="time"
							value={time ?? ""}
						/>
					</div>
				</PopoverContent>
			</Popover>
			{date && !disabled && (
				<Button
					aria-label="Borrar fecha y hora"
					className="absolute right-1 text-muted-foreground hover:text-foreground"
					onClick={handleClear}
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

export { DateTimePicker };
