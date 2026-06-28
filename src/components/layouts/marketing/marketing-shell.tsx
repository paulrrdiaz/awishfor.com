"use client";

import { useRef } from "react";
import { useMarketingAnimations } from "@/lib/gsap/use-marketing-animations";

/**
 * Client animation root for the marketing landing. Holds the single
 * `gsap.context()` scope; section components render as (server) children and are
 * animated by data-attribute, so the JS island surface stays at one component.
 */
export function MarketingShell({ children }: { children: React.ReactNode }) {
	const rootRef = useRef<HTMLDivElement>(null);
	useMarketingAnimations(rootRef);

	return <div ref={rootRef}>{children}</div>;
}
