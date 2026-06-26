"use client";

import type { ReactNode } from "react";

export function WizardModal({
	title,
	description,
	children,
}: {
	title: string;
	description: string;
	children: ReactNode;
}) {
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 px-4">
			<div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
				<h2 className="font-semibold text-gray-900 text-lg">{title}</h2>
				<p className="mt-2 text-gray-600 text-sm">{description}</p>
				<div className="mt-6 flex flex-col gap-3">{children}</div>
			</div>
		</div>
	);
}
