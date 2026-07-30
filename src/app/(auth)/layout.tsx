import { ApplicationLayout } from "@/components/providers/application-layout";

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <ApplicationLayout>{children}</ApplicationLayout>;
}
