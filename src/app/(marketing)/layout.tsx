import "@/styles/marketing.css";

import { MarketingShell } from "@/components/layouts/marketing/marketing-shell";

export default function MarketingLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="marketing-theme min-h-svh">
			<MarketingShell>{children}</MarketingShell>
		</div>
	);
}
