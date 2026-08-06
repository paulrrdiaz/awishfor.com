"use client";

import { XIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHandle,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";

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
	const [isReady, setIsReady] = useState(false);
	const [open, setOpen] = useState(defaultOpen);

	const setTrigger = useCallback((node: HTMLButtonElement | null) => {
		if (!node) return;
		setContainer(node.closest<HTMLElement>(".public-theme") ?? null);
		setIsReady(true);
	}, []);

	if (!showHowItWorks) return null;

	return (
		<Drawer
			container={container}
			onOpenChange={(nextOpen) => setOpen(isReady && nextOpen)}
			open={isReady ? open : false}
		>
			<DrawerTrigger asChild>
				<button className={triggerClassName} ref={setTrigger} type="button">
					Cómo funciona
				</button>
			</DrawerTrigger>
			<DrawerContent
				className="mx-auto max-w-[480px] rounded-t-[24px] border-border bg-popover pb-[env(safe-area-inset-bottom)]"
				overlayClassName="bg-foreground/35 supports-backdrop-filter:backdrop-blur-sm"
				showCloseButton={false}
			>
				<DrawerHandle className="bg-border" />
				<DrawerHeader className="relative px-6 pt-5 pb-2 text-left">
					<DrawerTitle className="font-heading font-semibold text-2xl">
						¿Cómo funciona?
					</DrawerTitle>
					<DrawerDescription className="sr-only">
						Tres pasos para elegir y registrar un regalo.
					</DrawerDescription>
					<DrawerClose asChild>
						<Button
							className="absolute top-3 right-3"
							size="icon-sm"
							type="button"
							variant="ghost"
						>
							<XIcon />
							<span className="sr-only">Cerrar</span>
						</Button>
					</DrawerClose>
				</DrawerHeader>
				<div className="space-y-5 px-6 py-4">
					{DEFAULT_STEPS.map((step) => (
						<div className="flex gap-4" key={step.number}>
							<div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-foreground font-semibold text-background text-sm">
								{step.number}
							</div>
							<div className="pt-0.5">
								<h3 className="font-semibold text-foreground">{step.title}</h3>
								<p className="mt-1 text-muted-foreground text-sm leading-relaxed">
									{step.description}
								</p>
							</div>
						</div>
					))}
				</div>
				<DrawerFooter className="px-6 pt-3 pb-5">
					<DrawerClose asChild>
						<Button
							className="w-full rounded-full bg-foreground text-background hover:bg-foreground/90"
							type="button"
						>
							Entendido
						</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}
