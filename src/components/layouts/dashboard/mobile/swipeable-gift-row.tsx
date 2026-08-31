"use client";

import { PencilIcon } from "lucide-react";
import {
	type ReactNode,
	type PointerEvent as ReactPointerEvent,
	useRef,
	useState,
} from "react";

const REVEAL_WIDTH = 88;
const OPEN_THRESHOLD = 40;
const EDGE_GUARD = 24;

type DragState = {
	startX: number;
	startY: number;
	baseOffset: number;
	dragging: boolean;
};

type Props = {
	onEdit: () => void;
	children: ReactNode;
};

export function SwipeableGiftRow({ onEdit, children }: Props) {
	const [offset, setOffset] = useState(0);
	const [dragging, setDragging] = useState(false);
	const dragState = useRef<DragState | null>(null);

	function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
		if (event.pointerType !== "touch") return;
		if (offset === 0 && event.clientX < EDGE_GUARD) return;
		dragState.current = {
			startX: event.clientX,
			startY: event.clientY,
			baseOffset: offset,
			dragging: false,
		};
	}

	function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
		const state = dragState.current;
		if (!state) return;
		const deltaX = event.clientX - state.startX;
		const deltaY = event.clientY - state.startY;
		if (!state.dragging) {
			if (Math.abs(deltaX) < 8 && Math.abs(deltaY) < 8) return;
			if (Math.abs(deltaY) > Math.abs(deltaX)) {
				dragState.current = null;
				return;
			}
			state.dragging = true;
			setDragging(true);
		}
		setOffset(Math.min(0, Math.max(-REVEAL_WIDTH, state.baseOffset + deltaX)));
	}

	function endDrag() {
		const state = dragState.current;
		dragState.current = null;
		setDragging(false);
		if (!state?.dragging) return;
		setOffset((current) => (current <= -OPEN_THRESHOLD ? -REVEAL_WIDTH : 0));
	}

	return (
		<div className="relative overflow-hidden rounded-2xl">
			<button
				aria-hidden={offset === 0}
				className="absolute inset-y-0 right-0 hidden w-22 flex-col items-center justify-center gap-1 bg-primary text-primary-foreground text-xs max-md:flex"
				onClick={() => {
					setOffset(0);
					onEdit();
				}}
				tabIndex={offset === 0 ? -1 : 0}
				type="button"
			>
				<PencilIcon className="size-4" />
				Editar
			</button>
			<div
				className={dragging ? "relative" : "relative transition-transform"}
				onPointerCancel={endDrag}
				onPointerDown={handlePointerDown}
				onPointerMove={handlePointerMove}
				onPointerUp={endDrag}
				style={
					offset !== 0 ? { transform: `translateX(${offset}px)` } : undefined
				}
			>
				{children}
			</div>
		</div>
	);
}
