import { AppSidebar } from "@/components/features/dashboard/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
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
		<SidebarProvider>
			<AppSidebar wishlists={wishlists} />
			<SidebarInset>
				<header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
					<SidebarTrigger className="-ml-1" />
					<Separator className="h-4" orientation="vertical" />
				</header>
				{children}
			</SidebarInset>
		</SidebarProvider>
	);
}
