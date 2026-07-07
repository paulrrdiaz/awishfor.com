"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import {
	BarChart3,
	ChevronDown,
	Circle,
	CircleHelp,
	Heart,
	Home,
	MoreHorizontal,
	Plus,
	Settings,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
	const avatarUrl = user?.imageUrl;
	const fallbackInitial = displayName.trim().charAt(0).toUpperCase() || "M";

	return (
		<Sidebar className="border-[#e4e4df] border-r bg-white" collapsible="icon">
			<SidebarHeader className="border-[#ecece6] border-b p-3 group-data-[collapsible=icon]:p-2">
				<SidebarMenu>
					<SidebarMenuItem className="flex items-center gap-2 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-1">
						<SidebarMenuButton
							asChild
							className="h-40 flex-1 items-center justify-center p-0 px-1 hover:bg-transparent group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
							size="lg"
							tooltip="A Wish For"
						>
							<Link href="/dashboard">
								<Image
									alt="A Wish For"
									className="h-40 w-auto group-data-[collapsible=icon]:hidden"
									height={32}
									priority
									src="/assets/logo.svg"
									width={320}
								/>
								<Image
									alt="A Wish For"
									className="hidden size-6 object-contain group-data-[collapsible=icon]:block"
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
										<span className="group-data-[collapsible=icon]:hidden">
											Inicio
										</span>
									</Link>
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
									<span className="group-data-[collapsible=icon]:hidden">
										Mis wishlists
									</span>
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
											asChild
											className="h-7 rounded-md px-3 pl-8 text-[#596273] text-xs hover:bg-[#f7f7f2] data-active:bg-[#edf7e9] data-active:font-semibold data-active:text-[#17213a] group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
											isActive={isActive}
											tooltip={wishlist.title}
										>
											<Link href={href}>
												<Circle
													className={cn(
														"size-1.5 fill-[#a9afb8] text-[#a9afb8]",
														isActive && "fill-[#438b52] text-[#438b52]",
													)}
												/>
												<span className="truncate group-data-[collapsible=icon]:hidden">
													{wishlist.title}
												</span>
												<span
													className={cn(
														"ml-auto rounded-full px-1.5 py-0.5 font-medium text-[9px] group-data-[collapsible=icon]:hidden",
														status.className,
													)}
												>
													{status.label}
												</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
							<SidebarMenuItem>
								<SidebarMenuButton
									asChild
									className="h-8 rounded-lg px-3 pl-8 font-medium text-[#3c6743] text-xs hover:bg-[#f3f6ec] hover:text-[#2f5d37] group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
									tooltip="Nueva wishlist"
								>
									<Link href="/create">
										<Plus />
										<span className="group-data-[collapsible=icon]:hidden">
											Nueva wishlist
										</span>
									</Link>
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
									<span className="group-data-[collapsible=icon]:hidden">
										Analíticas
									</span>
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton
									className="h-8 rounded-lg px-3 font-medium text-[#6b7280] hover:bg-[#f7f7f2] group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
									tooltip="Configuración"
								>
									<Settings />
									<span className="group-data-[collapsible=icon]:hidden">
										Configuración
									</span>
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton
									className="h-8 rounded-lg px-3 font-medium text-[#6b7280] hover:bg-[#f7f7f2] group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
									tooltip="Ayuda y soporte"
								>
									<CircleHelp />
									<span className="group-data-[collapsible=icon]:hidden">
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
							<div className="pointer-events-none flex size-7 shrink-0 items-center justify-center rounded-md text-[#6b7280] group-data-[collapsible=icon]:hidden">
								<MoreHorizontal aria-hidden className="size-4" />
							</div>
							<div className="absolute inset-y-0 right-0 flex items-center group-data-[collapsible=icon]:static">
								<UserButton
									appearance={{
										elements: {
											rootBox: "size-8",
											userButtonBox: "size-8",
											userButtonTrigger:
												"size-8 rounded-md opacity-0 transition-colors hover:bg-[#f7f7f2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9ecb69]/50 group-data-[collapsible=icon]:opacity-100",
											userButtonAvatarBox:
												"hidden size-8 group-data-[collapsible=icon]:block",
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
