"use client";

import gsap from "gsap";
import type { RefObject } from "react";
import { useEffect } from "react";

/**
 * Drives the escaped-gift illustration's loop from a single `gsap.context()`
 * scoped to `root`, following the same data-attribute dispatch pattern as
 * `useMarketingAnimations`. Gated behind `prefers-reduced-motion`: when the
 * user prefers reduced motion (or JS never runs) nothing animates and the
 * composition stays at its resting, fully-visible state.
 *
 * Animations attach by data-attribute so the illustration markup can stay
 * server-rendered:
 *   data-gb-float              gift box drift + tilt (y 0↔-16, rotation -3↔3deg, 6s)
 *   data-gb-string             string sway, pivoting from its top (rotation -8↔8deg, 5s)
 *   data-conf / -conf-duration / -conf-delay   confetti fall + spin, per-node
 *                              duration/delay read from data-*, looping from
 *                              each element's rendered (visible) resting position
 *   data-spark / -spark-delay  sparkle twinkle (opacity + scale), per-node delay
 *                              read from data-*, starting from full opacity
 */
export function useEscapedGiftMotion(root: RefObject<HTMLElement | null>) {
	useEffect(() => {
		const el = root.current;
		if (!el) return;
		if (
			typeof window !== "undefined" &&
			window.matchMedia("(prefers-reduced-motion: reduce)").matches
		) {
			return;
		}

		const ctx = gsap.context((self) => {
			const q = self.selector;
			if (!q) return;

			for (const node of q("[data-gb-float]") as HTMLElement[]) {
				gsap.fromTo(
					node,
					{ y: 0, rotation: -3 },
					{
						y: -16,
						rotation: 3,
						duration: 6,
						ease: "sine.inOut",
						yoyo: true,
						repeat: -1,
					},
				);
			}

			for (const node of q("[data-gb-string]") as HTMLElement[]) {
				gsap.fromTo(
					node,
					{ rotation: -8 },
					{
						rotation: 8,
						duration: 5,
						ease: "sine.inOut",
						yoyo: true,
						repeat: -1,
						transformOrigin: "top center",
					},
				);
			}

			for (const node of q("[data-conf]") as HTMLElement[]) {
				const duration = Number(node.dataset.confDuration) || 7;
				const delay = Number(node.dataset.confDelay) || 0;
				gsap.to(node, {
					y: "+=340",
					rotation: "+=420",
					duration,
					delay,
					ease: "none",
					repeat: -1,
				});
			}

			for (const node of q("[data-spark]") as HTMLElement[]) {
				const delay = Number(node.dataset.sparkDelay) || 0;
				gsap.fromTo(
					node,
					{ opacity: 1, scale: 1 },
					{
						opacity: 0.35,
						scale: 0.7,
						duration: 3,
						delay,
						ease: "sine.inOut",
						yoyo: true,
						repeat: -1,
					},
				);
			}
		}, el);

		return () => ctx.revert();
	}, [root]);
}
