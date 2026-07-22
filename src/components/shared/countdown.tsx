"use client";

import { useEffect, useState } from "react";
import { formatCountdown } from "@/lib/format/countdown";

type Props = {
	eventDate: string;
};

export function Countdown({ eventDate }: Props) {
	const [now, setNow] = useState(() => new Date());
	const text = formatCountdown(eventDate, now);

	useEffect(() => {
		const interval = window.setInterval(() => setNow(new Date()), 60_000);
		return () => window.clearInterval(interval);
	}, []);

	return (
		<div className="px-6 py-4 text-center">
			<div className="mx-auto inline-flex flex-col items-center gap-1 rounded-2xl bg-accent px-8 py-5">
				<span className="font-medium text-accent-foreground/70 text-xs uppercase tracking-[0.2em]">
					La cuenta regresiva
				</span>
				<span className="font-heading font-semibold text-accent-foreground text-lg">
					{text}
				</span>
			</div>
		</div>
	);
}
