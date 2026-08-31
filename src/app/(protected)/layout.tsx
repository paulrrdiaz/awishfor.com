import { AppSidebar } from "@/components/features/dashboard/app-sidebar";
import { ClerkApplicationLayout } from "@/components/providers/clerk-application-layout";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function ProtectedLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<ClerkApplicationLayout>
			<div className="h-svh p-2 md:p-4">
				<SidebarProvider className="h-[calc(100svh-1rem)] min-h-0 overflow-hidden rounded-xl md:h-[calc(100svh-2rem)]">
					<AppSidebar />
					<SidebarInset className="min-h-0">{children}</SidebarInset>
				</SidebarProvider>
			</div>
		</ClerkApplicationLayout>
	);
}
