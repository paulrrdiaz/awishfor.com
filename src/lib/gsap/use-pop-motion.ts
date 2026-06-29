"use client";

import gsap from "gsap";
import type { RefObject } from "react";
import { useEffect } from "react";
import { useReducedMotion } from "@/lib/gsap/use-reduced-motion";

export function usePopMotion(
	ref: RefObject<HTMLElement | null>,
	active = true,
) {
	const reducedMotion = useReducedMotion();

	useEffect(() => {
		const element = ref.current;
		if (!element || !active) {
			return;
		}

		if (reducedMotion) {
			gsap.set(element, { clearProps: "all", opacity: 1, scale: 1 });
			return;
		}

		const animation = gsap.fromTo(
			element,
			{ opacity: 0.7, scale: 0.92 },
			{ opacity: 1, scale: 1, duration: 0.24, ease: "back.out(1.8)" },
		);

		return () => {
			animation.kill();
		};
	}, [active, reducedMotion, ref]);
}
