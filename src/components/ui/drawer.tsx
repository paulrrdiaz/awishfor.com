"use client";

import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer";
import { XIcon } from "lucide-react";
import type * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function Drawer({ ...props }: DrawerPrimitive.Root.Props) {
	return <DrawerPrimitive.Root data-slot="drawer" {...props} />;
}

function DrawerTrigger({ ...props }: DrawerPrimitive.Trigger.Props) {
	return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

function DrawerClose({ ...props }: DrawerPrimitive.Close.Props) {
	return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}

function DrawerContent({
	className,
	children,
	showCloseButton = true,
	...props
}: DrawerPrimitive.Popup.Props & {
	showCloseButton?: boolean;
}) {
	return (
		<DrawerPrimitive.Portal>
			<DrawerPrimitive.Backdrop
				className="fixed inset-0 z-50 bg-black/10 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xs"
				data-slot="drawer-overlay"
			/>
			<DrawerPrimitive.Viewport
				className="fixed inset-x-0 bottom-0 z-50 flex max-h-[92svh] items-end"
				data-slot="drawer-viewport"
			>
				<DrawerPrimitive.Popup
					className={cn(
						"relative w-full rounded-t-2xl border bg-popover text-popover-foreground shadow-lg outline-none data-ending-style:translate-y-10 data-starting-style:translate-y-10 data-ending-style:opacity-0 data-starting-style:opacity-0",
						className,
					)}
					data-slot="drawer-content"
					{...props}
				>
					<DrawerPrimitive.Content className="relative" data-slot="drawer-body">
						{children}
						{showCloseButton && (
							<DrawerPrimitive.Close
								data-slot="drawer-close"
								render={
									<Button
										className="absolute top-3 right-3"
										size="icon-sm"
										variant="ghost"
									/>
								}
							>
								<XIcon />
								<span className="sr-only">Cerrar</span>
							</DrawerPrimitive.Close>
						)}
					</DrawerPrimitive.Content>
				</DrawerPrimitive.Popup>
			</DrawerPrimitive.Viewport>
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

function DrawerTitle({ className, ...props }: DrawerPrimitive.Title.Props) {
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
}: DrawerPrimitive.Description.Props) {
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
