import { AccountLinkEnhancement } from "@/components/layouts/marketing/account-link-enhancement";

export default function PublicWishlistLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div>
			{children}
			<AccountLinkEnhancement />
		</div>
	);
}
