import { Suspense } from "react";

import { AccountLinkEnhancement } from "@/components/layouts/marketing/account-link-enhancement";
import {
	MarketingPageviewTracker,
	MarketingSectionTracker,
} from "@/components/layouts/marketing/marketing-analytics";

export default function MarketingLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="marketing-theme min-h-svh" data-marketing-theme>
			{children}
			<MarketingSectionTracker />
			<Suspense fallback={null}>
				<MarketingPageviewTracker />
			</Suspense>
			<AccountLinkEnhancement />
		</div>
	);
}
