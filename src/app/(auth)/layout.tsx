import { ClerkApplicationLayout } from "@/components/providers/clerk-application-layout";

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <ClerkApplicationLayout>{children}</ClerkApplicationLayout>;
}
