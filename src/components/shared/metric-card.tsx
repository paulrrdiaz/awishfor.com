import { cn } from "@/lib/utils";

type Props = {
	label: string;
	value: string | number;
	className?: string;
};

export function MetricCard({ label, value, className }: Props) {
	return (
		<div
			className={cn(
				"rounded-lg border border-border bg-card p-[18px] text-card-foreground shadow-sm",
				className,
			)}
		>
			<p className="text-muted-foreground text-xs">{label}</p>
			<p className="mt-1 font-heading text-[30px] leading-none">{value}</p>
		</div>
	);
}
