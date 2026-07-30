"use client";

import { useEffect } from "react";

/** Enhances the anonymous-safe account link without importing Clerk UI. */
export function AccountLinkEnhancement() {
	useEffect(() => {
		let cancelled = false;
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
		const schedule = () => {
			if ("requestIdleCallback" in window) {
				window.requestIdleCallback(update, { timeout: 2500 });
			} else setTimeout(update, 800);
		};
		window.addEventListener("load", schedule, { once: true });
		return () => {
			cancelled = true;
			window.removeEventListener("load", schedule);
		};
	}, []);

	return null;
}
