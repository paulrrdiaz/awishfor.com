"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import type * as React from "react";
import { cn } from "@/lib/utils";

function Select({
	...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
	return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectTrigger({
	className,
	children,
	...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
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
			<SelectPrimitive.Icon asChild data-slot="select-icon">
				<ChevronDownIcon className="size-4 text-muted-foreground" />
			</SelectPrimitive.Icon>
		</SelectPrimitive.Trigger>
	);
}

function SelectValue({
	className,
	...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
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
	position = "popper",
	...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
	return (
		<SelectPrimitive.Portal>
			<SelectPrimitive.Content
				className={cn(
					"data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 relative z-50 min-w-48 overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-lg outline-none data-[state=closed]:animate-out data-[state=open]:animate-in",
					position === "popper" &&
						"data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1",
					className,
				)}
				data-slot="select-content"
				position={position}
				{...props}
			>
				<SelectPrimitive.Viewport
					className={cn(
						"max-h-72 overflow-y-auto p-1",
						position === "popper" &&
							"h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]",
					)}
					data-slot="select-viewport"
				>
					{children}
				</SelectPrimitive.Viewport>
			</SelectPrimitive.Content>
		</SelectPrimitive.Portal>
	);
}

function SelectItem({
	className,
	children,
	...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
	return (
		<SelectPrimitive.Item
			className={cn(
				"flex cursor-default items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm outline-none transition-colors data-highlighted:bg-muted data-[state=checked]:font-medium data-highlighted:text-foreground",
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
