"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import { XIcon } from "lucide-react";
import type * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function Popover({
	...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
	return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({
	...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
	return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverContent({
	className,
	children,
	align = "center",
	sideOffset = 4,
	showCloseButton = false,
	...props
}: React.ComponentProps<typeof PopoverPrimitive.Content> & {
	showCloseButton?: boolean;
}) {
	return (
		<PopoverPrimitive.Portal>
			<PopoverPrimitive.Content
				align={align}
				className={cn(
					"data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 min-w-56 origin-(--radix-popover-content-transform-origin) rounded-xl border bg-popover p-4 text-popover-foreground shadow-lg outline-none data-[state=closed]:animate-out data-[state=open]:animate-in",
					className,
				)}
				data-slot="popover-content"
				sideOffset={sideOffset}
				{...props}
			>
				{children}
				{showCloseButton && (
					<PopoverPrimitive.Close asChild data-slot="popover-close">
						<Button
							className="absolute top-2 right-2"
							size="icon-sm"
							variant="ghost"
						>
							<XIcon />
							<span className="sr-only">Cerrar</span>
						</Button>
					</PopoverPrimitive.Close>
				)}
			</PopoverPrimitive.Content>
		</PopoverPrimitive.Portal>
	);
}

export { Popover, PopoverContent, PopoverTrigger };
