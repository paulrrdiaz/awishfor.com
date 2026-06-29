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
		<div className="min-h-svh bg-[#efeee9] p-2 md:p-4">
			<SidebarProvider className="min-h-[calc(100svh-1rem)] overflow-hidden rounded-xl border border-[#deded8] bg-[#fbfbf8] shadow-sm md:min-h-[calc(100svh-2rem)]">
				<AppSidebar wishlists={wishlists} />
				<SidebarInset className="bg-[#fbfbf8]">{children}</SidebarInset>
			</SidebarProvider>
		</div>
	);
}
