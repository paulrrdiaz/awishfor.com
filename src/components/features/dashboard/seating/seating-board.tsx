"use client";

import {
	type CollisionDetection,
	closestCenter,
	DndContext,
	type DragEndEvent,
	type DragOverEvent,
	DragOverlay,
	type DragStartEvent,
	KeyboardSensor,
	PointerSensor,
	pointerWithin,
	TouchSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { PrinterIcon } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type {
	SeatingBoardViewModel,
	SeatingPersonViewModel,
} from "@/server/mappers/view-models";
import {
	SEATING_CANVAS_HEIGHT,
	SEATING_CANVAS_WIDTH,
} from "@/server/services/seating.service";
import { api } from "@/trpc/react";
import { AddTablePopover } from "./add-table-popover";
import { CapacityDialog } from "./capacity-dialog";
import { DeleteTableDialog } from "./delete-table-dialog";
import { FloorCanvas } from "./floor-canvas";
import { GuestChip } from "./guest-chip";
import { GuestPanel } from "./guest-panel";
import { MesasEmptyState } from "./mesas-empty-state";
import {
	capacityShortfall,
	deleteToast,
	dropInvalid,
	headerCount,
	SEATING_COPY,
} from "./seating-copy";
import { SEATING_GRID, type TableVisualState } from "./seating-geometry";
import { SeatingMobileView } from "./seating-mobile-view";
import { TableDetailPopover } from "./table-detail-popover";

type Props = {
	wishlistId: string;
	initialBoard: SeatingBoardViewModel;
};

type ActiveDrag =
	| { type: "person"; personId: string }
	| { type: "table"; tableId: string }
	| null;

const snap = (value: number) => Math.round(value / SEATING_GRID) * SEATING_GRID;
const clamp = (value: number, max: number) =>
	Math.max(0, Math.min(Math.round(value), max));

export function SeatingBoard({ wishlistId, initialBoard }: Props) {
	const utils = api.useUtils();
	const { data: serverBoard = initialBoard } = api.seating.board.useQuery(
		{ wishlistId },
		{ initialData: initialBoard },
	);

	// Writes are autosaved per drag, so a round trip must not look like nothing
	// happened. Both maps hold what the user just did while the server catches
	// up; they are folded into `board` below and cleared once the refetch lands.
	const [pendingSeats, setPendingSeats] = useState<Map<string, string | null>>(
		() => new Map(),
	);
	const [pendingMoves, setPendingMoves] = useState<
		Map<string, { x: number; y: number }>
	>(() => new Map());

	const [zoom, setZoom] = useState(1);
	const [snapToGrid, setSnapToGrid] = useState(true);
	const [activeDrag, setActiveDrag] = useState<ActiveDrag>(null);
	const [overTableId, setOverTableId] = useState<string | null>(null);
	const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
	const [capacityTableId, setCapacityTableId] = useState<string | null>(null);
	const [deleteTableId, setDeleteTableId] = useState<string | null>(null);
	const [pickedUpPersonId, setPickedUpPersonId] = useState<string | null>(null);
	const [announcement, setAnnouncement] = useState("");

	const invalidate = useCallback(async () => {
		await Promise.all([
			utils.seating.board.invalidate({ wishlistId }),
			utils.wishlist.overview.invalidate({ wishlistId }),
		]);
	}, [utils, wishlistId]);

	// Every mutation is optimistic-by-refetch: on failure the board query is
	// invalidated, which returns the chip to where the server says it is, and
	// the toast says the change was not saved. There is no Save button.
	const onError = useCallback(
		(error: { message?: string }) => {
			void invalidate();
			toast.error(error.message || SEATING_COPY.saveFailed);
		},
		[invalidate],
	);
	const mutationOptions = { onSuccess: () => void invalidate(), onError };

	const clearPendingSeat = useCallback((personId: string) => {
		setPendingSeats((current) => {
			const next = new Map(current);
			next.delete(personId);
			return next;
		});
	}, []);

	const clearPendingMove = useCallback((tableId: string) => {
		setPendingMoves((current) => {
			const next = new Map(current);
			next.delete(tableId);
			return next;
		});
	}, []);

	const assign = api.seating.assign.useMutation({
		onMutate: ({ personId, tableId }) =>
			setPendingSeats((current) => new Map(current).set(personId, tableId)),
		// Held until the refetch has landed, so the optimistic bubble is replaced
		// by the real one rather than blinking out in between.
		onSuccess: async (_data, { personId }) => {
			await invalidate();
			clearPendingSeat(personId);
		},
		onError: (error, { personId }) => {
			clearPendingSeat(personId);
			onError(error);
		},
	});

	const unassign = api.seating.unassign.useMutation({
		onMutate: ({ personId }) =>
			setPendingSeats((current) => new Map(current).set(personId, null)),
		onSuccess: async (_data, { personId }) => {
			await invalidate();
			clearPendingSeat(personId);
		},
		onError: (error, { personId }) => {
			clearPendingSeat(personId);
			onError(error);
		},
	});

	const moveTable = api.seating.moveTable.useMutation({
		onMutate: ({ tableId, x, y }) =>
			setPendingMoves((current) => new Map(current).set(tableId, { x, y })),
		onSuccess: async (_data, { tableId }) => {
			await invalidate();
			clearPendingMove(tableId);
		},
		onError: (error, { tableId }) => {
			clearPendingMove(tableId);
			onError(error);
		},
	});

	const createTables = api.seating.createTables.useMutation(mutationOptions);
	const updateTable = api.seating.updateTable.useMutation(mutationOptions);
	const deleteTable = api.seating.deleteTable.useMutation(mutationOptions);

	/**
	 * The board the whole editor reads: the server's, with in-flight writes
	 * folded in. Counts, the panel, the progress bar and the seat bubbles all
	 * derive from this, so a drag never leaves two surfaces disagreeing.
	 */
	const board = useMemo((): SeatingBoardViewModel => {
		if (pendingSeats.size === 0 && pendingMoves.size === 0) return serverBoard;

		const people = serverBoard.people.map((person) =>
			pendingSeats.has(person.personId)
				? { ...person, tableId: pendingSeats.get(person.personId) ?? null }
				: person,
		);

		const seatedPerTable = new Map<string, number>();
		for (const person of people) {
			if (person.tableId === null) continue;
			seatedPerTable.set(
				person.tableId,
				(seatedPerTable.get(person.tableId) ?? 0) + 1,
			);
		}

		const tables = serverBoard.tables.map((table) => {
			const move = pendingMoves.get(table.id);
			return {
				...table,
				seated: seatedPerTable.get(table.id) ?? 0,
				...(move ? { x: move.x, y: move.y } : {}),
			};
		});

		const seated = people.filter((person) => person.tableId !== null).length;

		return {
			...serverBoard,
			people,
			tables,
			totals: {
				...serverBoard.totals,
				seated,
				unseated: people.length - seated,
			},
		};
	}, [serverBoard, pendingSeats, pendingMoves]);

	const pendingPersonIds = useMemo(
		() => new Set(pendingSeats.keys()),
		[pendingSeats],
	);
	const savingTableIds = useMemo(
		() => new Set(pendingMoves.keys()),
		[pendingMoves],
	);

	const tablesById = useMemo(
		() => new Map(board.tables.map((table) => [table.id, table])),
		[board.tables],
	);
	const peopleById = useMemo(
		() => new Map(board.people.map((person) => [person.personId, person])),
		[board.people],
	);
	// Built once per board so every consumer — the seat bubbles, the table sheet,
	// the capacity and delete dialogs — reads the same arrays by reference.
	const seatedByTable = useMemo(() => {
		const map = new Map<string, SeatingPersonViewModel[]>();
		for (const person of board.people) {
			if (person.tableId === null) continue;
			const existing = map.get(person.tableId);
			if (existing) existing.push(person);
			else map.set(person.tableId, [person]);
		}
		return map;
	}, [board.people]);

	const seatedAt = useCallback(
		(tableId: string): SeatingPersonViewModel[] =>
			seatedByTable.get(tableId) ?? [],
		[seatedByTable],
	);

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
		useSensor(TouchSensor, {
			activationConstraint: { delay: 160, tolerance: 8 },
		}),
		useSensor(KeyboardSensor),
	);

	// A chip must land *inside* a table; a table only needs a nearest slot.
	const collisionDetection: CollisionDetection = useCallback(
		(args) =>
			activeDrag?.type === "table" ? closestCenter(args) : pointerWithin(args),
		[activeDrag],
	);

	const isFull = useCallback(
		(tableId: string, personId: string | null) => {
			const table = tablesById.get(tableId);
			if (!table) return true;
			if (personId && peopleById.get(personId)?.tableId === tableId) {
				return false;
			}
			return table.seated >= table.capacity;
		},
		[tablesById, peopleById],
	);

	const overIsInvalid =
		activeDrag?.type === "person" &&
		overTableId !== null &&
		isFull(overTableId, activeDrag.personId);

	function handleDragStart(event: DragStartEvent) {
		const data = event.active.data.current as
			| { type: "person"; personId: string }
			| { type: "table"; tableId: string }
			| undefined;
		if (data?.type === "person") {
			setActiveDrag({ type: "person", personId: data.personId });
		} else if (data?.type === "table") {
			setActiveDrag({ type: "table", tableId: data.tableId });
		}
	}

	// Escape mid-drag (and any aborted pointer sequence) fires onDragCancel, not
	// onDragEnd — without this the chip stays stuck in its ghost state.
	function handleDragCancel() {
		setActiveDrag(null);
		setOverTableId(null);
	}

	function handleDragOver(event: DragOverEvent) {
		const data = event.over?.data.current as
			| { type: string; tableId?: string }
			| undefined;
		setOverTableId(data?.type === "table" ? (data.tableId ?? null) : null);
	}

	function handleDragEnd(event: DragEndEvent) {
		const drag = activeDrag;
		const overData = event.over?.data.current as
			| { type: string; tableId?: string }
			| undefined;
		setActiveDrag(null);
		setOverTableId(null);
		if (!drag) return;

		if (drag.type === "table") {
			const table = tablesById.get(drag.tableId);
			if (!table) return;
			// The canvas is `transform: scale(zoom)`, so the raw delta is screen px.
			const rawX = table.x + event.delta.x / zoom;
			const rawY = table.y + event.delta.y / zoom;
			moveTable.mutate({
				wishlistId,
				tableId: table.id,
				x: clamp(snapToGrid ? snap(rawX) : rawX, SEATING_CANVAS_WIDTH),
				y: clamp(snapToGrid ? snap(rawY) : rawY, SEATING_CANVAS_HEIGHT),
			});
			return;
		}

		if (overData?.type === "table" && overData.tableId) {
			// Painted invalid during the drag — releasing changes nothing.
			if (isFull(overData.tableId, drag.personId)) return;
			assign.mutate({
				wishlistId,
				tableId: overData.tableId,
				personId: drag.personId,
			});
			announce(drag.personId, overData.tableId);
			return;
		}

		if (overData?.type === "canvas" || overData?.type === "unassign") {
			if (peopleById.get(drag.personId)?.tableId) {
				unassign.mutate({ wishlistId, personId: drag.personId });
				setAnnouncement(
					`${peopleById.get(drag.personId)?.displayName} volvió a sin mesa asignada`,
				);
			}
		}
	}

	const announce = useCallback(
		(personId: string, tableId: string) => {
			const person = peopleById.get(personId);
			const table = tablesById.get(tableId);
			if (!person || !table) return;
			setAnnouncement(
				`${person.displayName} sentada en ${table.label}, ${table.seated + 1} de ${table.capacity}`,
			);
		},
		[peopleById, tablesById],
	);

	// Keyboard flow: Space picks up, arrows walk the tables that still have a
	// free seat, Space seats, Escape cancels.
	const openTables = useMemo(
		() => board.tables.filter((table) => table.seated < table.capacity),
		[board.tables],
	);
	const [keyboardTableIndex, setKeyboardTableIndex] = useState(0);

	function handleKeyDown(event: React.KeyboardEvent) {
		if (!pickedUpPersonId) return;
		if (event.key === "Escape") {
			setPickedUpPersonId(null);
			setAnnouncement("Movimiento cancelado");
			event.preventDefault();
			return;
		}
		if (event.key === "ArrowRight" || event.key === "ArrowDown") {
			const next = (keyboardTableIndex + 1) % Math.max(1, openTables.length);
			setKeyboardTableIndex(next);
			const table = openTables[next];
			if (table) {
				setAnnouncement(
					`${table.label}, ${table.seated} de ${table.capacity} ocupados`,
				);
			}
			event.preventDefault();
			return;
		}
		if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
			const next =
				(keyboardTableIndex - 1 + Math.max(1, openTables.length)) %
				Math.max(1, openTables.length);
			setKeyboardTableIndex(next);
			const table = openTables[next];
			if (table) {
				setAnnouncement(
					`${table.label}, ${table.seated} de ${table.capacity} ocupados`,
				);
			}
			event.preventDefault();
			return;
		}
		if (event.key === " " || event.key === "Enter") {
			const table = openTables[keyboardTableIndex];
			if (table) {
				assign.mutate({
					wishlistId,
					tableId: table.id,
					personId: pickedUpPersonId,
				});
				announce(pickedUpPersonId, table.id);
			}
			setPickedUpPersonId(null);
			event.preventDefault();
		}
	}

	function handlePickUp(personId: string) {
		setPickedUpPersonId(personId);
		setKeyboardTableIndex(0);
		const table = openTables[0];
		setAnnouncement(
			table
				? `${peopleById.get(personId)?.displayName} tomada. Usa las flechas para elegir mesa. ${table.label} tiene lugares.`
				: "No hay mesas con lugares libres",
		);
	}

	async function handleSeatTogether(inviteId: string) {
		const party = board.people.filter(
			(person) => person.inviteId === inviteId && person.tableId === null,
		);
		const target = openTables[0];
		if (!target) {
			toast.error("No hay mesas con lugares libres");
			return;
		}
		let seated = 0;
		for (const person of party) {
			if (seated >= target.capacity - target.seated) break;
			try {
				await assign.mutateAsync({
					wishlistId,
					tableId: target.id,
					personId: person.personId,
				});
				seated += 1;
			} catch {
				break;
			}
		}
		const leftOver = party.length - seated;
		toast.success(
			leftOver > 0
				? `${seated} en ${target.label}; ${leftOver} no cupieron`
				: `${seated} sentados en ${target.label}`,
		);
	}

	const stateFor = useCallback(
		(tableId: string): TableVisualState => {
			const table = tablesById.get(tableId);
			if (!table) return "open";
			if (activeDrag?.type === "table" && activeDrag.tableId === tableId) {
				return "dragging";
			}
			if (activeDrag?.type === "person" && overTableId === tableId) {
				return isFull(tableId, activeDrag.personId) ? "invalid" : "valid";
			}
			if (selectedTableId === tableId) return "selected";
			if (table.seated >= table.capacity) return "full";
			if (table.seated === 0) return "empty";
			return "open";
		},
		[tablesById, activeDrag, overTableId, selectedTableId, isFull],
	);

	const previewSeatedFor = useCallback(
		(tableId: string) =>
			activeDrag?.type === "person" &&
			overTableId === tableId &&
			!isFull(tableId, activeDrag.personId)
				? (tablesById.get(tableId)?.seated ?? 0) + 1
				: undefined,
		[activeDrag, overTableId, isFull, tablesById],
	);

	const activePerson =
		activeDrag?.type === "person"
			? (peopleById.get(activeDrag.personId) ?? null)
			: null;
	const overTable = overTableId ? tablesById.get(overTableId) : undefined;
	const invalidNotice =
		overIsInvalid && overTable
			? dropInvalid(overTable.label, overTable.capacity)
			: null;

	const shortfall = board.totals.eligiblePeople - board.totals.capacity;
	const capacityTable = capacityTableId
		? (tablesById.get(capacityTableId) ?? null)
		: null;
	const deleteTarget = deleteTableId
		? (tablesById.get(deleteTableId) ?? null)
		: null;

	const addTable = (values: {
		shape: "round" | "rectangular";
		capacity: number;
		name?: string;
		count: number;
	}) => createTables.mutate({ wishlistId, ...values });

	if (board.totals.eligiblePeople === 0) {
		return <MesasEmptyState variant="no-guests" wishlistId={wishlistId} />;
	}

	// The root's `overflow-hidden` is load-bearing, not cosmetic: it makes this a
	// scroll container, whose automatic minimum size is 0. Without it the 1200px
	// logical canvas propagates up as a min-content width and widens the whole
	// dashboard shell, pushing the guest panel off-screen.
	return (
		<div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-hidden p-4 lg:p-7">
			<header className="flex flex-wrap items-start justify-between gap-3">
				<div className="min-w-0">
					<p className="font-mono text-muted-foreground text-xs">
						{headerCount(
							board.totals.tables,
							board.totals.capacity,
							board.totals.seated,
						)}
					</p>
					<p className="max-w-prose text-muted-foreground text-sm">
						{SEATING_COPY.viewSubtitle}
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button asChild size="sm" variant="outline">
						<Link
							href={`/dashboard/wishlists/${wishlistId}/seating/print`}
							prefetch={false}
						>
							<PrinterIcon /> Hoja de mesas
						</Link>
					</Button>
					<div className="hidden md:block">
						<AddTablePopover
							isPending={createTables.isPending}
							onSubmit={addTable}
						/>
					</div>
				</div>
			</header>

			{shortfall > 0 ? (
				<p className="rounded-lg border border-[#EBDCAE] bg-[#FBF7EA] px-3 py-2 text-[#7A5E12] text-xs">
					{capacityShortfall(shortfall)}
				</p>
			) : null}

			{/* Canvas editing is not offered below 768px — a deliberate exception to
			    the product's mobile-first rule, granted by PRD §11. */}
			<div className="md:hidden">
				<SeatingMobileView
					board={board}
					onAddTable={addTable}
					wishlistId={wishlistId}
				/>
			</div>

			<div className="hidden min-h-0 min-w-0 flex-1 overflow-hidden md:block">
				{board.totals.tables === 0 ? (
					<MesasEmptyState
						action={
							<AddTablePopover
								isPending={createTables.isPending}
								label="Agregar mi primera mesa"
								onSubmit={addTable}
							/>
						}
						variant="no-tables"
						wishlistId={wishlistId}
					/>
				) : (
					// biome-ignore lint/a11y/noStaticElementInteractions: keyboard assignment needs a container-level key handler alongside the pointer DnD.
					<div
						className="grid h-full min-h-0 min-w-0 grid-rows-[1fr_auto] gap-3 lg:grid-cols-[minmax(0,1fr)_316px] lg:grid-rows-1"
						onKeyDown={handleKeyDown}
					>
						<DndContext
							collisionDetection={collisionDetection}
							// Stable id, not decorative: without it dnd-kit derives its
							// `DndDescribedBy-*` aria ids from a module-level counter, which
							// differs between the SSR pass and hydration and throws a
							// hydration mismatch on every draggable.
							id="seating-board"
							onDragCancel={handleDragCancel}
							onDragEnd={handleDragEnd}
							onDragOver={handleDragOver}
							onDragStart={handleDragStart}
							sensors={sensors}
						>
							<FloorCanvas
								invalidNotice={invalidNotice}
								onFitToScreen={() => setZoom(0.75)}
								onRemovePerson={(personId) =>
									unassign.mutate({ wishlistId, personId })
								}
								onSelectTable={setSelectedTableId}
								onSnapChange={setSnapToGrid}
								onZoomChange={setZoom}
								pendingPersonIds={pendingPersonIds}
								previewSeatedFor={previewSeatedFor}
								savingTableIds={savingTableIds}
								seatedByTable={seatedByTable}
								snapToGrid={snapToGrid}
								stateFor={stateFor}
								tables={board.tables}
								zoom={zoom}
							/>
							<GuestPanel
								activePersonId={activePerson?.personId ?? null}
								board={board}
								onPickUp={handlePickUp}
								onSeatTogether={handleSeatTogether}
								onUnassign={(personId) =>
									unassign.mutate({ wishlistId, personId })
								}
								pickedUpPersonId={pickedUpPersonId}
								wishlistId={wishlistId}
							/>
							<DragOverlay dropAnimation={null}>
								{activePerson ? (
									<GuestChip
										draggable={false}
										invalidReason={
											overIsInvalid && overTable
												? `${overTable.label} está completa`
												: undefined
										}
										person={activePerson}
										state={overIsInvalid ? "invalid" : "dragging"}
										wishlistId={wishlistId}
									/>
								) : null}
							</DragOverlay>
						</DndContext>
					</div>
				)}
			</div>

			<p aria-live="polite" className="sr-only">
				{announcement}
			</p>

			<TableDetailPopover
				onClose={() => setSelectedTableId(null)}
				onDelete={() => {
					const table = selectedTableId
						? tablesById.get(selectedTableId)
						: undefined;
					if (!table) return;
					if (table.seated === 0) {
						deleteTable.mutate({ wishlistId, tableId: table.id });
						toast.success(deleteToast(table.label, 0));
						setSelectedTableId(null);
						return;
					}
					setDeleteTableId(table.id);
				}}
				onEditCapacity={() => setCapacityTableId(selectedTableId)}
				onRemovePerson={(personId) => unassign.mutate({ wishlistId, personId })}
				onRename={(name) => {
					if (!selectedTableId) return;
					updateTable.mutate({ wishlistId, tableId: selectedTableId, name });
				}}
				seatedPeople={selectedTableId ? seatedAt(selectedTableId) : []}
				table={
					selectedTableId ? (tablesById.get(selectedTableId) ?? null) : null
				}
			/>

			<CapacityDialog
				onClose={() => setCapacityTableId(null)}
				onRemovePerson={(personId) => unassign.mutate({ wishlistId, personId })}
				onSave={(capacity) => {
					if (!capacityTableId) return;
					updateTable.mutate({
						wishlistId,
						tableId: capacityTableId,
						capacity,
					});
					setCapacityTableId(null);
				}}
				seatedPeople={capacityTableId ? seatedAt(capacityTableId) : []}
				table={capacityTable}
			/>

			<DeleteTableDialog
				onClose={() => setDeleteTableId(null)}
				onConfirm={() => {
					if (!deleteTarget) return;
					const seated = seatedAt(deleteTarget.id).length;
					deleteTable.mutate({ wishlistId, tableId: deleteTarget.id });
					toast.success(deleteToast(deleteTarget.label, seated));
					setDeleteTableId(null);
					setSelectedTableId(null);
				}}
				seatedPeople={deleteTarget ? seatedAt(deleteTarget.id) : []}
				table={deleteTarget}
			/>
		</div>
	);
}
