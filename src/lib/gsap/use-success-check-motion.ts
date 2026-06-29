"use client";

import gsap from "gsap";
import type { RefObject } from "react";
import { useEffect } from "react";
import { useReducedMotion } from "@/lib/gsap/use-reduced-motion";

export function useSuccessCheckMotion(
	pathRef: RefObject<SVGPathElement | null>,
	active = true,
) {
	const reducedMotion = useReducedMotion();

	useEffect(() => {
		const path = pathRef.current;
		if (!path || !active) {
			return;
		}

		const length =
			typeof path.getTotalLength === "function" ? path.getTotalLength() : 24;
		path.style.strokeDasharray = `${length}`;

		if (reducedMotion) {
			gsap.set(path, { strokeDashoffset: 0, opacity: 1 });
			return;
		}

		const animation = gsap.fromTo(
			path,
			{ opacity: 1, strokeDashoffset: length },
			{ strokeDashoffset: 0, duration: 0.6, ease: "power2.out" },
		);

		return () => {
			animation.kill();
		};
	}, [active, pathRef, reducedMotion]);
}
