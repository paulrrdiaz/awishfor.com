"use client";

import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

export function WizardModal({
	title,
	description,
	children,
}: {
	title: ReactNode;
	description: ReactNode;
	children: ReactNode;
}) {
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 px-4 backdrop-blur-sm">
			<Card className="w-full max-w-md text-center shadow-xl">
				<CardContent className="p-6">
					<h2 className="font-semibold text-foreground text-lg">{title}</h2>
					<p className="mt-2 text-muted-foreground text-sm">{description}</p>
					<div className="mt-6 flex flex-col gap-3 text-left">{children}</div>
				</CardContent>
			</Card>
		</div>
	);
}
