"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

import {
	captureMarketingEvent,
	getCampaignProperties,
	initializeMinimalAnalytics,
} from "@/lib/analytics";

export function MarketingPageviewTracker() {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const previousNavigation = useRef<string | undefined>(undefined);

	useEffect(() => {
		const navigation = `${pathname}?${searchParams.toString()}`;
		if (previousNavigation.current === navigation) return;
		previousNavigation.current = navigation;
		initializeMinimalAnalytics();
		captureMarketingEvent("$pageview", {
			path: pathname,
			referrer: document.referrer || undefined,
			visitor_intent: "creator",
			...getCampaignProperties(searchParams),
		});
	}, [pathname, searchParams]);

	return null;
}

export function MarketingSectionTracker() {
	const pathname = usePathname();
	const previousPathname = useRef(pathname);
	const seenSections = useRef(new Set<string>());

	useEffect(() => {
		if (previousPathname.current !== pathname) {
			seenSections.current.clear();
			previousPathname.current = pathname;
		}
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (!entry.isIntersecting) continue;
					const section = entry.target.getAttribute("data-analytics-section");
					if (!section || seenSections.current.has(section)) continue;
					seenSections.current.add(section);
					captureMarketingEvent("section_viewed", {
						section,
						visitor_intent: "creator",
					});
					observer.unobserve(entry.target);
				}
			},
			{ threshold: 0.25 },
		);
		for (const section of document.querySelectorAll("[data-analytics-section]"))
			observer.observe(section);
		return () => observer.disconnect();
	}, [pathname]);

	return null;
}
