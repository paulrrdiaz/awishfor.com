/* biome-ignore-all lint/performance/noImgElement: thumbnails are URL-sized and enabled only after hero activation. */
"use client";
import { useEffect, useRef, useState } from "react";

import { HERO_OCCASIONS } from "./hero-occasions";

/** One accessible proof rail, replaced in sync with the active photograph. */
export function HeroExampleRail() {
	const [occasionId, setOccasionId] = useState<string>(
		HERO_OCCASIONS[0]?.id ?? "",
	);
	const [mediaEnabled, setMediaEnabled] = useState(false);
	const [motion, setMotion] = useState<"entering" | "exiting" | "idle">("idle");
	const occasionIdRef = useRef<string>(occasionId);
	const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const enterFrameRef = useRef<number | null>(null);

	useEffect(() => {
		const clearSwap = () => {
			if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
			if (enterFrameRef.current) cancelAnimationFrame(enterFrameRef.current);
			exitTimerRef.current = null;
			enterFrameRef.current = null;
		};
		const update = (event: Event) => {
			const next = (event as CustomEvent<{ id: string }>).detail.id;
			if (
				next === occasionIdRef.current ||
				!HERO_OCCASIONS.some((occasion) => occasion.id === next)
			)
				return;
			setMediaEnabled(true);
			clearSwap();
			if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
				occasionIdRef.current = next;
				setOccasionId(next);
				setMotion("idle");
				return;
			}

			setMotion("exiting");
			exitTimerRef.current = setTimeout(() => {
				occasionIdRef.current = next;
				setOccasionId(next);
				setMotion("entering");
				requestAnimationFrame(() => {
					enterFrameRef.current = requestAnimationFrame(() => {
						enterFrameRef.current = null;
						setMotion("idle");
					});
				});
			}, 160);
		};
		window.addEventListener("hero-occasion-change", update);
		return () => {
			clearSwap();
			window.removeEventListener("hero-occasion-change", update);
		};
	}, []);
	const occasion =
		HERO_OCCASIONS.find(({ id }) => id === occasionId) ?? HERO_OCCASIONS[0];
	return (
		<aside
			aria-label={`Ejemplo real: la wishlist de ${occasion.rail.name}`}
			aria-live="polite"
			className="relative mt-8 inline-flex h-24 w-full overflow-hidden rounded-lg border border-white/[.2] bg-[#081A0F]/[.72] px-4 py-3 text-white shadow-[0_10px_26px_rgba(0,0,0,.16)] backdrop-blur-sm"
			data-hero-rail
		>
			<div
				className={`flex w-full items-center gap-3 transition-opacity motion-reduce:transition-none ${
					motion === "exiting"
						? "opacity-0 duration-[160ms] ease-in"
						: motion === "entering"
							? "opacity-0 duration-0"
							: "opacity-100 duration-[280ms] [transition-timing-function:cubic-bezier(.22,1,.36,1)]"
				}`}
				data-hero-rail-content
			>
				<div className="space-y-1 border-white/[.22] border-r pr-3">
					<p className="font-mono text-[#D7F09E] text-xs uppercase tracking-[0.16em]">
						{occasion.rail.eyebrow}
					</p>
					<p className="m-serif font-semibold text-md leading-none">
						{occasion.rail.name}
					</p>
					<p className="whitespace-nowrap text-white/[.7] text-xs">
						{occasion.rail.meta}
					</p>
				</div>
				<div className="hidden flex-1 justify-start gap-2 sm:flex">
					{occasion.rail.gifts.slice(0, 2).map((gift) => (
						<div className="flex min-w-0 items-center gap-1" key={gift.name}>
							{mediaEnabled ? (
								<img
									alt=""
									className="h-8 w-8 shrink-0 rounded-[4px] object-cover"
									fetchPriority="low"
									height={32}
									loading="lazy"
									src={gift.image}
									width={32}
								/>
							) : (
								<span
									aria-hidden
									className="h-8 w-8 shrink-0 rounded-[4px] bg-white/10"
								/>
							)}
							<p className="truncate font-medium text-white/[.9] text-xs">
								{gift.name}
							</p>
						</div>
					))}
				</div>
				<a
					className="shrink-0 font-semibold text-[#D7F09E] text-sm hover:text-white focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-4"
					href="#ejemplo"
				>
					<span className="sm:hidden">Ver →</span>
					<span className="hidden sm:inline">Ver esta wishlist →</span>
				</a>
			</div>
		</aside>
	);
}
