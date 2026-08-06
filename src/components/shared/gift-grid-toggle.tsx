import { cn } from "@/lib/utils";

export type GiftGridColumns = 1 | 2 | 3;

type Props = {
	className?: string;
	value: GiftGridColumns;
	onChange: (columns: GiftGridColumns) => void;
};

const COLUMN_OPTIONS = [3, 2, 1] as const;

function GridColumnsIcon({ columns }: { columns: GiftGridColumns }) {
	return (
		<span
			aria-hidden="true"
			className="grid size-3.5 gap-[1.5px]"
			style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
		>
			{Array.from({ length: columns * 2 }).map((_, index) => (
				<span
					className="rounded-[1px] bg-current"
					// biome-ignore lint/suspicious/noArrayIndexKey: cells are static and positional
					key={index}
				/>
			))}
		</span>
	);
}

export function GiftGridToggle({ className, value, onChange }: Props) {
	return (
		<fieldset
			className={cn(
				"flex shrink-0 rounded-lg border border-border bg-card px-2 py-0.5",
				className,
			)}
		>
			<legend className="sr-only">Columnas de regalos</legend>
			{COLUMN_OPTIONS.map((columns) => {
				const isSelected = columns === value;

				return (
					<button
						aria-label={`Mostrar en ${columns} ${columns === 1 ? "columna" : "columnas"}`}
						aria-pressed={isSelected}
						className={cn(
							"flex size-6 cursor-pointer items-center justify-center rounded-[5px] transition-colors",
							isSelected
								? "bg-accent text-accent-foreground"
								: "text-muted-foreground hover:bg-muted hover:text-foreground",
						)}
						key={columns}
						onClick={() => onChange(columns)}
						title={`${columns} ${columns === 1 ? "columna" : "columnas"}`}
						type="button"
					>
						<GridColumnsIcon columns={columns} />
					</button>
				);
			})}
		</fieldset>
	);
}
