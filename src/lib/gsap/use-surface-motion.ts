"use client";

import gsap from "gsap";
import type { RefObject } from "react";
import { useEffect } from "react";
import { useReducedMotion } from "@/lib/gsap/use-reduced-motion";

type Preset = "modal" | "sheet" | "toast";

const presets: Record<Preset, { y: number; scale?: number; duration: number }> =
	{
		modal: { y: 18, scale: 0.96, duration: 0.3 },
		sheet: { y: 28, duration: 0.28 },
		toast: { y: 10, scale: 0.98, duration: 0.24 },
	};

export function useSurfaceMotion(
	ref: RefObject<HTMLElement | null>,
	preset: Preset,
	active = true,
) {
	const reducedMotion = useReducedMotion();

	useEffect(() => {
		const element = ref.current;
		if (!element || !active) {
			return;
		}

		if (reducedMotion) {
			gsap.set(element, { clearProps: "all", opacity: 1, scale: 1, y: 0 });
			return;
		}

		const config = presets[preset];
		const animation = gsap.fromTo(
			element,
			{
				opacity: 0,
				y: config.y,
				scale: config.scale ?? 1,
			},
			{
				opacity: 1,
				y: 0,
				scale: 1,
				duration: config.duration,
				ease: "power3.out",
			},
		);

		return () => {
			animation.kill();
		};
	}, [active, preset, reducedMotion, ref]);
}
