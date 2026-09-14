"use client";

import { PlusIcon } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
	SEATING_MAX_CAPACITY,
	SEATING_MAX_TABLES_PER_BATCH,
	SEATING_MIN_CAPACITY,
} from "@/server/services/seating.service";

export type AddTableValues = {
	shape: "round" | "rectangular";
	capacity: number;
	name?: string;
	count: number;
};

type Props = {
	onSubmit: (values: AddTableValues) => void;
	isPending?: boolean;
	label?: string;
};

const CAPACITY_CHIPS = [5, 6, 7, 8, 10, 12];

export function AddTablePopover({ onSubmit, isPending, label }: Props) {
	const [open, setOpen] = useState(false);
	const [shape, setShape] = useState<"round" | "rectangular">("round");
	const [capacity, setCapacity] = useState(10);
	const [name, setName] = useState("");
	const [count, setCount] = useState(1);
	const nameId = useId();
	const capacityId = useId();
	const countId = useId();
	const shapeName = useId();

	const valid =
		Number.isInteger(capacity) &&
		capacity >= SEATING_MIN_CAPACITY &&
		capacity <= SEATING_MAX_CAPACITY &&
		count >= 1 &&
		count <= SEATING_MAX_TABLES_PER_BATCH;

	return (
		<Popover onOpenChange={setOpen} open={open}>
			<PopoverTrigger asChild>
				<Button type="button">
					<PlusIcon /> {label ?? "Agregar mesa"}
				</Button>
			</PopoverTrigger>
			<PopoverContent align="start" className="w-80 space-y-3">
				{/* Shape is chosen explicitly and is never inferred from capacity. */}
				<fieldset className="space-y-1.5">
					<legend className="font-semibold text-xs">Forma</legend>
					<div className="flex gap-1.5">
						{(
							[
								["round", "Redonda"],
								["rectangular", "Rectangular"],
							] as const
						).map(([value, text]) => (
							<label
								className={cn(
									"flex-1 cursor-pointer rounded-lg border px-2 py-1.5 text-center text-xs",
									shape === value
										? "border-foreground bg-foreground text-background"
										: "border-border",
								)}
								key={value}
							>
								<input
									checked={shape === value}
									className="sr-only"
									name={shapeName}
									onChange={() => setShape(value)}
									type="radio"
									value={value}
								/>
								{text}
							</label>
						))}
					</div>
				</fieldset>

				<div className="space-y-1.5">
					<Label htmlFor={capacityId}>Capacidad</Label>
					<div className="flex flex-wrap gap-1.5">
						{CAPACITY_CHIPS.map((value) => (
							<button
								className={cn(
									"rounded-full border px-2.5 py-1 font-mono text-xs",
									capacity === value
										? "border-foreground bg-foreground text-background"
										: "border-border",
								)}
								key={value}
								onClick={() => setCapacity(value)}
								type="button"
							>
								{value}
							</button>
						))}
					</div>
					<Input
						id={capacityId}
						max={SEATING_MAX_CAPACITY}
						min={SEATING_MIN_CAPACITY}
						onChange={(event) => setCapacity(Number(event.target.value))}
						type="number"
						value={capacity}
					/>
				</div>

				<div className="space-y-1.5">
					<Label htmlFor={nameId}>Nombre (opcional)</Label>
					<Input
						id={nameId}
						onChange={(event) => setName(event.target.value)}
						placeholder="Mesa principal"
						value={name}
					/>
				</div>

				<div className="space-y-1.5">
					<Label htmlFor={countId}>¿Cuántas iguales?</Label>
					<Input
						id={countId}
						max={SEATING_MAX_TABLES_PER_BATCH}
						min={1}
						onChange={(event) => setCount(Number(event.target.value))}
						type="number"
						value={count}
					/>
				</div>

				<Button
					className="w-full"
					disabled={!valid || isPending}
					onClick={() => {
						onSubmit({
							shape,
							capacity,
							count,
							...(name.trim() ? { name: name.trim() } : {}),
						});
						setOpen(false);
						setName("");
						setCount(1);
					}}
					type="button"
				>
					{count > 1 ? `Agregar ${count} mesas` : "Agregar mesa"}
				</Button>
			</PopoverContent>
		</Popover>
	);
}
