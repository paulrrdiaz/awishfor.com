"use client";

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

function Checkbox({
	className,
	children,
	...props
}: CheckboxPrimitive.Root.Props) {
	return (
		<CheckboxPrimitive.Root
			className={cn(
				"inline-flex size-4 shrink-0 items-center justify-center rounded border border-input bg-background text-primary outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-checked:border-primary data-checked:bg-primary data-unchecked:hover:border-foreground/30",
				className,
			)}
			data-slot="checkbox"
			{...props}
		>
			<CheckboxPrimitive.Indicator
				className="flex items-center justify-center text-primary-foreground"
				data-slot="checkbox-indicator"
			>
				<CheckIcon className="size-3" />
			</CheckboxPrimitive.Indicator>
			{children}
		</CheckboxPrimitive.Root>
	);
}

export { Checkbox };
