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
		<div className="py-4 text-center">
			<span className="font-medium text-primary text-sm uppercase">{text}</span>
		</div>
	);
}
