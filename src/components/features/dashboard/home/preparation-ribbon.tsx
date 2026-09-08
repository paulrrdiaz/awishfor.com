import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type RibbonNodeProps = {
	label: string;
	tone: "done" | "pending" | "error";
	children: ReactNode;
};

const NODE_DOT_CLASS: Record<RibbonNodeProps["tone"], string> = {
	done: "bg-[#C3E63E] ring-4 ring-[#F7F8F1]",
	pending: "border-2 border-[#CFE0AE] bg-white",
	error: "border-2 border-[#E3C5BE] bg-white",
};

const NODE_RAIL_CLASS: Record<RibbonNodeProps["tone"], string> = {
	done: "border-[#C3E63E]",
	pending: "border-[#E3EBD3]",
	error: "border-[#E3C5BE]",
};

const NODE_LABEL_CLASS: Record<RibbonNodeProps["tone"], string> = {
	done: "text-[#2E7D4F]",
	pending: "text-muted-foreground",
	error: "text-[#A8443A]",
};

export function RibbonNode({ label, tone, children }: RibbonNodeProps) {
	return (
		<div className="relative pl-7">
			<span
				aria-hidden
				className={cn(
					"absolute top-1 left-[3px] size-3 rounded-full",
					NODE_DOT_CLASS[tone],
				)}
			/>
			<div className={cn("border-l-2 pb-1 pl-[18px]", NODE_RAIL_CLASS[tone])}>
				<p
					className={cn(
						"mb-2 font-mono text-[10.5px] uppercase tracking-[0.16em]",
						NODE_LABEL_CLASS[tone],
					)}
				>
					{label}
				</p>
				{children}
			</div>
		</div>
	);
}

export function PreparationRibbon({ children }: { children: ReactNode }) {
	return <div className="flex flex-col gap-2">{children}</div>;
}
