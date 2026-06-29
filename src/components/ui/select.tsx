"use client";

import { Select as SelectPrimitive } from "@base-ui/react/select";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";

function Select<Value>({ ...props }: SelectPrimitive.Root.Props<Value>) {
	return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectTrigger({
	className,
	children,
	...props
}: SelectPrimitive.Trigger.Props) {
	return (
		<SelectPrimitive.Trigger
			className={cn(
				"flex h-10 w-full items-center justify-between rounded-lg border border-input bg-background px-3 text-left text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
				className,
			)}
			data-slot="select-trigger"
			{...props}
		>
			{children}
			<SelectPrimitive.Icon
				className="text-muted-foreground"
				data-slot="select-icon"
			>
				<ChevronDownIcon className="size-4" />
			</SelectPrimitive.Icon>
		</SelectPrimitive.Trigger>
	);
}

function SelectValue({ className, ...props }: SelectPrimitive.Value.Props) {
	return (
		<SelectPrimitive.Value
			className={cn("truncate", className)}
			data-slot="select-value"
			{...props}
		/>
	);
}

function SelectContent({
	className,
	children,
	positionerClassName,
	...props
}: SelectPrimitive.Popup.Props & { positionerClassName?: string }) {
	return (
		<SelectPrimitive.Portal>
			<SelectPrimitive.Positioner
				className={cn("z-50", positionerClassName)}
				data-slot="select-positioner"
			>
				<SelectPrimitive.Popup
					className={cn(
						"min-w-48 overflow-hidden rounded-xl border bg-popover p-1 text-popover-foreground shadow-lg outline-none data-ending-style:scale-95 data-starting-style:scale-95 data-ending-style:opacity-0 data-starting-style:opacity-0",
						className,
					)}
					data-slot="select-content"
					{...props}
				>
					<SelectPrimitive.List
						className="max-h-72 overflow-y-auto"
						data-slot="select-list"
					>
						{children}
					</SelectPrimitive.List>
				</SelectPrimitive.Popup>
			</SelectPrimitive.Positioner>
		</SelectPrimitive.Portal>
	);
}

function SelectItem({
	className,
	children,
	...props
}: SelectPrimitive.Item.Props) {
	return (
		<SelectPrimitive.Item
			className={cn(
				"flex cursor-default items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm outline-none transition-colors data-highlighted:bg-muted data-selected:font-medium data-highlighted:text-foreground",
				className,
			)}
			data-slot="select-item"
			{...props}
		>
			<SelectPrimitive.ItemText data-slot="select-item-text">
				{children}
			</SelectPrimitive.ItemText>
			<SelectPrimitive.ItemIndicator
				className="text-primary"
				data-slot="select-item-indicator"
			>
				<CheckIcon className="size-4" />
			</SelectPrimitive.ItemIndicator>
		</SelectPrimitive.Item>
	);
}

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };
