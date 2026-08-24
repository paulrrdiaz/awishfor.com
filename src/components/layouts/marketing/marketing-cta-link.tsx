"use client";

import type { ComponentProps } from "react";

import { captureMarketingEvent } from "@/lib/analytics";

type Props = Omit<ComponentProps<"a">, "href"> & {
	href: string;
	occasion?: string;
	placement: "desktop_nav" | "final" | "hero" | "mobile_nav" | "occasion";
};

export function MarketingCtaLink({
	href,
	onClick,
	occasion,
	placement,
	...props
}: Props) {
	return (
		<a
			{...props}
			href={href}
			onClick={(event) => {
				onClick?.(event);
				if (event.defaultPrevented) return;
				if (occasion)
					captureMarketingEvent("occasion_selected", {
						occasion,
						visitor_intent: "creator",
					});
				captureMarketingEvent("cta_clicked", {
					placement,
					visitor_intent: "creator",
				});
			}}
		/>
	);
}
