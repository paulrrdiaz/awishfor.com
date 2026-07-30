"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "sonner";

import { TooltipProvider } from "@/components/ui/tooltip";
import { TRPCReactProvider } from "@/trpc/react";

/** Application-only providers kept out of the anonymous marketing document. */
export function AppProviders({ children }: { children: React.ReactNode }) {
	return (
		<ClerkProvider>
			<NuqsAdapter>
				<TRPCReactProvider>
					<TooltipProvider>
						{children}
						<Toaster position="top-center" richColors />
					</TooltipProvider>
				</TRPCReactProvider>
			</NuqsAdapter>
		</ClerkProvider>
	);
}
