"use client";

import { Progress as ProgressPrimitive } from "@base-ui/react/progress";
import { cn } from "@/lib/utils";

function Progress({
	className,
	indicatorClassName,
	value = 0,
	max = 100,
	...props
}: ProgressPrimitive.Root.Props & {
	indicatorClassName?: string;
}) {
	const numericValue = value ?? 0;
	const percentage =
		max > 0 ? Math.min(100, Math.max(0, (numericValue / max) * 100)) : 0;

	return (
		<ProgressPrimitive.Root
			className={cn("w-full", className)}
			data-slot="progress"
			max={max}
			value={numericValue}
			{...props}
		>
			<ProgressPrimitive.Track
				className="h-2 w-full overflow-hidden rounded-full bg-muted"
				data-slot="progress-track"
			>
				<ProgressPrimitive.Indicator
					className={cn(
						"h-full rounded-full bg-primary transition-[width]",
						indicatorClassName,
					)}
					data-slot="progress-indicator"
					style={{ width: `${percentage}%` }}
				/>
			</ProgressPrimitive.Track>
		</ProgressPrimitive.Root>
	);
}

export { Progress };
