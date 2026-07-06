"use client";

import * as ProgressPrimitive from "@radix-ui/react-progress";
import type * as React from "react";
import { cn } from "@/lib/utils";

function Progress({
	className,
	indicatorClassName,
	value = 0,
	max = 100,
	...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & {
	indicatorClassName?: string;
}) {
	const numericValue = value ?? 0;
	const percentage =
		max > 0 ? Math.min(100, Math.max(0, (numericValue / max) * 100)) : 0;

	return (
		<ProgressPrimitive.Root
			className={cn(
				"h-2 w-full overflow-hidden rounded-full bg-muted",
				className,
			)}
			data-slot="progress"
			max={max}
			value={numericValue}
			{...props}
		>
			<ProgressPrimitive.Indicator
				className={cn(
					"h-full rounded-full bg-primary transition-[width]",
					indicatorClassName,
				)}
				data-slot="progress-indicator"
				style={{ width: `${percentage}%` }}
			/>
		</ProgressPrimitive.Root>
	);
}

export { Progress };
