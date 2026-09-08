import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { wishlistStatusLabel } from "@/components/layouts/dashboard/wishlist-status";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { HomeAction } from "@/lib/dashboard/home-actions";
import {
	formatRelativeDaysLabel,
	formatShortEventDate,
} from "@/lib/dashboard/home-format";
import { actionRowTitle } from "./action-kind";

const PRIMARY_LABEL: Record<HomeAction["kind"], string> = {
	complete_draft: "Continuar configuración",
	review_rsvps: "Revisar respuestas",
	invite_guests: "Invitar participantes",
	archive: "Ir a ajustes",
};

type Props = {
	action: HomeAction;
};

export function NextStepCard({ action }: Props) {
	const checks =
		action.kind === "complete_draft"
			? (Object.entries(action.readiness.checks) as [string, boolean][])
			: null;
	const satisfiedCount = checks?.filter(([, passed]) => passed).length ?? 0;

	return (
		<div className="rounded-2xl border border-border bg-card p-5 md:p-6">
			<div className="flex flex-wrap items-center gap-2 text-xs">
				<Badge variant={action.wishlistStatus}>
					{wishlistStatusLabel(action.wishlistStatus)}
				</Badge>
				<span className="min-w-0 truncate font-semibold text-foreground">
					{action.wishlistTitle}
				</span>
				{action.eventDate && (
					<span className="text-muted-foreground">
						· {formatShortEventDate(action.eventDate)} ·{" "}
						{formatRelativeDaysLabel(action.eventDate)}
					</span>
				)}
			</div>

			<h2 className="mt-3 font-heading font-semibold text-xl md:text-2xl">
				{actionRowTitle(action)}
			</h2>
			<p className="mt-2 max-w-prose text-muted-foreground text-sm">
				{action.description}
			</p>

			{checks && (
				<div className="mt-5">
					<div className="flex gap-1.5">
						{checks.map(([key, passed]) => (
							<span
								className={
									passed
										? "h-[7px] flex-1 rounded-full bg-[#C3E63E]"
										: "h-[7px] flex-1 rounded-full bg-muted"
								}
								key={key}
							/>
						))}
					</div>
					<p className="mt-2 font-semibold text-muted-foreground text-xs">
						{satisfiedCount} de {checks.length} pasos completados
					</p>
				</div>
			)}

			<div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center">
				<Button asChild className="rounded-full">
					<Link href={action.destination}>{PRIMARY_LABEL[action.kind]}</Link>
				</Button>
				<Button asChild className="text-[#2E7D4F]" variant="link">
					<Link href={`/dashboard/wishlists/${action.wishlistId}`}>
						Abrir wishlist
						<ArrowRightIcon className="size-3.5" />
					</Link>
				</Button>
			</div>
		</div>
	);
}
