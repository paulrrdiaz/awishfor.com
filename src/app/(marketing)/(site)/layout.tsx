import { MarketingFooter } from "@/components/layouts/marketing/marketing-footer";
import { SiteHeader } from "@/components/layouts/marketing/site-header";

export default function SiteLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			<SiteHeader />
			{children}
			<MarketingFooter />
		</>
	);
}
