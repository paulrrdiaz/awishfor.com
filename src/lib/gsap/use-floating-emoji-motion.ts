"use client";

import gsap from "gsap";
import type { RefObject } from "react";
import { useEffect } from "react";
import { useReducedMotion } from "@/lib/gsap/use-reduced-motion";

export type FloatingEmojiVariant = "bounce" | "zoom" | "sway";

export function useFloatingEmojiMotion(
	containerRef: RefObject<HTMLElement | null>,
	active = true,
) {
	const reducedMotion = useReducedMotion();

	useEffect(() => {
		const container = containerRef.current;
		if (!container || !active) {
			return;
		}

		const elements =
			container.querySelectorAll<HTMLElement>("[data-float-emoji]");

		if (reducedMotion) {
			gsap.set(elements, { clearProps: "all" });
			return;
		}

		const ctx = gsap.context(() => {
			elements.forEach((element, index) => {
				const variant = element.dataset.floatEmoji as
					| FloatingEmojiVariant
					| undefined;
				const delay = index * 0.15;
				const cycle = 1.4 + (index % 3) * 0.25;

				if (variant === "zoom") {
					gsap.to(element, {
						delay,
						duration: cycle,
						ease: "sine.inOut",
						repeat: -1,
						scale: 1.22,
						yoyo: true,
					});
				} else if (variant === "sway") {
					gsap.to(element, {
						delay,
						duration: cycle + 0.6,
						ease: "sine.inOut",
						repeat: -1,
						rotation: 14,
						x: "+=8",
						yoyo: true,
					});
				} else {
					gsap.to(element, {
						delay,
						duration: cycle,
						ease: "sine.inOut",
						repeat: -1,
						y: -16,
						yoyo: true,
					});
				}
			});
		}, container);

		return () => {
			ctx.revert();
		};
	}, [active, containerRef, reducedMotion]);
}
