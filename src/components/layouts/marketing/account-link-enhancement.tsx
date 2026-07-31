"use client";

import { useEffect } from "react";

const IDLE_ENHANCEMENT_FALLBACK_MS = 30_000;

/** Enhances the anonymous-safe account link without importing Clerk UI. */
export function AccountLinkEnhancement() {
	useEffect(() => {
		let cancelled = false;
		let enhanced = false;
		let loaded = document.readyState === "complete";
		let activated = false;
		let idleHandle: number | undefined;
		let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
		const update = async () => {
			try {
				const response = await fetch("/api/marketing/session", {
					cache: "no-store",
				});
				const { authenticated } = (await response.json()) as {
					authenticated?: boolean;
				};
				if (cancelled || !authenticated) return;
				for (const link of document.querySelectorAll<HTMLAnchorElement>(
					"[data-marketing-account-link]",
				)) {
					link.href = "/dashboard";
					link.textContent = "Dashboard";
				}
			} catch {
				// The auth-route redirect remains the functional no-enhancement fallback.
			}
		};
		const enhance = () => {
			if (cancelled || enhanced || !loaded) return;
			enhanced = true;
			void update();
		};
		const schedule = () => {
			loaded = true;
			if (activated) {
				enhance();
				return;
			}
			timeoutHandle = setTimeout(() => {
				if ("requestIdleCallback" in window) {
					idleHandle = window.requestIdleCallback(enhance, { timeout: 1500 });
				} else enhance();
			}, IDLE_ENHANCEMENT_FALLBACK_MS);
		};
		const activate = () => {
			activated = true;
			enhance();
		};
		if (document.readyState === "complete") schedule();
		else window.addEventListener("load", schedule, { once: true });
		for (const event of [
			"pointerdown",
			"touchstart",
			"keydown",
			"scroll",
		] as const)
			window.addEventListener(event, activate, {
				once: true,
				passive: event !== "keydown",
			});
		return () => {
			cancelled = true;
			window.removeEventListener("load", schedule);
			for (const event of [
				"pointerdown",
				"touchstart",
				"keydown",
				"scroll",
			] as const)
				window.removeEventListener(event, activate);
			if (idleHandle !== undefined) window.cancelIdleCallback(idleHandle);
			if (timeoutHandle !== undefined) clearTimeout(timeoutHandle);
		};
	}, []);

	return null;
}
