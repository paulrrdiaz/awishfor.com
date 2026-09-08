import { CheckIcon, MessageCircleIcon } from "lucide-react";
import Link from "next/link";
import {
	wishlistStatusBadgeVariant,
	wishlistStatusLabel,
} from "@/components/layouts/dashboard/wishlist-status";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
	formatRelativeDaysLabel,
	formatShortEventDate,
} from "@/lib/dashboard/home-format";
import {
	toCanonicalWishlistUrl,
	toWhatsAppShareUrl,
} from "@/lib/wishlist/share";
import { PreparationRibbon, RibbonNode } from "./preparation-ribbon";

export type UpcomingEvent = {
	id: string;
	slug: string;
	title: string;
	status: string;
	eventType: string;
	eventDate: string | null;
	publicUrlPath: string;
	totalUnits: number;
	purchasedUnits: number;
};

type Props = {
	upcomingEvent: UpcomingEvent | null;
};

export function AllClearPanel({ upcomingEvent }: Props) {
	return (
		<PreparationRibbon>
			<RibbonNode label="Al día" tone="done">
				<div className="rounded-2xl border border-border bg-card p-5 md:p-6">
					<div className="flex items-center gap-2">
						<span className="flex size-8 items-center justify-center rounded-full bg-[#EDF6E4] text-[#2E7D4F]">
							<CheckIcon className="size-4" />
						</span>
						<h2 className="font-heading font-semibold text-xl">
							Todo está encaminado
						</h2>
					</div>
					<p className="mt-2 text-muted-foreground text-sm">
						No tienes acciones pendientes por ahora.
					</p>

					{upcomingEvent && (
						<>
							<div className="mt-5 border-border border-t pt-5">
								<p className="mb-3 font-mono text-[10.5px] text-muted-foreground uppercase tracking-[0.16em]">
									Próximo evento
								</p>
								<div className="flex flex-wrap items-center gap-2 text-xs">
									<Badge
										variant={wishlistStatusBadgeVariant(upcomingEvent.status)}
									>
										{wishlistStatusLabel(upcomingEvent.status)}
									</Badge>
									<span className="font-semibold text-foreground text-sm">
										{upcomingEvent.title}
									</span>
									{upcomingEvent.eventDate && (
										<span className="text-muted-foreground">
											· {formatShortEventDate(upcomingEvent.eventDate)} ·{" "}
											{formatRelativeDaysLabel(upcomingEvent.eventDate)}
										</span>
									)}
								</div>

								{upcomingEvent.totalUnits > 0 && (
									<div className="mt-3">
										<Progress
											className="h-1.5"
											indicatorClassName="bg-[#C3E63E]"
											max={upcomingEvent.totalUnits}
											value={upcomingEvent.purchasedUnits}
										/>
										<p className="mt-1.5 text-muted-foreground text-xs">
											{upcomingEvent.purchasedUnits} de{" "}
											{upcomingEvent.totalUnits} regalos reservados
										</p>
									</div>
								)}
							</div>

							<div className="mt-5 flex flex-col gap-3 md:flex-row">
								<Button asChild className="rounded-full">
									<Link href={`/dashboard/wishlists/${upcomingEvent.id}`}>
										Abrir wishlist
									</Link>
								</Button>
								<Button asChild className="rounded-full" variant="outline">
									<a
										href={toWhatsAppShareUrl(
											toCanonicalWishlistUrl(upcomingEvent.publicUrlPath),
											upcomingEvent.eventType,
										)}
										rel="noreferrer"
										target="_blank"
									>
										<MessageCircleIcon />
										Compartir
									</a>
								</Button>
							</div>
						</>
					)}
				</div>
			</RibbonNode>
		</PreparationRibbon>
	);
}
