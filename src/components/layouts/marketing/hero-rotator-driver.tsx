"use client";

import gsap from "gsap";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { HERO_OCCASIONS } from "./hero-occasions";

const HOLD_MS = 6500;
const FADE_MS = 500;
const MOTION_SECONDS = (HOLD_MS + FADE_MS) / 1000;

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

const photoElement = (index: number) =>
	document.querySelector<HTMLElement>(`[data-hero-photo-index="${index}"]`);

/**
 * Defers future photographs until activity, then uses one GSAP timeline to
 * crossfade and pan/zoom each active hero layer without transform resets.
 */
export function HeroRotatorDriver() {
	const [active, setActive] = useState(0);
	const [previous, setPrevious] = useState<number | null>(null);
	const [transitioning, setTransitioning] = useState(false);
	const activeRef = useRef(0);
	const previousRef = useRef<number | null>(null);
	const transitionTargetRef = useRef<number | null>(null);
	const visibleRef = useRef(false);
	const loadedRef = useRef(false);
	const activityRef = useRef(false);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const scheduleRef = useRef<() => void>(() => {});
	const startTransitionRef = useRef<(next: number) => void>(() => {});
	const transitionRef = useRef<gsap.core.Timeline | null>(null);
	const zoomTweenRef = useRef<gsap.core.Tween | null>(null);
	const zoomedIndexRef = useRef<number | null>(null);

	const clearTimer = useCallback(() => {
		if (timeoutRef.current) clearTimeout(timeoutRef.current);
		timeoutRef.current = null;
	}, []);

	const emitOccasion = (index: number) => {
		window.dispatchEvent(
			new CustomEvent("hero-occasion-change", { detail: { index } }),
		);
	};

	const startZoom = useCallback((index: number) => {
		const image = photoElement(index);
		if (!image || zoomedIndexRef.current === index) return;
		const motion = photoMotion(index);
		zoomTweenRef.current?.kill();
		zoomedIndexRef.current = index;
		gsap.set(image, { clearProps: "transform" });
		gsap.set(image, motion.from);
		zoomTweenRef.current = gsap.to(image, {
			...motion.to,
			duration: MOTION_SECONDS,
			ease: "none",
		});
	}, []);

	const finishTransition = () => {
		previousRef.current = null;
		transitionTargetRef.current = null;
		transitionRef.current = null;
		setPrevious(null);
		setTransitioning(false);
		scheduleRef.current();
	};

	const startTransition = (next: number) => {
		if (transitionTargetRef.current !== next || transitionRef.current) return;
		const incoming = photoElement(next);
		if (!incoming) return;
		const outgoingIndex = previousRef.current;
		const outgoing =
			outgoingIndex === null ? null : photoElement(outgoingIndex);

		zoomedIndexRef.current = null;
		const motion = photoMotion(next);
		gsap.set(incoming, { ...motion.from, opacity: 0 });
		startZoom(next);
		emitOccasion(next);

		transitionRef.current = gsap
			.timeline({ onComplete: finishTransition })
			.to(
				incoming,
				{ duration: FADE_MS / 1000, ease: "power2.inOut", opacity: 1 },
				0,
			);
		if (outgoing)
			transitionRef.current.to(
				outgoing,
				{ duration: FADE_MS / 1000, ease: "power2.inOut", opacity: 0 },
				0,
			);
	};
	startTransitionRef.current = startTransition;

	const advance = useCallback(() => {
		if (!visibleRef.current || document.visibilityState !== "visible") return;
		const next = (activeRef.current + 1) % HERO_OCCASIONS.length;
		const current = activeRef.current;
		previousRef.current = current;
		transitionTargetRef.current = next;
		activeRef.current = next;
		setPrevious(current);
		setActive(next);
		setTransitioning(true);
	}, []);

	useEffect(() => {
		const hero = document.querySelector<HTMLElement>("[data-h2b-hero]");
		if (!hero || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
			return;
		loadedRef.current = document.readyState === "complete";

		const canRun = () =>
			loadedRef.current &&
			activityRef.current &&
			visibleRef.current &&
			document.visibilityState === "visible";
		const schedule = () => {
			clearTimer();
			if (!canRun() || transitionTargetRef.current !== null) return;
			startZoom(activeRef.current);
			timeoutRef.current = setTimeout(advance, HOLD_MS);
		};
		scheduleRef.current = schedule;
		const activate = () => {
			activityRef.current = true;
			schedule();
		};
		const onLoad = () => {
			loadedRef.current = true;
			schedule();
		};
		const onVisibility = () => schedule();
		const observer = new IntersectionObserver(
			([entry]) => {
				visibleRef.current = Boolean(entry?.isIntersecting);
				schedule();
			},
			{ threshold: 0.15 },
		);
		observer.observe(hero);
		window.addEventListener("load", onLoad, { once: true });
		for (const event of [
			"pointermove",
			"pointerdown",
			"touchstart",
			"keydown",
			"scroll",
		] as const) {
			window.addEventListener(event, activate, {
				once: true,
				passive: event !== "keydown",
			});
		}
		document.addEventListener("visibilitychange", onVisibility);
		return () => {
			clearTimer();
			scheduleRef.current = () => {};
			transitionRef.current?.kill();
			zoomTweenRef.current?.kill();
			observer.disconnect();
			window.removeEventListener("load", onLoad);
			for (const event of [
				"pointermove",
				"pointerdown",
				"touchstart",
				"keydown",
				"scroll",
			] as const)
				window.removeEventListener(event, activate);
			document.removeEventListener("visibilitychange", onVisibility);
		};
	}, [advance, clearTimer, startZoom]);

	useEffect(() => {
		if (active !== 0 || !transitioning) return;
		const frame = requestAnimationFrame(() => {
			startTransitionRef.current(0);
		});
		return () => cancelAnimationFrame(frame);
	}, [active, transitioning]);

	const activeOccasion = HERO_OCCASIONS[active] ?? HERO_OCCASIONS[0];
	const previousOccasion =
		previous === null ? null : (HERO_OCCASIONS[previous] ?? HERO_OCCASIONS[0]);

	return (
		<>
			{previousOccasion && previous !== null && previous > 0 && (
				<Image
					alt=""
					aria-hidden
					className="absolute inset-0 h-full w-full object-cover brightness-[1.2] contrast-[.95] saturate-[1.06]"
					data-hero-photo-index={previous}
					fill
					key={`hero-${previousOccasion.id}`}
					loading="eager"
					sizes="100vw"
					src={previousOccasion.photo.desktop}
				/>
			)}
			{active > 0 && (
				<Image
					alt=""
					aria-hidden
					className="absolute inset-0 h-full w-full object-cover brightness-[1.2] contrast-[.95] saturate-[1.06]"
					data-hero-photo-index={active}
					fill
					key={`hero-${activeOccasion.id}`}
					loading="eager"
					onLoad={() => startTransition(active)}
					sizes="100vw"
					src={activeOccasion.photo.desktop}
					style={{ opacity: transitioning ? 0 : 1 }}
				/>
			)}
		</>
	);
}
