import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
	label: string;
	value: string | number;
	description?: string;
	icon?: ReactNode;
	className?: string;
};

export function MetricCard({
	label,
	value,
	description,
	icon,
	className,
}: Props) {
	return (
		<div
			className={cn(
				"rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm",
				className,
			)}
		>
			<div className="flex items-start justify-between gap-3">
				<div>
					<p className="text-muted-foreground text-sm">{label}</p>
					<p className="mt-1 font-heading text-2xl leading-none">{value}</p>
				</div>
				{icon && <div className="text-primary">{icon}</div>}
			</div>
			{description && (
				<p className="mt-3 text-muted-foreground text-sm">{description}</p>
			)}
		</div>
	);
}
