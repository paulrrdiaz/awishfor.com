"use client";

import gsap from "gsap";
import type { RefObject } from "react";
import { useEffect } from "react";
import { useReducedMotion } from "@/lib/gsap/use-reduced-motion";

const COARSE_POINTER_QUERY = "(pointer: coarse)";

/**
 * Single pointer-move listener on a hero container that writes normalized
 * `--tilt-x`/`--tilt-y` (-1..1) custom properties, consumed by descendant
 * motifs' `transform`. One listener regardless of motif count — never one
 * per motif instance. Disabled under `prefers-reduced-motion` and on
 * coarse-pointer (touch) devices; eases back to rest on pointer leave.
 */
export function useMotifTilt(ref: RefObject<HTMLElement | null>) {
	const reducedMotion = useReducedMotion();

	useEffect(() => {
		const element = ref.current;
		if (!element || reducedMotion) {
			return;
		}

		if (
			typeof window !== "undefined" &&
			typeof window.matchMedia === "function" &&
			window.matchMedia(COARSE_POINTER_QUERY).matches
		) {
			return;
		}

		const state = { x: 0, y: 0 };

		const applyState = () => {
			element.style.setProperty("--tilt-x", state.x.toFixed(3));
			element.style.setProperty("--tilt-y", state.y.toFixed(3));
		};

		const onPointerMove = (event: PointerEvent) => {
			const rect = element.getBoundingClientRect();
			if (rect.width === 0 || rect.height === 0) {
				return;
			}
			gsap.killTweensOf(state);
			state.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
			state.y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
			applyState();
		};

		const onPointerLeave = () => {
			gsap.to(state, {
				duration: 0.4,
				ease: "power2.out",
				onUpdate: applyState,
				x: 0,
				y: 0,
			});
		};

		element.addEventListener("pointermove", onPointerMove);
		element.addEventListener("pointerleave", onPointerLeave);

		return () => {
			gsap.killTweensOf(state);
			element.removeEventListener("pointermove", onPointerMove);
			element.removeEventListener("pointerleave", onPointerLeave);
			element.style.removeProperty("--tilt-x");
			element.style.removeProperty("--tilt-y");
		};
	}, [reducedMotion, ref]);
}
