import { ApplicationLayout } from "@/components/providers/application-layout";

export default function CreateLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <ApplicationLayout>{children}</ApplicationLayout>;
}
