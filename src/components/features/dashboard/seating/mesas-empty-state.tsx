import { UsersIcon } from "lucide-react";
import Link from "next/link";
import { hrefFor } from "@/components/layouts/dashboard/wishlist-sections";
import { Button } from "@/components/ui/button";
import { SEATING_COPY } from "./seating-copy";

type Props = {
	variant: "no-guests" | "no-tables";
	wishlistId: string;
	/** Rendered under the copy for the no-tables variant; the add-table control. */
	action?: React.ReactNode;
};

/**
 * Neither variant hides or disables the Mesas tab — the host has to be able to
 * come back and see why the view is empty.
 */
export function MesasEmptyState({ variant, wishlistId, action }: Props) {
	if (variant === "no-guests") {
		return (
			<div className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-16 text-center">
				<span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
					<UsersIcon className="size-5" />
				</span>
				<h2 className="font-serif text-2xl">
					{SEATING_COPY.emptyNoGuestsTitle}
				</h2>
				<p className="text-muted-foreground text-sm leading-relaxed">
					{SEATING_COPY.emptyNoGuestsBody}
				</p>
				<Button asChild>
					<Link href={hrefFor(wishlistId, "guests")}>Ir a Invitados</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-16 text-center">
			<TableSilhouettes />
			<h2 className="font-serif text-2xl">{SEATING_COPY.emptyNoTablesTitle}</h2>
			<p className="text-muted-foreground text-sm leading-relaxed">
				{SEATING_COPY.emptyNoTablesBody}
			</p>
			{action}
			<p className="font-mono text-muted-foreground text-xs">
				2 de 10 · 1 de 8 · 1 de 7 · 3 de 5
			</p>
		</div>
	);
}

function TableSilhouettes() {
	return (
		<div aria-hidden="true" className="flex items-end gap-3 opacity-50">
			<span className="size-12 rounded-full border-2 border-border border-dashed" />
			<span className="h-10 w-20 rounded-xl border-2 border-border border-dashed" />
			<span className="size-12 rounded-full border-2 border-border border-dashed" />
		</div>
	);
}
