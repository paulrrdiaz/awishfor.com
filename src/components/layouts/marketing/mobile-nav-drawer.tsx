"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

export function MobileNavDrawer({ isSignedIn }: { isSignedIn: boolean }) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const triggerRef = useRef<HTMLButtonElement>(null);
	const titleId = useId();
	const [open, setOpen] = useState(false);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;

		if (open && !dialog.open) dialog.showModal();
		if (!open && dialog.open) dialog.close();
	}, [open]);

	const closeDrawer = () => setOpen(false);

	const handleClose = () => {
		setOpen(false);
		triggerRef.current?.focus({ preventScroll: true });
	};

	return (
		<>
			<button
				aria-controls="marketing-mobile-nav"
				aria-expanded={open}
				aria-haspopup="dialog"
				aria-label="Abrir menú"
				className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--mink)] transition-colors hover:bg-[rgba(23,62,41,0.06)] focus-visible:outline-2 focus-visible:outline-[var(--mink)] focus-visible:outline-offset-2"
				onClick={() => setOpen(true)}
				ref={triggerRef}
				type="button"
			>
				<Menu aria-hidden="true" className="size-5" />
			</button>
			<dialog
				aria-labelledby={titleId}
				className="m-0 ml-auto h-full max-h-none w-[min(22rem,calc(100vw-1.5rem))] border-0 bg-[var(--mbg)] p-0 text-[var(--mink)] shadow-[-18px_0_48px_rgba(2,16,8,.22)] backdrop:bg-[rgba(2,16,8,.54)]"
				id="marketing-mobile-nav"
				onClick={(event) => {
					if (event.target === event.currentTarget) closeDrawer();
				}}
				onClose={handleClose}
				onKeyDown={(event) => {
					if (event.key === "Escape") closeDrawer();
				}}
				ref={dialogRef}
			>
				<div className="flex h-full flex-col px-5 pt-5 pb-7">
					<div className="flex items-center justify-between border-[var(--mline)] border-b pb-4">
						<h2 className="m-serif text-[22px] text-[var(--mink)]" id={titleId}>
							Menú
						</h2>
						<button
							aria-label="Cerrar menú"
							className="inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-[rgba(23,62,41,0.06)] focus-visible:outline-2 focus-visible:outline-[var(--mink)] focus-visible:outline-offset-2"
							onClick={closeDrawer}
							type="button"
						>
							<X aria-hidden="true" className="size-5" />
						</button>
					</div>
					<nav
						aria-label="Navegación móvil"
						className="flex flex-col gap-1 pt-5"
					>
						{/* biome-ignore lint/a11y/useValidAnchor: native hash navigation is preserved; the handler only dismisses the dialog. */}
						<a
							className="flex min-h-11 items-center font-medium text-[15px] text-[var(--mink)] focus-visible:outline-2 focus-visible:outline-[var(--mink)] focus-visible:outline-offset-2"
							href="#como-funciona"
							onClick={closeDrawer}
						>
							Cómo funciona
						</a>
						{/* biome-ignore lint/a11y/useValidAnchor: native hash navigation is preserved; the handler only dismisses the dialog. */}
						<a
							className="flex min-h-11 items-center font-medium text-[15px] text-[var(--mink)] focus-visible:outline-2 focus-visible:outline-[var(--mink)] focus-visible:outline-offset-2"
							href="#ocasiones"
							onClick={closeDrawer}
						>
							Ocasiones
						</a>
						<a
							className="flex min-h-11 items-center font-medium text-[15px] text-[var(--mink)] focus-visible:outline-2 focus-visible:outline-[var(--mink)] focus-visible:outline-offset-2"
							href={isSignedIn ? "/dashboard" : "/sign-in"}
							onClick={closeDrawer}
						>
							{isSignedIn ? "Dashboard" : "Iniciar sesión"}
						</a>
						<a
							className="!w-full m-btn m-btn-lime mt-4 justify-center focus-visible:outline-2 focus-visible:outline-[var(--mink)] focus-visible:outline-offset-2"
							href="/create"
							onClick={closeDrawer}
						>
							Crear mi wishlist
						</a>
					</nav>
				</div>
			</dialog>
		</>
	);
}
