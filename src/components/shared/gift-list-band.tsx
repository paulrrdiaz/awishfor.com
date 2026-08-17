import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
	children: ReactNode;
	className?: string;
};

/**
 * The gift list's card-colored surface treatment (`bg-card`, square corners,
 * no border — the background color shift against the page is enough
 * separation) shared by every call site. Callers supply their own
 * `className` for how the band reaches its edges — a full viewport breakout
 * for single-column layouts, a narrower breakout for a layout whose gift
 * section lives inside a persistent multi-column grid — since that mechanic
 * depends on each layout's own surrounding structure.
 */
export function GiftListBand({ children, className }: Props) {
	return <div className={cn("bg-card", className)}>{children}</div>;
}
