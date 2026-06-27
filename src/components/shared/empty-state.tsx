import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
	title: string;
	description?: string;
	action?: ReactNode;
	className?: string;
};

export function EmptyState({ title, description, action, className }: Props) {
	return (
		<div
			className={cn(
				"flex flex-col items-center gap-4 py-16 text-center",
				className,
			)}
		>
			<div>
				<h2 className="font-heading text-2xl text-foreground">{title}</h2>
				{description && (
					<p className="mt-2 max-w-md text-muted-foreground text-sm">
						{description}
					</p>
				)}
			</div>
			{action}
		</div>
	);
}
