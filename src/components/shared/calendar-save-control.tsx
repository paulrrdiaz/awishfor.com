"use client";

import { CalendarPlusIcon, DownloadIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
	type CalendarEventInput,
	createCalendarEvent,
} from "@/lib/calendar/calendar-event";

export type CalendarSaveControlProps = CalendarEventInput;

export function CalendarSaveControl(props: CalendarSaveControlProps) {
	const [open, setOpen] = useState(false);
	const controlRef = useRef<HTMLDivElement>(null);
	const calendarEvent = createCalendarEvent(props);

	useEffect(() => {
		function closeOnOutsidePointerDown(event: PointerEvent) {
			if (
				controlRef.current &&
				event.target instanceof Node &&
				!controlRef.current.contains(event.target)
			) {
				setOpen(false);
			}
		}

		document.addEventListener("pointerdown", closeOnOutsidePointerDown);
		return () =>
			document.removeEventListener("pointerdown", closeOnOutsidePointerDown);
	}, []);

	function downloadIcalendar() {
		const blob = new Blob([calendarEvent.icalendar], {
			type: "text/calendar;charset=utf-8",
		});
		const href = URL.createObjectURL(blob);
		const anchor = document.createElement("a");
		anchor.href = href;
		anchor.download = calendarEvent.filename;
		anchor.click();
		URL.revokeObjectURL(href);
		setOpen(false);
	}

	return (
		<div className="pointer-events-none fixed right-[max(1rem,env(safe-area-inset-right))] bottom-[calc(env(safe-area-inset-bottom)+1rem)] z-40">
			<div className="pointer-events-auto relative" ref={controlRef}>
				{open && (
					<div
						aria-label="Opciones para guardar la fecha"
						className="absolute right-0 bottom-full mb-2 w-64 rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-lg"
						role="menu"
					>
						<a
							className="flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-popover"
							href={calendarEvent.googleCalendarUrl}
							rel="noreferrer"
							role="menuitem"
							target="_blank"
						>
							<CalendarPlusIcon aria-hidden="true" className="size-4" />
							Abrir en Google Calendar
						</a>
						<button
							className="flex min-h-11 w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm outline-none hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-popover"
							onClick={downloadIcalendar}
							role="menuitem"
							type="button"
						>
							<DownloadIcon aria-hidden="true" className="size-4" />
							Descargar .ics para Apple, Outlook y otros calendarios
						</button>
					</div>
				)}
				<button
					aria-expanded={open}
					aria-haspopup="menu"
					className="flex min-h-11 items-center gap-2 rounded-full border border-border bg-card px-4 py-2 font-medium text-card-foreground text-sm shadow-lg outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
					onClick={() => setOpen((value) => !value)}
					type="button"
				>
					<CalendarPlusIcon aria-hidden="true" className="size-4" />
					Guardar en mi calendario
				</button>
			</div>
		</div>
	);
}
