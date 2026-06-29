"use client";

import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import { cn } from "@/lib/utils";

function Switch({ className, ...props }: SwitchPrimitive.Root.Props) {
	return (
		<SwitchPrimitive.Root
			className={cn(
				"inline-flex h-6 w-11 items-center rounded-full border border-transparent bg-input outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-checked:bg-primary",
				className,
			)}
			data-slot="switch"
			{...props}
		>
			<SwitchPrimitive.Thumb
				className="block size-5 rounded-full bg-background shadow-sm transition-transform data-checked:translate-x-5 data-unchecked:translate-x-0"
				data-slot="switch-thumb"
			/>
		</SwitchPrimitive.Root>
	);
}

export { Switch };
