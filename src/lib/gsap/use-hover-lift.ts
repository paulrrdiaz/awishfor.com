"use client";

import gsap from "gsap";
import type { RefObject } from "react";
import { useEffect } from "react";
import { useReducedMotion } from "@/lib/gsap/use-reduced-motion";

export function useHoverLift(
	ref: RefObject<HTMLElement | null>,
	options?: { y?: number; scale?: number },
) {
	const reducedMotion = useReducedMotion();

	useEffect(() => {
		const element = ref.current;
		if (!element || reducedMotion) {
			return;
		}

		const y = options?.y ?? -6;
		const scale = options?.scale ?? 1.01;

		const onEnter = () => {
			gsap.to(element, {
				y,
				scale,
				duration: 0.2,
				ease: "power2.out",
			});
		};

		const onLeave = () => {
			gsap.to(element, {
				y: 0,
				scale: 1,
				duration: 0.2,
				ease: "power2.out",
			});
		};

		element.addEventListener("mouseenter", onEnter);
		element.addEventListener("mouseleave", onLeave);

		return () => {
			element.removeEventListener("mouseenter", onEnter);
			element.removeEventListener("mouseleave", onLeave);
		};
	}, [options?.scale, options?.y, reducedMotion, ref]);
}
