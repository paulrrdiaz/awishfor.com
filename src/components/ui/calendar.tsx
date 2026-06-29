"use client";

import { Input } from "@/components/ui/input";

type CalendarProps = Omit<React.ComponentProps<typeof Input>, "type">;

// Base UI does not currently ship a first-class calendar primitive in this project,
// so this thin wrapper is the documented Tailwind fallback for date selection.
function Calendar(props: CalendarProps) {
	return <Input data-slot="calendar" type="date" {...props} />;
}

export { Calendar };
