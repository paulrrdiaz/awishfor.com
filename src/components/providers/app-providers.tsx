"use client";

import { useUser } from "@clerk/nextjs";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { useEffect } from "react";
import { Toaster } from "sonner";

import { TooltipProvider } from "@/components/ui/tooltip";
import {
	identifyApplicationUser,
	initializeApplicationAnalytics,
} from "@/lib/analytics/application-client";
import { TRPCReactProvider } from "@/trpc/react";

function ApplicationAnalytics() {
	const { user } = useUser();

	useEffect(() => {
		void initializeApplicationAnalytics();
		void identifyApplicationUser(user?.id);
	}, [user?.id]);

	return null;
}

/** Application-only providers that are not needed by the anonymous marketing document. */
export function AppProviders({ children }: { children: React.ReactNode }) {
	return (
		<NuqsAdapter>
			<TRPCReactProvider>
				<TooltipProvider>
					{children}
					<ApplicationAnalytics />
					<Toaster position="top-center" richColors />
				</TooltipProvider>
			</TRPCReactProvider>
		</NuqsAdapter>
	);
}
