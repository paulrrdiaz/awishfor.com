import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { BrandPanel } from "./brand-panel";

export function AuthHeading({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<h1
			className={cn(
				"font-serif text-3xl text-foreground tracking-tight",
				className,
			)}
		>
			{children}
		</h1>
	);
}

interface AuthShellProps {
	children: ReactNode;
	brandVariant?: "wishlist" | "benefits";
}

export function AuthShell({ children, brandVariant }: AuthShellProps) {
	return (
		<div className="flex min-h-svh flex-col bg-card lg:flex-row">
			<div className="flex flex-1 items-center justify-center p-6 sm:p-10">
				<div className="w-full max-w-sm">{children}</div>
			</div>

			<div className="hidden lg:flex lg:w-[57%] lg:shrink-0">
				<BrandPanel variant={brandVariant} />
			</div>
		</div>
	);
}
