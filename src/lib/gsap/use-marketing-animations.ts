"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { RefObject } from "react";
import { useEffect } from "react";

gsap.registerPlugin(ScrollTrigger);

/**
 * Drives every marketing-landing animation from a single `gsap.context()` scoped
 * to `root`. All motion is gated behind `prefers-reduced-motion`: when the user
 * prefers reduced motion (or JS never runs) content stays at its final,
 * fully-visible state. The structural H2b header state remains functional. The
 * purely decorative loops (mesh drift, floating
 * blobs/emoji) are additionally skipped below the `md` breakpoint, independent of
 * `prefers-reduced-motion`.
 *
 * Animations attach by data-attribute so section markup can stay server-rendered:
 *   data-h2b-scroll-progress  lime fill inside the H2b nav's scroll-progress track;
 *                      width is set directly to overall page scroll fraction, visible
 *                      from the first pixel of scroll regardless of header state
 *   data-nav-link      H2b nav anchors; `data-active` is toggled to "true" on
 *                      whichever one's target section (by matching element id) has
 *                      scrolled past the header
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
		const prefersReducedMotion =
			typeof window !== "undefined" &&
			window.matchMedia("(prefers-reduced-motion: reduce)").matches;

		// Ambient decorative loops (mesh drift, floating blobs/emoji) are skipped
		// below `md` regardless of motion preference — they're purely decorative
		// weight on small viewports, independent of prefers-reduced-motion.
		const isDesktopViewport =
			typeof window !== "undefined" &&
			window.matchMedia("(min-width: 768px)").matches;

		const ctx = gsap.context((self) => {
			const q = self.selector;
			if (!q) return;
			const visible = (selector: string) =>
				(q(selector) as HTMLElement[]).filter((node) => node.offsetParent);

			// This controller changes page structure, rather than decorating it, so
			// it remains available under reduced motion. With no JavaScript the nav
			// simply scrolls away inside the hero, which is the safe fallback.
			const hero = q("[data-h2b-hero]")[0] as HTMLElement | undefined;
			const h2bNav = q("[data-h2b-nav]")[0] as HTMLElement | undefined;
			if (
				hero &&
				h2bNav &&
				typeof window !== "undefined" &&
				window.matchMedia("(min-width: 1024px)").matches
			) {
				// The nav is fixed from its initial render, so ScrollTrigger only changes
				// its visual compact state and never causes a position jump or disappearance.
				// The scrolled state has an opaque blurred fill, so it's safe to switch on
				// almost immediately — the blur itself keeps whatever scrolls underneath
				// (including the overlapping proof rail) from colliding with the nav's text.
				ScrollTrigger.create({
					start: 80,
					onEnter: () => {
						h2bNav.dataset.scrolled = "true";
					},
					onLeaveBack: () => {
						h2bNav.dataset.scrolled = "false";
					},
				});

				// Ghost-bar scroll progress + section scrollspy. Both read layout on
				// every scroll tick rather than tweening, so they stay structural
				// (unaffected by prefers-reduced-motion) like the header-state switch above.
				const progressFill = q("[data-h2b-scroll-progress]")[0] as
					| HTMLElement
					| undefined;
				const navLinks = q("[data-nav-link]") as HTMLElement[];
				const sections = navLinks
					.map((link) => {
						const id = link.dataset.navLink;
						const target = id ? document.getElementById(id) : null;
						return target ? { id, target } : null;
					})
					.filter((s): s is { id: string; target: HTMLElement } => s !== null);

				if (progressFill || sections.length) {
					// Section target counts as "reached" once its top crosses just below
					// the fixed header; the last section reached wins, which is the usual
					// scrollspy behavior for adjacent, non-overlapping sections.
					const activeSectionOffset = 140;

					ScrollTrigger.create({
						trigger: document.body,
						start: "top top",
						end: "max",
						onUpdate: (self) => {
							if (progressFill) {
								progressFill.style.width = `${self.progress * 100}%`;
							}
							if (sections.length) {
								let activeId: string | undefined;
								for (const { id, target } of sections) {
									if (
										target.getBoundingClientRect().top <= activeSectionOffset
									) {
										activeId = id;
									}
								}
								for (const link of navLinks) {
									link.dataset.active = String(
										link.dataset.navLink === activeId,
									);
								}
							}
						},
					});
				}
			}

			if (prefersReducedMotion) return;

			// Scroll reveals
			for (const node of visible("[data-reveal]")) {
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
				for (const node of visible("[data-float]")) {
					gsap.to(node, {
						y: -16,
						duration: 6,
						ease: "sine.inOut",
						yoyo: true,
						repeat: -1,
					});
				}
				for (const node of visible("[data-float-rev]")) {
					gsap.to(node, {
						y: 16,
						duration: 8,
						ease: "sine.inOut",
						yoyo: true,
						repeat: -1,
					});
				}
				for (const node of visible("[data-float-3]")) {
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
			for (const node of visible("[data-bob]")) {
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
			for (const node of visible("[data-shimmer]")) {
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
			for (const node of visible("[data-marquee]")) {
				gsap.to(node, {
					xPercent: -50,
					duration: 22,
					ease: "none",
					repeat: -1,
				});
			}

			// Mesh gradient drift (decorative — skipped below `md`)
			if (isDesktopViewport) {
				for (const node of visible("[data-mesh]")) {
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
			for (const node of visible("[data-pulse]")) {
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
			for (const node of visible("[data-spin]")) {
				gsap.to(node, {
					rotation: 360,
					duration: 26,
					ease: "none",
					repeat: -1,
					transformOrigin: "center",
				});
			}

			// CTA glow pulse
			for (const node of visible("[data-glow]")) {
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
