import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";

type WizardLayoutProps = {
	stepper: ReactNode;
	children: ReactNode;
	actions: ReactNode;
	desktopActions?: ReactNode;
	className?: string;
	contentClassName?: string;
};

type WizardThemeStyle = CSSProperties & Record<`--${string}`, string>;

/**
 * Scoped to the wizard only (not the rest of the dashboard): the design's
 * warm green palette (wzink/wzmut/wzline/wzlime) vs. the dashboard's cooler
 * blue-gray tokens. Cascades to every step plus the header/stepper/footer;
 * PublicThemeProvider's own inline vars inside step preview panels still win
 * locally over this.
 */
const WIZARD_THEME_STYLE: WizardThemeStyle = {
	"--foreground": "#173E29",
	"--muted-foreground": "#6E7C71",
	"--border": "#E3E2D6",
	"--input": "#E3E2D6",
	"--primary": "#BCE25A",
	"--primary-foreground": "#1B3A12",
	"--ring": "#BCE25A",
};

export function WizardLayout({
	stepper,
	children,
	actions,
	desktopActions,
	className,
	contentClassName,
}: WizardLayoutProps) {
	return (
		<main
			className={cn(
				"flex min-h-screen flex-col bg-background text-foreground lg:h-dvh lg:overflow-hidden",
				className,
			)}
			style={WIZARD_THEME_STYLE}
		>
			<section className="flex min-h-screen w-full flex-1 flex-col bg-background lg:min-h-0 lg:overflow-hidden">
				<div className="hidden h-[58px] shrink-0 items-center gap-[7px] border-border border-b bg-card px-9 lg:flex">
					<Image
						alt="A Wish For"
						className="h-[26px] w-auto"
						height={26}
						priority
						src="/assets/isotype.svg"
						width={26}
					/>
					<div className="ml-auto">{desktopActions}</div>
				</div>

				<div className="sticky top-0 z-30 bg-card lg:static lg:shrink-0">
					{stepper}
				</div>

				<div
					className={cn(
						"mx-auto w-full flex-1 px-4 py-6 sm:px-6 lg:mx-0 lg:min-h-0 lg:overflow-hidden lg:p-0",
						contentClassName,
					)}
				>
					{children}
				</div>

				<div className="sticky bottom-0 z-30 border-border border-t bg-card pb-[env(safe-area-inset-bottom)] lg:static lg:shrink-0 lg:pb-0">
					{actions}
				</div>
			</section>
		</main>
	);
}
