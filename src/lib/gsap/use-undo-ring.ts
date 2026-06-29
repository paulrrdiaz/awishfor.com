"use client";

import gsap from "gsap";
import type { RefObject } from "react";
import { useEffect, useMemo } from "react";
import { useReducedMotion } from "@/lib/gsap/use-reduced-motion";

export function useUndoRing(
	circleRef: RefObject<SVGCircleElement | null>,
	secondsLeft: number,
	totalSeconds: number,
	active = true,
) {
	const reducedMotion = useReducedMotion();
	const progress = useMemo(
		() => (totalSeconds > 0 ? secondsLeft / totalSeconds : 0),
		[secondsLeft, totalSeconds],
	);

	useEffect(() => {
		const circle = circleRef.current;
		if (!circle || !active) {
			return;
		}

		const radius = Number(circle.getAttribute("r") ?? "0");
		const circumference = 2 * Math.PI * radius;
		circle.style.strokeDasharray = `${circumference}`;

		const strokeDashoffset = circumference * (1 - progress);

		if (reducedMotion) {
			gsap.set(circle, { strokeDashoffset });
			return;
		}

		const animation = gsap.to(circle, {
			strokeDashoffset,
			duration: 0.85,
			ease: "none",
		});

		return () => {
			animation.kill();
		};
	}, [active, circleRef, progress, reducedMotion]);
}
