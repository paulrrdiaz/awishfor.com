import { AccountLinkEnhancement } from "@/components/layouts/marketing/account-link-enhancement";

export default function MarketingLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="marketing-theme min-h-svh" data-marketing-theme>
			{children}
			<AccountLinkEnhancement />
		</div>
	);
}
