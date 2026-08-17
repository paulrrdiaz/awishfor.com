"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type DatePickerProps = {
	date: Date | null;
	onDateChange: (date: Date | null) => void;
	placeholder?: string;
	disabled?: boolean;
	className?: string;
	id?: string;
};

function DatePicker({
	date,
	onDateChange,
	placeholder = "Seleccionar fecha",
	disabled = false,
	className,
	id,
}: DatePickerProps) {
	const [open, setOpen] = useState(false);

	const label = date
		? format(date, "d 'de' MMMM 'de' yyyy", { locale: es })
		: placeholder;

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
						onSelect={(selected) => {
							onDateChange(selected ?? null);
							setOpen(false);
						}}
						selected={date ?? undefined}
					/>
				</PopoverContent>
			</Popover>
			{date && !disabled && (
				<Button
					aria-label="Borrar fecha"
					className="absolute right-1 text-muted-foreground hover:text-foreground"
					onClick={() => onDateChange(null)}
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

export { DatePicker };
