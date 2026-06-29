"use client";

import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function Popover<Payload>({ ...props }: PopoverPrimitive.Root.Props<Payload>) {
	return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({ ...props }: PopoverPrimitive.Trigger.Props) {
	return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverContent({
	className,
	children,
	showCloseButton = false,
	...props
}: PopoverPrimitive.Popup.Props & {
	showCloseButton?: boolean;
}) {
	return (
		<PopoverPrimitive.Portal>
			<PopoverPrimitive.Positioner
				className="z-50"
				data-slot="popover-positioner"
			>
				<PopoverPrimitive.Popup
					className={cn(
						"relative min-w-56 rounded-xl border bg-popover p-4 text-popover-foreground shadow-lg outline-none data-ending-style:scale-95 data-starting-style:scale-95 data-ending-style:opacity-0 data-starting-style:opacity-0",
						className,
					)}
					data-slot="popover-content"
					{...props}
				>
					{children}
					{showCloseButton && (
						<PopoverPrimitive.Close
							data-slot="popover-close"
							render={
								<Button
									className="absolute top-2 right-2"
									size="icon-sm"
									variant="ghost"
								/>
							}
						>
							<XIcon />
							<span className="sr-only">Cerrar</span>
						</PopoverPrimitive.Close>
					)}
				</PopoverPrimitive.Popup>
			</PopoverPrimitive.Positioner>
		</PopoverPrimitive.Portal>
	);
}

export { Popover, PopoverContent, PopoverTrigger };
