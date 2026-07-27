"use client";

import { Eye, EyeOff } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";
import { Input } from "./input";

function PasswordInput({
	className,
	...props
}: Omit<React.ComponentProps<"input">, "type">) {
	const [visible, setVisible] = React.useState(false);

	return (
		<div className="relative">
			<Input
				className={cn("pr-9", className)}
				type={visible ? "text" : "password"}
				{...props}
			/>
			<button
				aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
				className="absolute inset-y-0 right-0 flex w-9 items-center justify-center text-muted-foreground hover:text-foreground"
				onClick={() => setVisible((v) => !v)}
				tabIndex={-1}
				type="button"
			>
				{visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
			</button>
		</div>
	);
}

export { PasswordInput };
