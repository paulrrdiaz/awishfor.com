"use client";

import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function getInitialValue() {
	if (
		typeof window === "undefined" ||
		typeof window.matchMedia !== "function"
	) {
		return false;
	}

	return window.matchMedia(QUERY).matches;
}

export function useReducedMotion() {
	const [reducedMotion, setReducedMotion] = useState(getInitialValue);

	useEffect(() => {
		if (
			typeof window === "undefined" ||
			typeof window.matchMedia !== "function"
		) {
			return;
		}

		const mediaQuery = window.matchMedia(QUERY);
		const update = () => setReducedMotion(mediaQuery.matches);

		update();
		mediaQuery.addEventListener("change", update);
		return () => mediaQuery.removeEventListener("change", update);
	}, []);

	return reducedMotion;
}
