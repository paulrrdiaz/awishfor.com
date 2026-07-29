"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { RefObject } from "react";
import { useEffect } from "react";

gsap.registerPlugin(ScrollTrigger);

/**
 * Drives landing animations from one `gsap.context()` scoped to `root`.
 * Content stays visible without JavaScript and under reduced motion; the
 * structural H2b header state remains functional in both cases.
 *
 * Animations attach by data-attribute so section markup can remain server-rendered:
 *   data-h2b-scroll-progress  page-scroll fraction inside the H2b nav
 *   data-nav-link             H2b section scrollspy links
 *   data-hero-rotator         four-layer hero crossfade and synchronized proof rail
 *   data-reveal               scroll-triggered fade-up
 *   data-float / -rev / -3   ambient later-section blobs and emoji (`md`+ only)
 *   data-marquee              duplicated partner-logo strip
 *   data-glow                 primary CTA glow
 */
export function useMarketingAnimations(root: RefObject<HTMLElement | null>) {
	useEffect(() => {
		const el = root.current;
		if (!el) return;
		const prefersReducedMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		const isDesktopViewport = window.matchMedia("(min-width: 768px)").matches;
		let cleanupRotation = () => {};

		const ctx = gsap.context((self) => {
			const q = self.selector;
			if (!q) return;
			const visible = (selector: string) =>
				(q(selector) as HTMLElement[]).filter((node) => node.offsetParent);

			// Structural header state stays available when motion is reduced.
			const hero = q("[data-h2b-hero]")[0] as HTMLElement | undefined;
			const h2bNav = q("[data-h2b-nav]")[0] as HTMLElement | undefined;
			if (hero && h2bNav && window.matchMedia("(min-width: 1024px)").matches) {
				ScrollTrigger.create({
					start: 80,
					onEnter: () => {
						h2bNav.dataset.scrolled = "true";
					},
					onLeaveBack: () => {
						h2bNav.dataset.scrolled = "false";
					},
				});

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
					.filter(
						(section): section is { id: string; target: HTMLElement } =>
							section !== null,
					);
				if (progressFill || sections.length) {
					ScrollTrigger.create({
						trigger: document.body,
						start: "top top",
						end: "max",
						onUpdate: (trigger) => {
							if (progressFill)
								progressFill.style.width = `${trigger.progress * 100}%`;
							let activeId: string | undefined;
							for (const { id, target } of sections) {
								if (target.getBoundingClientRect().top <= 140) activeId = id;
							}
							for (const link of navLinks)
								link.dataset.active = String(link.dataset.navLink === activeId);
						},
					});
				}
			}

			if (prefersReducedMotion) return;

			const rotator = q("[data-hero-rotator]")[0] as HTMLElement | undefined;
			const imageLayers = q("[data-hero-image]") as HTMLElement[];
			const railVariants = q("[data-hero-rail]") as HTMLElement[];
			if (rotator && imageLayers.length === 4 && railVariants.length === 4) {
				const timeline = gsap.timeline({ paused: true, repeat: -1 });
				const hold = 5.5;
				const crossfade = 1.6;
				const slideDuration = hold + crossfade;
				let inViewport = true;

				gsap.set(imageLayers.slice(1), { opacity: 0 });
				gsap.set(railVariants.slice(1), { opacity: 0 });
				for (let index = 0; index < imageLayers.length; index += 1) {
					const nextIndex = (index + 1) % imageLayers.length;
					const imageLayer = imageLayers[index];
					const nextImageLayer = imageLayers[nextIndex];
					const railVariant = railVariants[index];
					const nextRailVariant = railVariants[nextIndex];
					if (
						!imageLayer ||
						!nextImageLayer ||
						!railVariant ||
						!nextRailVariant
					)
						continue;
					const start = index * slideDuration;
					const fromScale = index % 2 === 0 ? 1 : 1.06;
					const toScale = index % 2 === 0 ? 1.06 : 1;
					const fromDrift = index % 2 === 0 ? -1.5 : 1.5;
					const toDrift = -fromDrift;
					timeline.fromTo(
						imageLayer,
						{ scale: fromScale, xPercent: fromDrift, yPercent: -fromDrift / 2 },
						{
							scale: toScale,
							xPercent: toDrift,
							yPercent: fromDrift / 2,
							duration: slideDuration,
							ease: "none",
						},
						start,
					);
					timeline.to(
						imageLayer,
						{ opacity: 0, duration: crossfade, ease: "power2.inOut" },
						start + hold,
					);
					timeline.to(
						nextImageLayer,
						{ opacity: 1, duration: crossfade, ease: "power2.inOut" },
						start + hold,
					);
					timeline.to(
						railVariant,
						{ opacity: 0, duration: crossfade, ease: "power2.inOut" },
						start + hold,
					);
					timeline.to(
						nextRailVariant,
						{ opacity: 1, duration: crossfade, ease: "power2.inOut" },
						start + hold,
					);
					timeline.call(
						() =>
							window.dispatchEvent(
								new CustomEvent("hero-occasion-change", {
									detail: { index: nextIndex },
								}),
							),
						[],
						start + hold,
					);
				}

				const syncPausedState = () =>
					timeline.paused(document.hidden || !inViewport);
				const onVisibilityChange = () => syncPausedState();
				document.addEventListener("visibilitychange", onVisibilityChange);
				ScrollTrigger.create({
					trigger: rotator,
					start: "top bottom",
					end: "bottom top",
					onEnter: () => {
						inViewport = true;
						syncPausedState();
					},
					onEnterBack: () => {
						inViewport = true;
						syncPausedState();
					},
					onLeave: () => {
						inViewport = false;
						syncPausedState();
					},
					onLeaveBack: () => {
						inViewport = false;
						syncPausedState();
					},
				});
				const startRotation = () => syncPausedState();
				if (document.readyState === "complete") startRotation();
				else window.addEventListener("load", startRotation, { once: true });
				cleanupRotation = () => {
					document.removeEventListener("visibilitychange", onVisibilityChange);
					window.removeEventListener("load", startRotation);
					timeline.kill();
				};
			}

			for (const node of visible("[data-reveal]")) {
				gsap.from(node, {
					opacity: 0,
					y: 22,
					duration: 0.9,
					ease: "power3.out",
					scrollTrigger: { trigger: node, start: "top 88%", once: true },
				});
			}
			for (const group of q("[data-reveal-stagger]") as HTMLElement[]) {
				gsap.from(Array.from(group.children), {
					opacity: 0,
					y: 22,
					duration: 0.8,
					ease: "power3.out",
					stagger: 0.1,
					scrollTrigger: { trigger: group, start: "top 85%", once: true },
				});
			}
			if (isDesktopViewport) {
				for (const [selector, y, duration] of [
					["[data-float]", -16, 6],
					["[data-float-rev]", 16, 8],
					["[data-float-3]", -12, 9],
				] as const) {
					for (const node of visible(selector))
						gsap.to(node, {
							y,
							duration,
							ease: "sine.inOut",
							yoyo: true,
							repeat: -1,
						});
				}
			}
			for (const node of visible("[data-marquee]"))
				gsap.to(node, {
					xPercent: -50,
					duration: 22,
					ease: "none",
					repeat: -1,
				});
			for (const node of visible("[data-glow]"))
				gsap.to(node, {
					boxShadow:
						"0 8px 38px rgba(140,200,60,.72), 0 0 0 6px rgba(188,226,90,.18)",
					duration: 1.4,
					ease: "sine.inOut",
					yoyo: true,
					repeat: -1,
				});
		}, el);

		return () => {
			cleanupRotation();
			ctx.revert();
		};
	}, [root]);
}
