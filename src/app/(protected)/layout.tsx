import { AppSidebar } from "@/components/features/dashboard/app-sidebar";
import { ClerkApplicationLayout } from "@/components/providers/clerk-application-layout";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { api } from "@/trpc/server";

export default async function ProtectedLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	type SidebarWishlistItem = {
		id: string;
		title: string;
		status: string;
		eventType: string;
	};

	let owned: SidebarWishlistItem[] = [];
	let shared: (SidebarWishlistItem & { ownerName: string })[] = [];
	try {
		const result = await api.wishlist.list();
		owned = result.owned;
		shared = result.shared;
	} catch {
		// User not yet synced — render empty sidebar
	}

	return (
		<ClerkApplicationLayout>
			<div className="h-svh p-2 md:p-4">
				<SidebarProvider className="h-[calc(100svh-1rem)] min-h-0 overflow-hidden rounded-xl md:h-[calc(100svh-2rem)]">
					<AppSidebar owned={owned} shared={shared} />
					<SidebarInset className="min-h-0">{children}</SidebarInset>
				</SidebarProvider>
			</div>
		</ClerkApplicationLayout>
	);
}
