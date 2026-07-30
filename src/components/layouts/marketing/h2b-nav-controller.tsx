"use client";

import { useEffect } from "react";

/** Small structural scroll-state enhancement; content remains visible without it. */
export function H2bNavController() {
	useEffect(() => {
		const nav = document.querySelector<HTMLElement>("[data-h2b-nav]");
		if (!nav) return;
		const progress = document.querySelector<HTMLElement>(
			"[data-h2b-scroll-progress]",
		);
		let animationFrame: number | undefined;
		const update = () => {
			nav.dataset.scrolled = String(window.scrollY > 80);
			if (!progress) return;
			const maxScroll =
				document.documentElement.scrollHeight - window.innerHeight;
			const fraction = maxScroll > 0 ? window.scrollY / maxScroll : 0;
			progress.style.transform = `scaleX(${Math.min(1, Math.max(0, fraction))})`;
		};
		const requestUpdate = () => {
			if (animationFrame !== undefined) return;
			animationFrame = window.requestAnimationFrame(() => {
				animationFrame = undefined;
				update();
			});
		};
		update();
		window.addEventListener("scroll", requestUpdate, { passive: true });
		window.addEventListener("resize", requestUpdate);
		return () => {
			window.removeEventListener("scroll", requestUpdate);
			window.removeEventListener("resize", requestUpdate);
			if (animationFrame !== undefined)
				window.cancelAnimationFrame(animationFrame);
		};
	}, []);
	return null;
}
