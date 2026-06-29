"use client";

import { cva } from "class-variance-authority";
import type * as React from "react";
import { createContext, useContext, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type ToggleGroupContextValue = {
	multiple: boolean;
	values: string[];
	toggle: (value: string) => void;
	disabled: boolean;
};

const ToggleGroupContext = createContext<ToggleGroupContextValue | null>(null);

const toggleGroupItemVariants = cva(
	"inline-flex items-center justify-center rounded-lg px-3 py-2 font-medium text-sm outline-none transition-colors hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-[pressed=true]:bg-primary data-[pressed=true]:text-primary-foreground",
);

function ToggleGroup({
	className,
	value,
	defaultValue,
	onValueChange,
	multiple = false,
	disabled = false,
	children,
	...props
}: React.ComponentProps<"div"> & {
	value?: string[];
	defaultValue?: string[];
	onValueChange?: (value: string[]) => void;
	multiple?: boolean;
	disabled?: boolean;
}) {
	const [internalValue, setInternalValue] = useState(defaultValue ?? []);
	const values = value ?? internalValue;

	const contextValue = useMemo<ToggleGroupContextValue>(
		() => ({
			multiple,
			values,
			disabled,
			toggle: (nextValue: string) => {
				const next = multiple
					? values.includes(nextValue)
						? values.filter((valueItem) => valueItem !== nextValue)
						: [...values, nextValue]
					: values.includes(nextValue)
						? []
						: [nextValue];

				if (value == null) {
					setInternalValue(next);
				}
				onValueChange?.(next);
			},
		}),
		[disabled, multiple, onValueChange, value, values],
	);

	return (
		<ToggleGroupContext.Provider value={contextValue}>
			<div
				className={cn(
					"inline-flex items-center gap-1 rounded-xl border bg-muted/40 p-1",
					className,
				)}
				data-slot="toggle-group"
				{...props}
			>
				{children}
			</div>
		</ToggleGroupContext.Provider>
	);
}

function ToggleGroupItem({
	className,
	value,
	...props
}: React.ComponentProps<"button"> & {
	value: string;
}) {
	const context = useContext(ToggleGroupContext);
	if (!context) {
		throw new Error("ToggleGroupItem must be used inside ToggleGroup");
	}

	const pressed = context.values.includes(value);

	return (
		<button
			aria-pressed={pressed}
			className={cn(toggleGroupItemVariants(), className)}
			data-pressed={pressed}
			data-slot="toggle-group-item"
			disabled={context.disabled || props.disabled}
			onClick={(event) => {
				props.onClick?.(event);
				if (!event.defaultPrevented) {
					context.toggle(value);
				}
			}}
			type="button"
			{...props}
		/>
	);
}

export { ToggleGroup, ToggleGroupItem };
