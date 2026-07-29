"use client";

import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WishlistActionsMenu } from "./wishlist-actions-menu";
import { activeSegmentFromPathname, sectionLabel } from "./wishlist-sections";

const STATUS_BADGE_VARIANT = {
	published: "published",
	draft: "draft",
	archived: "archived",
} as const;

const STATUS_LABEL: Record<string, string> = {
	published: "Publicada",
	draft: "Borrador",
	archived: "Archivada",
};

type Props = {
	wishlistId: string;
	title: string;
	status: string;
	publicUrlPath: string;
};

export function WishlistTopbar({
	wishlistId,
	title,
	status,
	publicUrlPath,
}: Props) {
	const pathname = usePathname();
	const activeSegment = activeSegmentFromPathname(pathname, wishlistId);
	const activeLabel = sectionLabel(activeSegment);
	const statusKey = status.toLowerCase();
	const badgeVariant =
		STATUS_BADGE_VARIANT[statusKey as keyof typeof STATUS_BADGE_VARIANT] ??
		"draft";
	const statusLabel = STATUS_LABEL[statusKey] ?? status;

	return (
		<header className="flex h-[55px] shrink-0 items-center justify-between gap-4 border-border border-b bg-card px-6">
			<div className="flex min-w-0 items-center gap-2.5">
				<p className="min-w-0 truncate text-muted-foreground text-xs">
					Mis wishlists /{" "}
					<span className="font-semibold text-foreground">{title}</span>
					{activeSegment !== "" && (
						<>
							{" "}
							/{" "}
							<span className="font-semibold text-foreground">
								{activeLabel}
							</span>
						</>
					)}
				</p>
				<Badge variant={badgeVariant}>{statusLabel}</Badge>
			</div>

			<div className="flex shrink-0 items-center gap-2">
				<Button
					asChild
					className="h-9 rounded-full"
					size="sm"
					variant="outline"
				>
					<Link href={publicUrlPath} target="_blank">
						Ver pública
					</Link>
				</Button>
				<WishlistActionsMenu
					publicUrlPath={publicUrlPath}
					status={status}
					wishlistId={wishlistId}
				/>
				<Button asChild className="h-9 rounded-full" size="sm">
					<Link href="/create">
						<PlusIcon />
						Crear wishlist
					</Link>
				</Button>
			</div>
		</header>
	);
}
