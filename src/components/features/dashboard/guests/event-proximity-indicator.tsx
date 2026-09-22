import { CalendarClock } from "lucide-react";
import type { EventProximity } from "@/lib/dashboard/invite-follow-up";

export function EventProximityIndicator({
	proximity,
}: {
	proximity: EventProximity;
}) {
	return (
		<div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
			<span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-muted">
				<CalendarClock className="size-4 text-muted-foreground" />
			</span>
			<p className="font-semibold text-sm">{proximity.label}</p>
		</div>
	);
}
