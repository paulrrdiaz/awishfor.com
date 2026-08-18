"use client";

import { TRPCReactProvider } from "@/trpc/react";

/** Public mutations need tRPC; static page chrome does not. */
export function PublicWishlistProviders({
	children,
}: {
	children: React.ReactNode;
}) {
	return <TRPCReactProvider>{children}</TRPCReactProvider>;
}
