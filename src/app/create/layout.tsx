import { ClerkApplicationLayout } from "@/components/providers/clerk-application-layout";

export default function CreateLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <ClerkApplicationLayout>{children}</ClerkApplicationLayout>;
}
