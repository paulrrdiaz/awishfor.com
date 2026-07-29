"use client";

import { useEffect, useRef } from "react";

import { HERO_OCCASIONS, HERO_SCRIM_VALUES } from "./hero-occasions";

/** Keeps server-rendered hero variants synchronized with the GSAP rotation clock. */
export function HeroRotatorDriver() {
	const activeIndex = useRef(0);

	useEffect(() => {
		const hero = document.querySelector<HTMLElement>("[data-h2b-hero]");
		if (!hero) return;

		const setActive = (index: number) => {
			const occasion = HERO_OCCASIONS[index];
			if (!occasion) return;
			activeIndex.current = index;
			hero.dataset.activeIndex = String(index);
			for (const node of document.querySelectorAll<HTMLElement>(
				"[data-hero-image]",
			)) {
				node.dataset.active = String(node.dataset.heroIndex === String(index));
			}
			for (const node of document.querySelectorAll<HTMLElement>(
				"[data-hero-rail]",
			)) {
				const isActive = node.dataset.heroIndex === String(index);
				node.dataset.active = String(isActive);
				node.inert = !isActive;
				node.setAttribute("aria-hidden", String(!isActive));
			}
			for (const [name, value] of Object.entries(
				HERO_SCRIM_VALUES[occasion.scrim],
			)) {
				hero.style.setProperty(name, value as string);
			}
		};

		const onOccasionChange = (event: Event) => {
			const index = (event as CustomEvent<{ index: number }>).detail.index;
			if (index >= 0 && index < HERO_OCCASIONS.length) setActive(index);
		};
		window.addEventListener("hero-occasion-change", onOccasionChange);
		setActive(activeIndex.current);
		return () =>
			window.removeEventListener("hero-occasion-change", onOccasionChange);
	}, []);

	return null;
}
