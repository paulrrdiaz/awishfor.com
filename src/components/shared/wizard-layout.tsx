import Image from "next/image";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type WizardLayoutProps = {
	stepper: ReactNode;
	children: ReactNode;
	actions: ReactNode;
	desktopActions?: ReactNode;
	className?: string;
	contentClassName?: string;
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
		>
			<section className="flex min-h-screen w-full flex-1 flex-col bg-background lg:min-h-0 lg:overflow-hidden lg:bg-card">
				<div className="hidden h-[58px] shrink-0 items-center gap-[7px] border-border border-b bg-card px-9 lg:flex">
					<Image
						alt=""
						aria-hidden
						className="h-[26px] w-auto"
						height={26}
						priority
						src="/assets/isotype.svg"
						width={26}
					/>
					<span className="font-bold font-serif text-foreground text-lg">
						A Wish For
					</span>
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
