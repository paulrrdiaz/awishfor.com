"use client";

import { useEffect, useState } from "react";
import { formatCountdown } from "@/lib/format/countdown";

type Props = {
	eventDate: string;
	variant?: "default" | "chip";
};

export function Countdown({ eventDate, variant = "default" }: Props) {
	const [now, setNow] = useState(() => new Date());
	const text = formatCountdown(eventDate, now);

	useEffect(() => {
		const interval = window.setInterval(() => setNow(new Date()), 60_000);
		return () => window.clearInterval(interval);
	}, []);

	if (variant === "chip") {
		return (
			<div className="inline-flex h-[30px] shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3 font-semibold text-foreground text-xs">
				<span aria-hidden="true" className="size-1.5 rounded-full bg-primary" />
				{text}
			</div>
		);
	}

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
