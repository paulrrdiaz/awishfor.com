import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
	"inline-flex items-center rounded-full px-2 py-0.5 font-medium text-xs",
	{
		variants: {
			status: {
				available: "bg-[#e4f3e8] text-[#2f7d43]",
				partial: "bg-[#fbf1dc] text-[#9a6f1e]",
				purchased: "bg-[#eaecef] text-[#71798a]",
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
	purchased: "✓ Comprado",
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
