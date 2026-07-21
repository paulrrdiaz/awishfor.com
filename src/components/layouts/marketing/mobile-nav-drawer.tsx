"use client";

import { Menu } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";

export function MobileNavDrawer({ isSignedIn }: { isSignedIn: boolean }) {
	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button
					aria-label="Abrir menú"
					className="h-11 w-11 rounded-full text-[var(--mink)] hover:bg-[rgba(23,62,41,0.06)]"
					size="icon"
					variant="ghost"
				>
					<Menu className="size-5" />
				</Button>
			</SheetTrigger>
			<SheetContent
				className="marketing-theme gap-0 bg-[var(--mbg)]"
				side="right"
			>
				<SheetHeader>
					<SheetTitle className="m-serif text-[var(--mink)]">Menú</SheetTitle>
				</SheetHeader>
				<nav className="flex flex-col gap-1 px-4 pb-4">
					<SheetClose asChild>
						<a
							className="flex min-h-11 items-center font-medium text-[15px] text-[var(--mink)]"
							href="#como-funciona"
						>
							Cómo funciona
						</a>
					</SheetClose>
					<SheetClose asChild>
						<a
							className="flex min-h-11 items-center font-medium text-[15px] text-[var(--mink)]"
							href="#ocasiones"
						>
							Ocasiones
						</a>
					</SheetClose>
					<SheetClose asChild>
						<Link
							className="flex min-h-11 items-center font-medium text-[15px] text-[var(--mink)]"
							href={isSignedIn ? "/dashboard" : "/sign-in"}
						>
							{isSignedIn ? "Dashboard" : "Iniciar sesión"}
						</Link>
					</SheetClose>
					<SheetClose asChild>
						<Link
							className="!w-full m-btn m-btn-lime mt-3 justify-center"
							data-glow
							href="/create"
						>
							Crear mi wishlist
						</Link>
					</SheetClose>
				</nav>
			</SheetContent>
		</Sheet>
	);
}
