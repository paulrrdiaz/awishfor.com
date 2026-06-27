import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const priorityBadgeVariants = cva(
	"inline-flex items-center rounded-full px-2 py-0.5 font-semibold text-xs",
	{
		variants: {
			priority: {
				low: "bg-muted text-muted-foreground",
				medium: "bg-secondary text-secondary-foreground",
				high: "bg-accent text-accent-foreground",
			},
		},
		defaultVariants: {
			priority: "medium",
		},
	},
);

const PRIORITY_LABELS = {
	low: "Opcional",
	medium: "Sugerido",
	high: "Infaltable",
} as const;

type Props = VariantProps<typeof priorityBadgeVariants> & {
	className?: string;
};

export function PriorityBadge({ priority = "medium", className }: Props) {
	return (
		<span className={cn(priorityBadgeVariants({ priority }), className)}>
			{PRIORITY_LABELS[priority ?? "medium"]}
		</span>
	);
}
