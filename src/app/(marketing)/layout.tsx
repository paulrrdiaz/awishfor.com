import { preload } from "react-dom";

import { AccountLinkEnhancement } from "@/components/layouts/marketing/account-link-enhancement";

export default function MarketingLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	preload("/assets/fonts/marketing-inter-latin.woff2", {
		as: "font",
		crossOrigin: "anonymous",
		type: "font/woff2",
	});
	preload("/assets/fonts/marketing-lora-latin.woff2", {
		as: "font",
		crossOrigin: "anonymous",
		type: "font/woff2",
	});
	preload("/assets/hero/wedding-hero-mobile-300.jpg", {
		as: "image",
		fetchPriority: "high",
		media: "(max-width: 1023px)",
	});

	return (
		<div className="marketing-theme min-h-svh" data-marketing-theme>
			{children}
			<AccountLinkEnhancement />
		</div>
	);
}
