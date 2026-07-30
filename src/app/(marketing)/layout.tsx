import "@/styles/marketing.css";

import { AccountLinkEnhancement } from "@/components/layouts/marketing/account-link-enhancement";
import { marketingInter, marketingLora } from "@/lib/marketing-fonts";

export default function MarketingLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div
			className={`${marketingInter.variable} ${marketingLora.variable} marketing-theme min-h-svh`}
		>
			{children}
			<AccountLinkEnhancement />
		</div>
	);
}
