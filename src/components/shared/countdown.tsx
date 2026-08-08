"use client";

import { useEffect, useState } from "react";
import {
	type CountdownVariantId,
	resolveCountdownVariant,
} from "@/config/public-message-variants";
import {
	formatCountdown,
	getCountdownDays,
	getCountdownProgress,
} from "@/lib/format/countdown";
import { cn } from "@/lib/utils";

type Props = {
	eventDate: string;
	createdAt?: string | null;
	variant?: string | null;
	className?: string;
};

function PastEventMessage({ text }: { text: string }) {
	return (
		<div className="px-6 py-4 text-center">
			<p className="text-muted-foreground text-sm">{text}</p>
		</div>
	);
}

function FilledPill({ text }: { text: string }) {
	return (
		<div className="inline-flex h-[30px] shrink-0 items-center gap-1.5 rounded-full bg-foreground px-3 font-semibold text-background text-xs">
			<span
				aria-hidden="true"
				className="size-1.5 rounded-full bg-background"
			/>
			{text}
		</div>
	);
}

function OutlinePill({ text }: { text: string }) {
	return (
		<div className="inline-flex h-[30px] shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3 font-semibold text-foreground text-xs">
			<span aria-hidden="true" className="size-1.5 rounded-full bg-primary" />
			{text}
		</div>
	);
}

function ProgressBar({ text, progress }: { text: string; progress: number }) {
	return (
		<div className="mx-auto w-full max-w-xs px-6 py-4 text-center">
			<span className="font-medium text-muted-foreground text-xs uppercase tracking-[0.2em]">
				La cuenta regresiva
			</span>
			<p className="mt-1 font-heading font-semibold text-foreground text-lg">
				{text}
			</p>
			<div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-muted">
				<div
					className="h-full rounded-full bg-primary"
					style={{ width: `${progress}%` }}
				/>
			</div>
			<div className="mt-1.5 flex justify-between font-mono text-[9px] text-muted-foreground uppercase tracking-[0.16em]">
				<span>Lista creada</span>
				<span>Gran día</span>
			</div>
		</div>
	);
}

export function Countdown({ eventDate, createdAt, variant, className }: Props) {
	const [now, setNow] = useState(() => new Date());

	useEffect(() => {
		const interval = window.setInterval(() => setNow(new Date()), 60_000);
		return () => window.clearInterval(interval);
	}, []);

	const text = formatCountdown(eventDate, now);
	const isPastEvent = getCountdownDays(eventDate, now) < 0;
	const resolvedVariant = resolveCountdownVariant(variant)
		.id as CountdownVariantId;

	if (isPastEvent) {
		return (
			<div className={className}>
				<PastEventMessage text={text} />
			</div>
		);
	}

	if (resolvedVariant === "filled-pill") {
		return (
			<div className={cn("px-6 py-4 text-center", className)}>
				<FilledPill text={text} />
			</div>
		);
	}

	if (resolvedVariant === "progress-bar") {
		const progress = createdAt
			? getCountdownProgress(createdAt, eventDate, now)
			: 0;
		return (
			<div className={className}>
				<ProgressBar progress={progress} text={text} />
			</div>
		);
	}

	return (
		<div className={cn("px-6 py-4 text-center", className)}>
			<OutlinePill text={text} />
		</div>
	);
}
