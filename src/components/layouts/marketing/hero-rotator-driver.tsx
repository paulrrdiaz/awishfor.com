"use client";
import { useEffect } from "react";

import { HERO_OCCASIONS } from "./hero-occasions";
import { selectHeroOccasions } from "./select-hero-occasions";

const HOLD_MS = 6500;
const FADE_MS = 500;
const MOTION_MS = HOLD_MS + FADE_MS;

type PhotoMotion = {
	from: { scale: number; xPercent: number; yPercent: number };
	to: { scale: number; xPercent: number; yPercent: number };
};

const photoMotion = (index: number): PhotoMotion =>
	index % 2 === 0
		? {
				from: { scale: 1.04, xPercent: -0.5, yPercent: -0.25 },
				to: { scale: 1.1, xPercent: 0.5, yPercent: 0.25 },
			}
		: {
				from: { scale: 1.1, xPercent: 0.5, yPercent: 0.25 },
				to: { scale: 1.04, xPercent: -0.5, yPercent: -0.25 },
			};

const PHOTO_CLASS =
	"absolute inset-0 h-full w-full object-cover brightness-[1.2] contrast-[.95] saturate-[1.06]";

function removePhotoLayer(photo: HTMLImageElement) {
	const picture = photo.closest("picture");
	if (picture && photo.hasAttribute("data-initial-hero-photo")) {
		picture.remove();
		return;
	}
	photo.remove();
}

/**
 * Starts after load and uses compositor-only native animations to crossfade
 * and pan/zoom each active hero layer.
 */
export function HeroRotatorDriver() {
	useEffect(() => {
		const hero = document.querySelector<HTMLElement>("[data-h2b-hero]");
		const photoLayer = hero?.querySelector<HTMLElement>(
			"[data-hero-photo-layer]",
		);
		const initialPhoto = photoLayer?.querySelector<HTMLImageElement>(
			"[data-initial-hero-photo]",
		);
		if (
			!hero ||
			!photoLayer ||
			!initialPhoto ||
			window.matchMedia("(prefers-reduced-motion: reduce)").matches
		)
			return;

		const occasions = selectHeroOccasions(HERO_OCCASIONS);
		const dynamicPhotos = new Set<HTMLImageElement>();
		let currentPhoto = initialPhoto;
		let activeIndex = 0;
		let visible = false;
		let loaded = document.readyState === "complete";
		let transitioning = false;
		let disposed = false;
		let timeout: ReturnType<typeof setTimeout> | undefined;
		const zoomAnimations = new Map<HTMLImageElement, Animation>();
		let transitionAnimations: Animation[] = [];

		const clearTimer = () => {
			if (timeout) clearTimeout(timeout);
			timeout = undefined;
		};
		const canRun = () =>
			loaded &&
			visible &&
			document.visibilityState === "visible" &&
			!transitioning;

		const startZoom = (photo: HTMLImageElement, index: number) => {
			const motion = photoMotion(index);
			zoomAnimations.get(photo)?.cancel();
			photo.style.transform = "";
			const animation = photo.animate(
				[
					{
						transform: `translate(${motion.from.xPercent}%, ${motion.from.yPercent}%) scale(${motion.from.scale})`,
					},
					{
						transform: `translate(${motion.to.xPercent}%, ${motion.to.yPercent}%) scale(${motion.to.scale})`,
					},
				],
				{ duration: MOTION_MS, easing: "linear", fill: "forwards" },
			);
			zoomAnimations.set(photo, animation);
		};

		let schedule = () => {};
		const advance = () => {
			if (!canRun()) return;
			transitioning = true;
			const nextIndex = (activeIndex + 1) % occasions.length;
			const occasion = occasions[nextIndex];
			if (!occasion) {
				transitioning = false;
				schedule();
				return;
			}

			const incoming = document.createElement("img");
			const source =
				window.innerWidth >= 1024
					? occasion.photo.desktop
					: occasion.photo.mobile;
			incoming.alt = "";
			incoming.ariaHidden = "true";
			incoming.className = PHOTO_CLASS;
			incoming.dataset.heroPhotoIndex = String(nextIndex);
			incoming.dataset.heroOccasionId = occasion.id;
			incoming.decoding = "async";
			incoming.loading = "eager";
			incoming.width = 1600;
			incoming.height = 1072;
			incoming.style.opacity = "0";
			incoming.src = source;
			dynamicPhotos.add(incoming);
			photoLayer.append(incoming);

			let started = false;
			const fail = () => {
				if (started || disposed) return;
				started = true;
				incoming.remove();
				dynamicPhotos.delete(incoming);
				transitioning = false;
				schedule();
			};
			const crossfade = async () => {
				if (started || disposed) return;
				started = true;
				try {
					await incoming.decode?.();
				} catch {
					// A completed local image can still paint when decode rejects.
				}
				if (disposed || !incoming.isConnected) return;

				const outgoing = currentPhoto;
				activeIndex = nextIndex;
				window.dispatchEvent(
					new CustomEvent("hero-occasion-change", {
						detail: { id: occasion.id },
					}),
				);
				startZoom(incoming, activeIndex);
				let finished = false;
				let incomingAnimation: Animation;
				let outgoingAnimation: Animation;
				const finish = () => {
					if (finished || disposed) return;
					finished = true;
					incoming.style.opacity = "1";
					incomingAnimation.cancel();
					outgoingAnimation.cancel();
					zoomAnimations.get(outgoing)?.cancel();
					zoomAnimations.delete(outgoing);
					removePhotoLayer(outgoing);
					dynamicPhotos.delete(outgoing);
					currentPhoto = incoming;
					transitionAnimations = [];
					transitioning = false;
					schedule();
				};
				incomingAnimation = incoming.animate([{ opacity: 0 }, { opacity: 1 }], {
					duration: FADE_MS,
					easing: "ease-in-out",
					fill: "forwards",
				});
				outgoingAnimation = outgoing.animate([{ opacity: 1 }, { opacity: 0 }], {
					duration: FADE_MS,
					easing: "ease-in-out",
					fill: "forwards",
				});
				transitionAnimations = [incomingAnimation, outgoingAnimation];
				incomingAnimation.onfinish = finish;
			};

			incoming.addEventListener("load", () => void crossfade(), {
				once: true,
			});
			incoming.addEventListener("error", fail, { once: true });
			if (incoming.complete) void crossfade();
		};

		schedule = () => {
			clearTimer();
			if (!canRun()) return;
			if (!zoomAnimations.has(currentPhoto))
				startZoom(currentPhoto, activeIndex);
			timeout = setTimeout(advance, HOLD_MS);
		};
		const onLoad = () => {
			loaded = true;
			schedule();
		};
		const onVisibility = () => schedule();
		const observer = new IntersectionObserver(
			([entry]) => {
				visible = Boolean(entry?.isIntersecting);
				schedule();
			},
			{ threshold: 0.15 },
		);
		observer.observe(hero);
		window.addEventListener("load", onLoad, { once: true });
		document.addEventListener("visibilitychange", onVisibility);
		return () => {
			disposed = true;
			clearTimer();
			for (const animation of transitionAnimations) animation.cancel();
			for (const animation of zoomAnimations.values()) animation.cancel();
			zoomAnimations.clear();
			for (const photo of dynamicPhotos) photo.remove();
			observer.disconnect();
			window.removeEventListener("load", onLoad);
			document.removeEventListener("visibilitychange", onVisibility);
		};
	}, []);

	return null;
}
