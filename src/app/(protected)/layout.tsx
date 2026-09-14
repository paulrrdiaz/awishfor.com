import { AppSidebar } from "@/components/features/dashboard/app-sidebar";
import { MobileTabBar } from "@/components/layouts/dashboard/mobile/mobile-tab-bar";
import { ClerkApplicationLayout } from "@/components/providers/clerk-application-layout";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function ProtectedLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<ClerkApplicationLayout>
			<div className="h-svh p-0 md:p-4 print:h-auto print:p-0">
				<SidebarProvider className="h-svh min-h-0 overflow-hidden rounded-none md:h-[calc(100svh-2rem)] md:rounded-xl print:block print:h-auto print:overflow-visible print:rounded-none">
					<div className="contents print:hidden">
						<AppSidebar />
					</div>
					<SidebarInset className="min-h-0 overflow-clip print:h-auto print:overflow-visible">
						{children}
						<div className="contents print:hidden">
							<MobileTabBar />
						</div>
					</SidebarInset>
				</SidebarProvider>
			</div>
		</ClerkApplicationLayout>
	);
}
