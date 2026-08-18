"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

const DEFAULT_STEPS = [
	{
		number: "1",
		title: "Elige un regalo",
		description: "Explora la lista y elige el regalo que quieres dar.",
	},
	{
		number: "2",
		title: "Márcalo como regalado",
		description: "Haz clic en el botón y confirma tu regalo.",
	},
	{
		number: "3",
		title: "¡Listo!",
		description:
			"Queda reservado para que nadie más lo repita — el anfitrión también lo verá.",
	},
];

type Props = {
	defaultOpen?: boolean;
	showHowItWorks: boolean;
	triggerClassName?: string;
};

export function HowItWorksDrawer({
	defaultOpen = false,
	showHowItWorks,
	triggerClassName,
}: Props) {
	const [container, setContainer] = useState<HTMLElement | null>(null);
	const [open, setOpen] = useState(defaultOpen);
	const triggerRef = useRef<HTMLButtonElement | null>(null);
	const titleId = useId();

	const setTrigger = useCallback((node: HTMLButtonElement | null) => {
		triggerRef.current = node;
		if (node) setContainer(node.closest<HTMLElement>(".public-theme") ?? null);
	}, []);

	const close = useCallback(() => {
		setOpen(false);
		window.setTimeout(() => triggerRef.current?.focus());
	}, []);

	useEffect(() => {
		if (!open) return;
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") close();
		};
		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, [close, open]);

	if (!showHowItWorks) return null;

	return (
		<>
			<button
				className={triggerClassName}
				onClick={() => setOpen(true)}
				ref={setTrigger}
				type="button"
			>
				Cómo funciona
			</button>
			{open &&
				container &&
				createPortal(
					<div className="fixed inset-0 z-50 flex items-end justify-center">
						<button
							aria-label="Cerrar"
							className="absolute inset-0 cursor-default bg-foreground/35 supports-backdrop-filter:backdrop-blur-sm"
							onClick={close}
							type="button"
						/>
						<div
							aria-labelledby={titleId}
							aria-modal="true"
							className="relative w-full max-w-[480px] rounded-t-[24px] border border-border bg-popover pb-[env(safe-area-inset-bottom)] shadow-2xl"
							data-slot="drawer-content"
							role="dialog"
						>
							<div className="mx-auto mt-2.5 h-1.5 w-12 rounded-full bg-border" />
							<div className="relative px-6 pt-5 pb-2 text-left">
								<h2
									className="font-heading font-semibold text-2xl"
									id={titleId}
								>
									¿Cómo funciona?
								</h2>
								<p className="sr-only">
									Tres pasos para elegir y registrar un regalo.
								</p>
								<button
									aria-label="Cerrar"
									className="absolute top-3 right-3 grid size-8 place-items-center rounded-md hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
									onClick={close}
									type="button"
								>
									<span aria-hidden>×</span>
								</button>
							</div>
							<div className="space-y-5 px-6 py-4">
								{DEFAULT_STEPS.map((step) => (
									<div className="flex gap-4" key={step.number}>
										<div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-foreground font-semibold text-background text-sm">
											{step.number}
										</div>
										<div className="pt-0.5">
											<h3 className="font-semibold text-foreground">
												{step.title}
											</h3>
											<p className="mt-1 text-muted-foreground text-sm leading-relaxed">
												{step.description}
											</p>
										</div>
									</div>
								))}
							</div>
							<div className="px-6 pt-3 pb-5">
								<button
									className="w-full rounded-full bg-foreground px-4 py-2.5 font-medium text-background hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
									onClick={close}
									type="button"
								>
									Entendido
								</button>
							</div>
						</div>
					</div>,
					container,
				)}
		</>
	);
}
