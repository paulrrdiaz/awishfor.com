import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { HomeAction } from "@/lib/dashboard/home-actions";
import { formatDeadlineBadge } from "@/lib/dashboard/home-format";
import {
	ACTION_KIND_ICON,
	actionRowContext,
	actionRowTitle,
} from "./action-kind";

type Props = {
	action: HomeAction;
};

export function SubsequentActionRow({ action }: Props) {
	const Icon = ACTION_KIND_ICON[action.kind];
	const deadlineBadge =
		action.kind === "review_rsvps" && action.rsvpDeadline
			? formatDeadlineBadge(action.rsvpDeadline)
			: null;

	return (
		<Link
			className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:border-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
			href={action.destination}
		>
			<span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-muted">
				<Icon className="size-4 text-muted-foreground" />
			</span>
			<span className="min-w-0 flex-1">
				<span className="flex flex-wrap items-center gap-x-2 gap-y-1">
					<span className="truncate font-semibold text-sm">
						{actionRowTitle(action)}
					</span>
					{deadlineBadge && (
						<Badge className="bg-amber-50 text-amber-800" variant="outline">
							{deadlineBadge}
						</Badge>
					)}
				</span>
				<span className="block truncate text-muted-foreground text-xs">
					{action.wishlistTitle} · {actionRowContext(action)}
				</span>
				{action.ownerName && (
					<Badge className="mt-1" variant="outline">
						Compartida por {action.ownerName}
					</Badge>
				)}
			</span>
			<ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
		</Link>
	);
}
