import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
	"inline-flex items-center rounded-full px-2 py-0.5 font-medium text-xs",
	{
		variants: {
			status: {
				available: "bg-secondary text-secondary-foreground",
				partial: "bg-primary/15 text-primary",
				purchased: "bg-muted text-muted-foreground",
				hidden: "bg-muted text-muted-foreground",
			},
		},
		defaultVariants: {
			status: "available",
		},
	},
);

const STATUS_LABELS = {
	available: "Disponible",
	partial: "Parcial",
	purchased: "Comprado",
	hidden: "Oculto",
} as const;

type Props = VariantProps<typeof statusBadgeVariants> & {
	className?: string;
};

export function StatusBadge({ status = "available", className }: Props) {
	return (
		<span className={cn(statusBadgeVariants({ status }), className)}>
			{STATUS_LABELS[status ?? "available"]}
		</span>
	);
}
