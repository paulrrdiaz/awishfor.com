import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type WizardLayoutProps = {
	stepper: ReactNode;
	children: ReactNode;
	actions: ReactNode;
	className?: string;
	contentClassName?: string;
};

export function WizardLayout({
	stepper,
	children,
	actions,
	className,
	contentClassName,
}: WizardLayoutProps) {
	return (
		<main
			className={cn(
				"flex min-h-screen flex-col bg-background text-foreground",
				className,
			)}
		>
			<div className="sticky top-0 z-30 border-border border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
				<div className="mx-auto w-full max-w-6xl px-4 py-3 sm:px-6 lg:px-8">
					{stepper}
				</div>
			</div>

			<div
				className={cn(
					"mx-auto w-full flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-10",
					contentClassName,
				)}
			>
				{children}
			</div>

			<div className="sticky bottom-0 z-30 border-border border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-[backdrop-filter]:bg-background/80">
				<div className="mx-auto w-full max-w-6xl px-4 py-3 sm:px-6 lg:px-8">
					{actions}
				</div>
			</div>
		</main>
	);
}
