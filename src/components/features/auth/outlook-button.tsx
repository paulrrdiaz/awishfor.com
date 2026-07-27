"use client";

import { Button } from "@/components/ui/button";

interface OutlookButtonProps {
	onClick: () => void;
	isLoading?: boolean;
	label?: string;
}

export function OutlookButton({
	onClick,
	isLoading = false,
	label = "Continuar con Outlook",
}: OutlookButtonProps) {
	return (
		<Button
			className="w-full rounded-full"
			disabled={isLoading}
			onClick={onClick}
			type="button"
			variant="outline"
		>
			<svg
				aria-hidden="true"
				className="size-4"
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
			>
				<rect fill="#F25022" height="10.9" width="10.9" x="1" y="1" />
				<rect fill="#7FBA00" height="10.9" width="10.9" x="12.1" y="1" />
				<rect fill="#00A4EF" height="10.9" width="10.9" x="1" y="12.1" />
				<rect fill="#FFB900" height="10.9" width="10.9" x="12.1" y="12.1" />
			</svg>
			{isLoading ? "Redirigiendo…" : label}
		</Button>
	);
}
