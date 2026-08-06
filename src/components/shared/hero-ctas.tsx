"use client";

import type { MouseEvent } from "react";
import { HowItWorksDrawer } from "@/components/shared/how-it-works";
import { cn } from "@/lib/utils";

type Props = {
	className?: string;
	primaryClassName?: string;
	secondaryClassName?: string;
	showHowItWorks: boolean;
	variant?: "default" | "on-photo";
};

export function HeroCtas({
	className,
	primaryClassName,
	secondaryClassName,
	showHowItWorks,
	variant = "default",
}: Props) {
	const isOnPhoto = variant === "on-photo";

	const scrollToSection = (event: MouseEvent<HTMLAnchorElement>) => {
		const selector = event.currentTarget.getAttribute("href");
		if (!selector?.startsWith("#")) {
			return;
		}

		const template = event.currentTarget.closest(".public-theme");
		const targetId = selector.slice(1);
		const target =
			Array.from(template?.querySelectorAll<HTMLElement>("[id]") ?? []).find(
				(element) => element.id === targetId,
			) ?? document.getElementById(targetId);

		if (!target) {
			return;
		}

		event.preventDefault();
		target.scrollIntoView({
			behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
				? "auto"
				: "smooth",
			block: "start",
		});
	};

	return (
		<div
			className={cn(
				"inline-flex flex-wrap items-center justify-center gap-2.5",
				className,
			)}
		>
			{/* biome-ignore lint/a11y/useValidAnchor: This is still hash navigation; the handler only adds scoped smooth scrolling. */}
			<a
				className={cn(
					"public-btn px-5 py-2.5 text-sm transition-colors",
					isOnPhoto
						? "bg-white text-gray-900 hover:bg-white/90"
						: "bg-primary text-primary-foreground hover:bg-primary/90",
					primaryClassName,
				)}
				href="#regalos"
				onClick={scrollToSection}
			>
				Ver regalos disponibles
			</a>
			<HowItWorksDrawer
				showHowItWorks={showHowItWorks}
				triggerClassName={cn(
					"public-btn border px-5 py-2.5 text-sm transition-colors",
					isOnPhoto
						? "border-white/40 text-white hover:bg-white/10"
						: "border-current/25 hover:bg-foreground/5",
					secondaryClassName,
				)}
			/>
		</div>
	);
}
