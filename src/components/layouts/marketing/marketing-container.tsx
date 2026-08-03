import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

/** Keeps the main marketing content aligned across sections. */
export function MarketingContainer({
	className,
	...props
}: ComponentPropsWithoutRef<"div">) {
	return (
		<div
			className={cn("mx-auto w-full max-w-[1152px]", className)}
			{...props}
		/>
	);
}
