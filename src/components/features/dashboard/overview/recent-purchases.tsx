import { ShoppingBag } from "lucide-react";
import type { Locale } from "@/generated/prisma/enums";
import { formatRelativeDate } from "@/lib/format/dates";
import type { RecentPurchaseViewModel } from "@/server/mappers/view-models";

const STATUS_LABELS: Record<RecentPurchaseViewModel["status"], string> = {
	confirmed: "Confirmado",
	pending: "Pendiente",
};

const STATUS_STYLES: Record<RecentPurchaseViewModel["status"], string> = {
	confirmed: "bg-primary/20 text-secondary",
	pending: "bg-muted text-muted-foreground",
};

type Props = {
	purchases: RecentPurchaseViewModel[];
	language: string;
};

function getInitials(name: string) {
	return name
		.split(" ")
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase())
		.join("");
}

export function RecentPurchases({ purchases, language }: Props) {
	return (
		<section className="rounded-xl border border-border bg-card p-5 shadow-sm">
			<div className="mb-5 flex items-center justify-between gap-4">
				<div>
					<h2 className="font-heading font-semibold text-xl">
						Compras recientes
					</h2>
					<p className="mt-1 text-muted-foreground text-sm">
						Últimas compras registradas en esta wishlist.
					</p>
				</div>
				<ShoppingBag className="size-5 text-primary" />
			</div>

			{purchases.length === 0 ? (
				<div className="rounded-lg border border-border border-dashed px-4 py-8 text-center text-muted-foreground text-sm">
					Aún no hay compras registradas.
				</div>
			) : (
				<ul className="divide-y divide-border">
					{purchases.map((purchase) => (
						<li className="flex items-center gap-3 py-4" key={purchase.id}>
							<div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-sm">
								{getInitials(purchase.guestName) || "?"}
							</div>
							<div className="min-w-0 flex-1">
								<div className="flex flex-wrap items-center gap-2">
									<p className="truncate font-medium">{purchase.guestName}</p>
									<span
										className={`inline-flex rounded-full px-2 py-0.5 font-medium text-xs ${
											STATUS_STYLES[purchase.status]
										}`}
									>
										{STATUS_LABELS[purchase.status]}
									</span>
								</div>
								<p className="mt-1 text-muted-foreground text-sm">
									{purchase.quantity} x {purchase.giftName} ·{" "}
									{formatRelativeDate(purchase.createdAt, language as Locale)}
								</p>
							</div>
						</li>
					))}
				</ul>
			)}
		</section>
	);
}
