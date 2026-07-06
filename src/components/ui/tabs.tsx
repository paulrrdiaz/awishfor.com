"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import type * as React from "react";
import { cn } from "@/lib/utils";

function Tabs({ ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
	return <TabsPrimitive.Root data-slot="tabs" {...props} />;
}

function TabsList({
	className,
	...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
	return (
		<TabsPrimitive.List
			className={cn(
				"inline-flex items-center gap-1 rounded-full border bg-muted/50 p-1",
				className,
			)}
			data-slot="tabs-list"
			{...props}
		/>
	);
}

function TabsTrigger({
	className,
	...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
	return (
		<TabsPrimitive.Trigger
			className={cn(
				"rounded-full px-4 py-2 font-medium text-muted-foreground text-sm outline-none transition-colors hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
				className,
			)}
			data-slot="tabs-trigger"
			{...props}
		/>
	);
}

function TabsContent({
	className,
	...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
	return (
		<TabsPrimitive.Content
			className={cn("outline-none", className)}
			data-slot="tabs-content"
			{...props}
		/>
	);
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
