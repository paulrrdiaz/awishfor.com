"use client";

import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "sonner";

import { TooltipProvider } from "@/components/ui/tooltip";
import { TRPCReactProvider } from "@/trpc/react";

/** Application-only providers that are not needed by the anonymous marketing document. */
export function AppProviders({ children }: { children: React.ReactNode }) {
	return (
		<NuqsAdapter>
			<TRPCReactProvider>
				<TooltipProvider>
					{children}
					<Toaster position="top-center" richColors />
				</TooltipProvider>
			</TRPCReactProvider>
		</NuqsAdapter>
	);
}
