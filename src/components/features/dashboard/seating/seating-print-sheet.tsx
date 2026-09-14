"use client";

import { PrinterIcon } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { hrefFor } from "@/components/layouts/dashboard/wishlist-sections";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SeatingBoardViewModel } from "@/server/mappers/view-models";
import { buildPrintEntries, unseatedPeople } from "./print-entries";
import { printWarning, SEATING_COPY } from "./seating-copy";

type Props = {
	board: SeatingBoardViewModel;
	wishlistId: string;
	eventName: string;
	eventDate: string | null;
	eventLocation: string | null;
	publicUrl: string;
	/** Injected so the sheet renders deterministically in tests. */
	generatedAt?: Date;
};

export function SeatingPrintSheet({
	board,
	wishlistId,
	eventName,
	eventDate,
	eventLocation,
	publicUrl,
	generatedAt,
}: Props) {
	const [columns, setColumns] = useState<2 | 3>(3);
	const [paper, setPaper] = useState<"letter" | "a4">("letter");

	const blocks = useMemo(() => buildPrintEntries(board), [board]);
	const unseated = useMemo(() => unseatedPeople(board), [board]);
	const stamp = useMemo(
		() =>
			new Intl.DateTimeFormat("es-PE", {
				dateStyle: "medium",
				timeStyle: "short",
			}).format(generatedAt ?? new Date()),
		[generatedAt],
	);

	return (
		<div className="bg-white text-[#171717]" data-print-sheet>
			{/* `@page` is a page-context at-rule: it has no inline-style or
			    class-scoped equivalent, so the paper size has to be written into a
			    stylesheet. `paper` is a two-value union, never user input. */}
			<style>{`@page { size: ${paper}; margin: 14mm }`}</style>

			<div className="mx-auto max-w-4xl space-y-4 p-6 print:p-0">
				{unseated.length > 0 ? (
					<section className="space-y-2 rounded-xl border border-[#EBDCAE] bg-[#FBF7EA] p-4 print:hidden">
						<h2 className="font-semibold text-[#7A5E12] text-sm">
							{printWarning(unseated.length)}
						</h2>
						<p className="text-[#7A5E12] text-xs leading-relaxed">
							Si imprimes ahora, estas personas no aparecerán en la hoja y
							llegarán sin saber dónde sentarse:
						</p>
						<ul className="flex flex-wrap gap-1.5">
							{unseated.map((person) => (
								<li
									className="rounded-full border border-[#E3D2A2] bg-white px-2 py-0.5 text-xs"
									key={person.personId}
								>
									{person.isUnnamed
										? SEATING_COPY.chipUnnamed
										: person.displayName}
									<span className="text-muted-foreground">
										{" "}
										· {person.partyLabel}
									</span>
								</li>
							))}
						</ul>
						<div className="flex flex-wrap gap-2 pt-1">
							<Button asChild size="sm" variant="outline">
								<Link href={hrefFor(wishlistId, "seating")}>
									{SEATING_COPY.printGoAssign}
								</Link>
							</Button>
							<Button
								onClick={() => window.print()}
								size="sm"
								type="button"
								variant="ghost"
							>
								{SEATING_COPY.printAnyway}
							</Button>
						</div>
					</section>
				) : null}

				<div className="flex flex-wrap items-center gap-3 print:hidden">
					<label className="flex items-center gap-1.5 text-xs">
						Columnas
						<select
							className="rounded-md border border-border px-1.5 py-1"
							onChange={(event) =>
								setColumns(Number(event.target.value) as 2 | 3)
							}
							value={columns}
						>
							<option value={2}>2</option>
							<option value={3}>3</option>
						</select>
					</label>
					<label className="flex items-center gap-1.5 text-xs">
						Papel
						<select
							className="rounded-md border border-border px-1.5 py-1"
							onChange={(event) =>
								setPaper(event.target.value as "letter" | "a4")
							}
							value={paper}
						>
							<option value="letter">Carta</option>
							<option value="a4">A4</option>
						</select>
					</label>
					<Button
						className="ml-auto"
						onClick={() => window.print()}
						size="sm"
						type="button"
					>
						<PrinterIcon /> Imprimir
					</Button>
				</div>

				{/* Repeated on every printed page via `position: running` fallback:
				    browsers repeat a thead, so the header lives in one. */}
				<table className="w-full">
					<thead className="table-header-group">
						<tr>
							<th className="p-0" scope="col">
								<header className="flex items-start justify-between gap-6 border-[#171717] border-b-2 pb-2 text-left">
									<div>
										<p className="font-mono text-[10px] uppercase tracking-[0.14em]">
											Encuentra tu mesa
										</p>
										<h1 className="font-serif text-[31px] leading-tight">
											{eventName}
										</h1>
									</div>
									<div className="pt-1 text-right font-mono text-[11px] leading-relaxed">
										{eventDate ? <p>{eventDate}</p> : null}
										{eventLocation ? <p>{eventLocation}</p> : null}
										<p>
											{board.totals.seated} personas · {board.totals.tables}{" "}
											mesas
										</p>
									</div>
								</header>
							</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td className="p-0 pt-4">
								<div
									className={cn(
										"gap-x-8",
										columns === 3 ? "columns-3" : "columns-2",
									)}
								>
									{blocks.map((block) => (
										<section
											className="mb-3 break-inside-avoid"
											key={block.letter}
										>
											<h2 className="mb-1 border-[#171717] border-b font-serif text-lg leading-none">
												{block.letter}
											</h2>
											<ul>
												{block.entries.map((entry) => (
													<li
														className={cn(
															"flex items-baseline gap-1 py-[3px] text-[12.5px]",
															entry.isIndented && "pl-3",
														)}
														key={entry.personId}
													>
														<span className="font-semibold">{entry.name}</span>
														<span
															aria-hidden="true"
															className="min-w-4 flex-1 translate-y-[-3px] border-[#171717] border-b border-dotted opacity-40"
														/>
														<span className="font-mono text-[11.5px]">
															{entry.tableLabel}
														</span>
													</li>
												))}
											</ul>
										</section>
									))}
								</div>
							</td>
						</tr>
					</tbody>
				</table>

				<footer className="flex items-baseline justify-between gap-4 border-[#171717] border-t pt-2 font-mono text-[10px]">
					<span>{publicUrl}</span>
					<span>actualizado {stamp}</span>
				</footer>
			</div>
		</div>
	);
}
