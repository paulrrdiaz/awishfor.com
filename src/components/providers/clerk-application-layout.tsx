import { ClerkProvider } from "@clerk/nextjs";
import { ApplicationLayout } from "./application-layout";

/** Client-authenticated application surfaces only; public routes stay lean. */
export function ClerkApplicationLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<ClerkProvider>
			<ApplicationLayout>{children}</ApplicationLayout>
		</ClerkProvider>
	);
}
