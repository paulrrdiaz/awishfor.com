"use client";

import { UserButton } from "@clerk/nextjs";
import { Gift, Home, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

type WishlistItem = {
	id: string;
	title: string;
	status: string;
	eventType: string;
};

type Props = {
	wishlists: WishlistItem[];
};

export function AppSidebar({ wishlists }: Props) {
	const pathname = usePathname();

	return (
		<Sidebar>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton render={<Link href="/dashboard" />} size="lg">
							<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
								<Sparkles className="size-4" />
							</div>
							<div className="flex flex-col gap-0.5 leading-none">
								<span className="font-semibold">a wishfor</span>
								<span className="text-sidebar-foreground/60 text-xs">
									Dashboard
								</span>
							</div>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton
									isActive={pathname === "/dashboard"}
									render={<Link href="/dashboard" />}
								>
									<Home />
									<span>Inicio</span>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<SidebarGroup>
					<SidebarGroupLabel>Mis listas</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{wishlists.length === 0 && (
								<SidebarMenuItem>
									<span className="px-2 text-sidebar-foreground/50 text-xs">
										Sin listas aún
									</span>
								</SidebarMenuItem>
							)}
							{wishlists.map((wishlist) => {
								const href = `/dashboard/wishlists/${wishlist.id}/gifts`;
								const isActive = pathname.startsWith(
									`/dashboard/wishlists/${wishlist.id}`,
								);
								return (
									<SidebarMenuItem key={wishlist.id}>
										<SidebarMenuButton
											isActive={isActive}
											render={<Link href={href} />}
										>
											<Gift />
											<span className="truncate">{wishlist.title}</span>
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter>
				<div className="flex items-center gap-3 px-2 py-2">
					<UserButton />
					<span className="truncate text-sidebar-foreground/70 text-sm">
						Mi cuenta
					</span>
				</div>
			</SidebarFooter>
		</Sidebar>
	);
}
