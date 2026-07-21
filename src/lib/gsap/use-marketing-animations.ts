"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { RefObject } from "react";
import { useEffect } from "react";

gsap.registerPlugin(ScrollTrigger);

/**
 * Drives every marketing-landing animation from a single `gsap.context()` scoped
 * to `root`. All motion is gated behind `prefers-reduced-motion`: when the user
 * prefers reduced motion (or JS never runs) nothing animates and content stays at
 * its final, fully-visible state. The purely decorative loops (mesh drift, floating
 * blobs/emoji) are additionally skipped below the `md` breakpoint, independent of
 * `prefers-reduced-motion`.
 *
 * Animations attach by data-attribute so section markup can stay server-rendered:
 *   data-reveal        scroll-triggered fade-up (the `data-reveal-stagger` ancestor
 *                      staggers its direct [data-reveal] children)
 *   data-float / -rev / -3   ambient floating blobs & emoji (desktop-only, `md`+)
 *   data-bob           hero teaser card bob + slight tilt
 *   data-shimmer       headline gradient sweep
 *   data-marquee       partner-logo strip (track must be duplicated 2x)
 *   data-mesh          animated hero mesh gradient (desktop-only, `md`+)
 *   data-pulse         pulsing badge dot
 *   data-spin          slow-spinning accent chip
 *   data-glow          primary CTA glow pulse
 */
export function useMarketingAnimations(root: RefObject<HTMLElement | null>) {
	useEffect(() => {
		const el = root.current;
		if (!el) return;
		if (
			typeof window !== "undefined" &&
			window.matchMedia("(prefers-reduced-motion: reduce)").matches
		) {
			return;
		}

		// Ambient decorative loops (mesh drift, floating blobs/emoji) are skipped
		// below `md` regardless of motion preference — they're purely decorative
		// weight on small viewports, independent of prefers-reduced-motion.
		const isDesktopViewport =
			typeof window !== "undefined" &&
			window.matchMedia("(min-width: 768px)").matches;

		const ctx = gsap.context((self) => {
			const q = self.selector;
			if (!q) return;

			// Scroll reveals
			for (const node of q("[data-reveal]") as HTMLElement[]) {
				gsap.from(node, {
					opacity: 0,
					y: 22,
					duration: 0.9,
					ease: "power3.out",
					scrollTrigger: {
						trigger: node,
						start: "top 88%",
						once: true,
					},
				});
			}

			// Staggered groups (children animate together with a stagger)
			for (const group of q("[data-reveal-stagger]") as HTMLElement[]) {
				const children = Array.from(group.children) as HTMLElement[];
				gsap.from(children, {
					opacity: 0,
					y: 22,
					duration: 0.8,
					ease: "power3.out",
					stagger: 0.1,
					scrollTrigger: { trigger: group, start: "top 85%", once: true },
				});
			}

			// Ambient floats (decorative — skipped below `md`)
			if (isDesktopViewport) {
				for (const node of q("[data-float]") as HTMLElement[]) {
					gsap.to(node, {
						y: -16,
						duration: 6,
						ease: "sine.inOut",
						yoyo: true,
						repeat: -1,
					});
				}
				for (const node of q("[data-float-rev]") as HTMLElement[]) {
					gsap.to(node, {
						y: 16,
						duration: 8,
						ease: "sine.inOut",
						yoyo: true,
						repeat: -1,
					});
				}
				for (const node of q("[data-float-3]") as HTMLElement[]) {
					gsap.to(node, {
						y: -12,
						duration: 9,
						ease: "sine.inOut",
						yoyo: true,
						repeat: -1,
					});
				}
			}

			// Hero teaser bob (keeps the design's slight tilt)
			for (const node of q("[data-bob]") as HTMLElement[]) {
				gsap.fromTo(
					node,
					{ rotation: 1.2, y: 0 },
					{
						rotation: 1.2,
						y: -12,
						duration: 7,
						ease: "sine.inOut",
						yoyo: true,
						repeat: -1,
					},
				);
			}

			// Headline shimmer sweep
			for (const node of q("[data-shimmer]") as HTMLElement[]) {
				gsap.fromTo(
					node,
					{ backgroundPosition: "120% 0" },
					{
						backgroundPosition: "-120% 0",
						duration: 6,
						ease: "none",
						repeat: -1,
					},
				);
			}

			// Partner marquee (track is rendered twice → translate -50%)
			for (const node of q("[data-marquee]") as HTMLElement[]) {
				gsap.to(node, {
					xPercent: -50,
					duration: 22,
					ease: "none",
					repeat: -1,
				});
			}

			// Mesh gradient drift (decorative — skipped below `md`)
			if (isDesktopViewport) {
				for (const node of q("[data-mesh]") as HTMLElement[]) {
					gsap.to(node, {
						backgroundPosition: "100% 100%",
						duration: 14,
						ease: "sine.inOut",
						yoyo: true,
						repeat: -1,
					});
				}
			}

			// Pulsing badge dot
			for (const node of q("[data-pulse]") as HTMLElement[]) {
				gsap.to(node, {
					scale: 1.5,
					opacity: 0.5,
					duration: 1.1,
					ease: "sine.inOut",
					yoyo: true,
					repeat: -1,
					transformOrigin: "center",
				});
			}

			// Slow spin accent
			for (const node of q("[data-spin]") as HTMLElement[]) {
				gsap.to(node, {
					rotation: 360,
					duration: 26,
					ease: "none",
					repeat: -1,
					transformOrigin: "center",
				});
			}

			// CTA glow pulse
			for (const node of q("[data-glow]") as HTMLElement[]) {
				gsap.to(node, {
					boxShadow:
						"0 8px 38px rgba(140,200,60,.72), 0 0 0 6px rgba(188,226,90,.18)",
					duration: 1.4,
					ease: "sine.inOut",
					yoyo: true,
					repeat: -1,
				});
			}
		}, el);

		return () => ctx.revert();
	}, [root]);
}
