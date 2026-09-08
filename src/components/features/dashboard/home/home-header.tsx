"use client";

import { useUser } from "@clerk/nextjs";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function timeOfDayGreeting(now: Date = new Date()): string {
	const hour = now.getHours();
	if (hour < 12) return "Buenos días";
	if (hour < 19) return "Buenas tardes";
	return "Buenas noches";
}

type Props = {
	subtitle: string;
	showCreateButton?: boolean;
};

export function HomeHeader({ subtitle, showCreateButton = true }: Props) {
	const { user } = useUser();
	const firstName = user?.firstName ?? user?.fullName ?? "";
	const greeting = firstName
		? `${timeOfDayGreeting()}, ${firstName}`
		: timeOfDayGreeting();

	return (
		<div className="flex flex-wrap items-end justify-between gap-3">
			<div>
				<h1 className="font-heading font-semibold text-2xl">{greeting}</h1>
				<p className="mt-1 text-muted-foreground text-sm">{subtitle}</p>
			</div>
			{showCreateButton && (
				<Button
					asChild
					className="w-full rounded-full md:w-auto"
					variant="outline"
				>
					<Link href="/create">
						<PlusIcon />
						Crear wishlist
					</Link>
				</Button>
			)}
		</div>
	);
}
