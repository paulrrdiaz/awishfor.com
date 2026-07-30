import { ApplicationLayout } from "@/components/providers/application-layout";

export default function PublicWishlistLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <ApplicationLayout>{children}</ApplicationLayout>;
}
