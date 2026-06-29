"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import {
	BarChart3,
	ChevronDown,
	Circle,
	CircleHelp,
	Heart,
	Home,
	Plus,
	Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/features/dashboard/brand-logo";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

type WishlistItem = {
	id: string;
	title: string;
	status: string;
	eventType: string;
};

type Props = {
	wishlists: WishlistItem[];
};

const STATUS_META: Record<string, { label: string; className: string }> = {
	published: {
		label: "Pub",
		className: "bg-[#dff4df] text-[#3f7c44]",
	},
	draft: {
		label: "Bor",
		className: "bg-[#eeeeeb] text-[#73736b]",
	},
	archived: {
		label: "Arc",
		className: "bg-[#f5e2d8] text-[#9a5d48]",
	},
};

function getStatusMeta(status: string) {
	return (
		STATUS_META[status.toLowerCase()] ?? {
			label: status.slice(0, 3) || "Lis",
			className: "bg-[#eeeeeb] text-[#73736b]",
		}
	);
}

export function AppSidebar({ wishlists }: Props) {
	const pathname = usePathname();
	const { user } = useUser();
	const isWishlistRoute = pathname.startsWith("/dashboard/wishlists/");
	const displayName = user?.fullName ?? user?.firstName ?? "Mi cuenta";
	const email = user?.primaryEmailAddress?.emailAddress ?? "";

	return (
		<Sidebar className="border-[#e4e4df] border-r bg-white" collapsible="icon">
			<SidebarHeader className="border-[#ecece6] border-b p-3">
				<SidebarMenu>
					<SidebarMenuItem className="flex items-center gap-2">
						<SidebarMenuButton
							className="h-8 flex-1 px-1 font-heading font-semibold text-[#17213a] text-lg hover:bg-transparent group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
							render={<Link href="/dashboard" />}
							size="lg"
							tooltip="A Wish For"
						>
							<span className="group-data-[collapsible=icon]:hidden">
								A Wish For
							</span>
							<BrandMark className="hidden group-data-[collapsible=icon]:block" />
						</SidebarMenuButton>
						<SidebarTrigger className="size-6 rounded-md border border-[#e4e4df] text-[#667085] group-data-[collapsible=icon]:hidden" />
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			<SidebarContent className="gap-0 bg-white p-2">
				<SidebarGroup className="p-0">
					<SidebarGroupContent>
						<SidebarMenu className="gap-1">
							<SidebarMenuItem>
								<SidebarMenuButton
									className="h-8 rounded-lg px-3 font-medium text-[#5f687a] hover:bg-[#f7f7f2] data-active:bg-[#f7f7f2] data-active:text-[#16213a] group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
									isActive={pathname === "/dashboard"}
									render={<Link href="/dashboard" />}
									tooltip="Inicio"
								>
									<Home />
									<span>Inicio</span>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<SidebarGroup className="mt-2 p-0">
					<SidebarGroupContent>
						<SidebarMenu className="gap-1">
							<SidebarMenuItem>
								<SidebarMenuButton
									className="h-8 rounded-lg px-3 font-semibold text-[#17213a] hover:bg-[#f7f7f2] data-active:bg-[#f3f6ec] group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
									isActive={isWishlistRoute}
									tooltip="Mis wishlists"
								>
									<Heart />
									<span>Mis wishlists</span>
									<ChevronDown className="ml-auto size-3 text-[#7c8494] group-data-[collapsible=icon]:hidden" />
								</SidebarMenuButton>
							</SidebarMenuItem>
							{wishlists.length === 0 && (
								<SidebarMenuItem>
									<span className="block px-8 py-1.5 text-[#7c8494] text-xs group-data-[collapsible=icon]:hidden">
										Sin listas aún
									</span>
								</SidebarMenuItem>
							)}
							{wishlists.map((wishlist) => {
								const href = `/dashboard/wishlists/${wishlist.id}/gifts`;
								const isActive = pathname.startsWith(
									`/dashboard/wishlists/${wishlist.id}`,
								);
								const status = getStatusMeta(wishlist.status);
								return (
									<SidebarMenuItem key={wishlist.id}>
										<SidebarMenuButton
											className="h-7 rounded-md px-3 pl-8 text-[#596273] text-xs hover:bg-[#f7f7f2] data-active:bg-[#edf7e9] data-active:font-semibold data-active:text-[#17213a] group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
											isActive={isActive}
											render={<Link href={href} />}
											tooltip={wishlist.title}
										>
											<Circle
												className={cn(
													"size-1.5 fill-[#a9afb8] text-[#a9afb8]",
													isActive && "fill-[#438b52] text-[#438b52]",
												)}
											/>
											<span className="truncate">{wishlist.title}</span>
											<span
												className={cn(
													"ml-auto rounded-full px-1.5 py-0.5 font-medium text-[9px] group-data-[collapsible=icon]:hidden",
													status.className,
												)}
											>
												{status.label}
											</span>
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
							<SidebarMenuItem>
								<SidebarMenuButton
									className="h-8 rounded-lg px-3 pl-8 font-medium text-[#3c6743] text-xs hover:bg-[#f3f6ec] hover:text-[#2f5d37] group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
									render={<Link href="/create" />}
									tooltip="Nueva wishlist"
								>
									<Plus />
									<span>Nueva wishlist</span>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<SidebarGroup className="mt-2 border-[#ecece6] border-t p-0 pt-2">
					<SidebarGroupContent>
						<SidebarMenu className="gap-1">
							<SidebarMenuItem>
								<SidebarMenuButton
									className="h-8 rounded-lg px-3 font-medium text-[#6b7280] hover:bg-[#f7f7f2] group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
									tooltip="Analíticas"
								>
									<BarChart3 />
									<span>Analíticas</span>
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton
									className="h-8 rounded-lg px-3 font-medium text-[#6b7280] hover:bg-[#f7f7f2] group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
									tooltip="Configuración"
								>
									<Settings />
									<span>Configuración</span>
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton
									className="h-8 rounded-lg px-3 font-medium text-[#6b7280] hover:bg-[#f7f7f2] group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
									tooltip="Ayuda y soporte"
								>
									<CircleHelp />
									<span>Ayuda y soporte</span>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter className="border-[#ecece6] border-t bg-white p-3">
				<SidebarMenu>
					<SidebarMenuItem>
						<div className="flex h-9 items-center gap-2 group-data-[collapsible=icon]:justify-center">
							<UserButton />
							<div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
								<p className="truncate font-semibold text-[#17213a] text-xs">
									{displayName}
								</p>
								{email ? (
									<p className="truncate text-[#6b7280] text-[11px]">{email}</p>
								) : (
									<p className="truncate text-[#6b7280] text-[11px]">
										Mi cuenta
									</p>
								)}
							</div>
							<span className="text-[#6b7280] text-lg leading-none group-data-[collapsible=icon]:hidden">
								...
							</span>
						</div>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
