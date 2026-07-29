import { AppSidebar } from "@/components/features/dashboard/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { api } from "@/trpc/server";

export default async function ProtectedLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	let wishlists: {
		id: string;
		title: string;
		status: string;
		eventType: string;
	}[] = [];
	try {
		wishlists = await api.wishlist.list();
	} catch {
		// User not yet synced — render empty sidebar
	}

	return (
		<div className="h-svh p-2 md:p-4">
			<SidebarProvider className="h-[calc(100svh-1rem)] min-h-0 overflow-hidden rounded-xl md:h-[calc(100svh-2rem)]">
				<AppSidebar wishlists={wishlists} />
				<SidebarInset className="min-h-0">{children}</SidebarInset>
			</SidebarProvider>
		</div>
	);
}
