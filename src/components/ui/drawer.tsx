"use client";

import { XIcon } from "lucide-react";
import type * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function Drawer({
	...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) {
	return <DrawerPrimitive.Root data-slot="drawer" {...props} />;
}

function DrawerTrigger({
	...props
}: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
	return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

function DrawerClose({
	...props
}: React.ComponentProps<typeof DrawerPrimitive.Close>) {
	return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}

function DrawerContent({
	className,
	children,
	showCloseButton = true,
	...props
}: React.ComponentProps<typeof DrawerPrimitive.Content> & {
	showCloseButton?: boolean;
}) {
	return (
		<DrawerPrimitive.Portal>
			<DrawerPrimitive.Overlay
				className="fixed inset-0 z-50 bg-black/10 supports-backdrop-filter:backdrop-blur-xs"
				data-slot="drawer-overlay"
			/>
			<div
				className="fixed inset-x-0 bottom-0 z-50 flex max-h-[92svh] items-end"
				data-slot="drawer-viewport"
			>
				<DrawerPrimitive.Content
					className={cn(
						"relative max-h-[inherit] w-full rounded-t-2xl border bg-popover text-popover-foreground shadow-lg outline-none",
						className,
					)}
					data-slot="drawer-content"
					{...props}
				>
					<div
						className="relative flex max-h-[inherit] flex-col overflow-hidden"
						data-slot="drawer-body"
					>
						{children}
						{showCloseButton && (
							<DrawerPrimitive.Close asChild data-slot="drawer-close">
								<Button
									className="absolute top-3 right-3"
									size="icon-sm"
									variant="ghost"
								>
									<XIcon />
									<span className="sr-only">Cerrar</span>
								</Button>
							</DrawerPrimitive.Close>
						)}
					</div>
				</DrawerPrimitive.Content>
			</div>
		</DrawerPrimitive.Portal>
	);
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			className={cn("flex flex-col gap-1.5 p-4", className)}
			data-slot="drawer-header"
			{...props}
		/>
	);
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			className={cn("mt-auto flex flex-col gap-2 p-4", className)}
			data-slot="drawer-footer"
			{...props}
		/>
	);
}

function DrawerTitle({
	className,
	...props
}: React.ComponentProps<typeof DrawerPrimitive.Title>) {
	return (
		<DrawerPrimitive.Title
			className={cn("font-heading font-medium text-base", className)}
			data-slot="drawer-title"
			{...props}
		/>
	);
}

function DrawerDescription({
	className,
	...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
	return (
		<DrawerPrimitive.Description
			className={cn("text-muted-foreground text-sm", className)}
			data-slot="drawer-description"
			{...props}
		/>
	);
}

export {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
};
