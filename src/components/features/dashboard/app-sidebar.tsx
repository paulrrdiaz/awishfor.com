"use client";

import { UserButton, useClerk, useUser } from "@clerk/nextjs";
import { CircleHelp, CircleUserRound, Heart, Home } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
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
import { api } from "@/trpc/react";

export function AppSidebar() {
	const pathname = usePathname();
	const { user } = useUser();
	const clerk = useClerk();
	const { data } = api.wishlist.list.useQuery();
	const wishlistCount = data?.owned.length ?? 0;

	const isWishlistsRoute = pathname.startsWith("/dashboard/wishlists");
	const displayName = user?.fullName ?? user?.firstName ?? "Mi cuenta";
	const email = user?.primaryEmailAddress?.emailAddress ?? "";
	const avatarUrl = user?.imageUrl;
	const fallbackInitial = displayName.trim().charAt(0).toUpperCase() || "M";

	return (
		<Sidebar className="border-[#e4e4df] border-r bg-white" collapsible="icon">
			<SidebarHeader className="border-[#ecece6] border-b p-3 group-data-[collapsible=icon]:p-2">
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							className="h-10 items-center justify-center p-0 hover:bg-transparent group-data-[collapsible=icon]:size-8"
							size="lg"
							tooltip="A Wish For"
						>
							<Link href="/dashboard">
								<Image
									alt="A Wish For"
									className="size-8 object-contain"
									height={32}
									priority
									src="/assets/isotype.svg"
									width={32}
								/>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			<SidebarContent className="gap-0 bg-white p-2">
				<SidebarGroup className="p-0">
					<SidebarGroupContent>
						<SidebarMenu className="gap-1">
							<SidebarMenuItem>
								<SidebarMenuButton
									asChild
									className="h-8 rounded-lg px-3 font-medium text-[#5f687a] hover:bg-[#f7f7f2] data-active:bg-[#f7f7f2] data-active:text-[#16213a] group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
									isActive={pathname === "/dashboard"}
									tooltip="Inicio"
								>
									<Link href="/dashboard">
										<Home />
										<span className="group-data-[collapsible=icon]:sr-only">
											Inicio
										</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton
									asChild
									className="h-8 rounded-lg px-3 font-medium text-[#5f687a] hover:bg-[#f7f7f2] data-active:bg-[#f7f7f2] data-active:text-[#16213a] group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
									isActive={isWishlistsRoute}
									tooltip="Mis wishlists"
								>
									<Link href="/dashboard/wishlists">
										<Heart />
										<span className="flex-1 group-data-[collapsible=icon]:sr-only">
											Mis wishlists
										</span>
										{wishlistCount > 0 && (
											<Badge
												className="group-data-[collapsible=icon]:hidden"
												variant="secondary"
											>
												{wishlistCount}
											</Badge>
										)}
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton
									className="h-8 rounded-lg px-3 font-medium text-[#5f687a] hover:bg-[#f7f7f2] group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
									onClick={() => clerk.openUserProfile()}
									tooltip="Mi cuenta"
								>
									<CircleUserRound />
									<span className="group-data-[collapsible=icon]:sr-only">
										Mi cuenta
									</span>
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton
									className="h-8 rounded-lg px-3 font-medium text-[#6b7280] hover:bg-[#f7f7f2] group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
									tooltip="Ayuda y soporte"
								>
									<CircleHelp />
									<span className="group-data-[collapsible=icon]:sr-only">
										Ayuda y soporte
									</span>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<div className="flex-1" />
				<SidebarGroup className="p-0">
					<SidebarGroupContent>
						<SidebarMenu className="inline-flex w-a">
							<SidebarMenuItem>
								<SidebarMenuButton
									asChild
									className="px-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
									tooltip="Expandir"
								>
									<SidebarTrigger className="size-6 rounded-md border border-[#e4e4df] text-[#667085]" />
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter className="border-[#ecece6] border-t bg-white p-3">
				<SidebarMenu>
					<SidebarMenuItem>
						<div className="relative flex min-h-10 items-center gap-2 rounded-md px-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
							<div
								aria-hidden
								className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#edf7e9] font-semibold text-[#3c6743] text-xs group-data-[collapsible=icon]:hidden"
								style={
									avatarUrl
										? {
												backgroundImage: `url(${avatarUrl})`,
												backgroundPosition: "center",
												backgroundSize: "cover",
											}
										: undefined
								}
							>
								{avatarUrl ? null : fallbackInitial}
							</div>
							<div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
								<p className="truncate font-semibold text-[#17213a] text-xs">
									{displayName}
								</p>
								<p className="truncate text-[#6b7280] text-[11px]">
									{email || "Mi cuenta"}
								</p>
							</div>
							<div className="absolute inset-y-0 right-0 flex items-center group-data-[collapsible=icon]:static">
								<UserButton
									appearance={{
										elements: {
											rootBox: "size-8",
											userButtonBox: "size-8",
											userButtonTrigger:
												"size-8 rounded-md transition-colors hover:bg-[#f7f7f2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9ecb69]/50",
											userButtonAvatarBox: "size-8",
										},
									}}
									userProfileMode="modal"
								/>
							</div>
						</div>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
