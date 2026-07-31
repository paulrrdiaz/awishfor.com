"use client";

import { useEffect } from "react";

export function OccasionMediaController() {
	useEffect(() => {
		const grid = document.querySelector<HTMLElement>("[data-occasion-grid]");
		if (!grid) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (!entry?.isIntersecting) return;
				for (const image of grid.querySelectorAll<HTMLImageElement>(
					"img[data-deferred-src]",
				)) {
					const source = image.dataset.deferredSrc;
					if (source) image.src = source;
					delete image.dataset.deferredSrc;
				}
				observer.disconnect();
			},
			{ threshold: 0.01 },
		);
		observer.observe(grid);
		return () => observer.disconnect();
	}, []);

	return null;
}
