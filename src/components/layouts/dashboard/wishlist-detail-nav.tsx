"use client";

import { MoreHorizontal, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { startTransition, useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
	{ label: "Resumen", segment: "" },
	{ label: "Regalos", segment: "gifts" },
	{ label: "Invitados", segment: "guests" },
	{ label: "Diseño", segment: "design" },
	{ label: "Configuración", segment: "settings" },
] as const;

type NavItem = (typeof NAV_ITEMS)[number];

type Props = {
	wishlistId: string;
	title: string;
	slug: string;
	status: string;
	publicUrlPath: string;
};

const STATUS_META: Record<string, { label: string; className: string }> = {
	published: {
		label: "Publicada",
		className: "bg-[#dff4df] text-[#3f7c44]",
	},
	draft: {
		label: "Borrador",
		className: "bg-[#eeeeeb] text-[#73736b]",
	},
	archived: {
		label: "Archivada",
		className: "bg-[#f5e2d8] text-[#9a5d48]",
	},
};

function getStatusMeta(status: string) {
	return (
		STATUS_META[status.toLowerCase()] ?? {
			label: status,
			className: "bg-[#eeeeeb] text-[#73736b]",
		}
	);
}

function hrefFor(wishlistId: string, segment: NavItem["segment"]) {
	const base = `/dashboard/wishlists/${wishlistId}`;
	return segment ? `${base}/${segment}` : base;
}

function activeSegmentFromPathname(pathname: string, wishlistId: string) {
	const base = `/dashboard/wishlists/${wishlistId}`;
	if (pathname === base) {
		return "";
	}

	const suffix = pathname.startsWith(`${base}/`)
		? pathname.slice(base.length + 1)
		: "";
	const segment = suffix.split("/")[0] ?? "";
	return NAV_ITEMS.some((item) => item.segment === segment)
		? (segment as NavItem["segment"])
		: "";
}

type WishlistDetailNavViewProps = {
	activeSegment: NavItem["segment"];
	onSegmentChange: (segment: NavItem["segment"]) => void;
	publicUrlPath: string;
	slug: string;
	status: string;
	title: string;
	wishlistId: string;
};

export function WishlistDetailNavView({
	activeSegment,
	onSegmentChange,
	publicUrlPath,
	slug,
	status,
	title,
	wishlistId,
}: WishlistDetailNavViewProps) {
	const statusMeta = getStatusMeta(status);
	const [copyLabel, setCopyLabel] = useState("copiar");
	const triggerRefs = useRef<(HTMLAnchorElement | null)[]>([]);
	const tabsListContainerRef = useRef<HTMLDivElement | null>(null);
	const [indicator, setIndicator] = useState({ left: 0, width: 0 });
	const [measured, setMeasured] = useState(false);
	const activeIndex = NAV_ITEMS.findIndex(
		(item) => item.segment === activeSegment,
	);

	useLayoutEffect(() => {
		const activeTrigger = triggerRefs.current[activeIndex];
		if (!activeTrigger) {
			return;
		}
		setIndicator({
			left: activeTrigger.offsetLeft,
			width: activeTrigger.offsetWidth,
		});
		setMeasured(true);
	}, [activeIndex]);

	useLayoutEffect(() => {
		const container = tabsListContainerRef.current;
		if (!container) {
			return;
		}
		const observer = new ResizeObserver(() => {
			const activeTrigger = triggerRefs.current[activeIndex];
			if (!activeTrigger) {
				return;
			}
			setIndicator({
				left: activeTrigger.offsetLeft,
				width: activeTrigger.offsetWidth,
			});
		});
		observer.observe(container);
		return () => observer.disconnect();
	}, [activeIndex]);

	const handleCopy = async () => {
		const origin =
			typeof window === "undefined"
				? "https://awishfor.com"
				: window.location.origin;
		try {
			await navigator.clipboard.writeText(`${origin}${publicUrlPath}`);
			setCopyLabel("copiado");
		} catch {
			setCopyLabel("error");
		}
	};

	return (
		<nav
			aria-label="Secciones de la wishlist"
			className="border-[#e9e9e2] border-b bg-[#fbfbf8]"
		>
			<div className="border-[#e9e9e2] border-b px-6 py-3">
				<div className="flex items-center justify-between gap-4">
					<p className="min-w-0 truncate text-[#566174] text-xs">
						Mis wishlists /{" "}
						<span className="font-semibold text-[#17213a]">{title}</span>
					</p>
					<Button asChild className="h-9 rounded-full px-5 font-semibold">
						<Link href="/create">
							<Plus />
							Crear wishlist
						</Link>
					</Button>
				</div>
			</div>

			<div className="px-6 py-7 pb-0">
				<div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
					<div className="min-w-0">
						<div className="flex flex-wrap items-center gap-3">
							<h1 className="font-heading font-semibold text-3xl text-[#17213a] tracking-tight">
								{title}
							</h1>
							<span
								className={cn(
									"inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold text-xs",
									statusMeta.className,
								)}
							>
								<span className="size-2 rounded-full bg-current" />
								{statusMeta.label}
							</span>
						</div>
						<div className="mt-5 flex flex-wrap items-center gap-2 text-[#566174] text-sm">
							<span>awishfor.com/w/{slug}</span>
							<button
								className="rounded-md bg-[#ecefea] px-2 py-0.5 font-mono text-[#667085] text-[10px]"
								onClick={handleCopy}
								type="button"
							>
								{copyLabel}
							</button>
						</div>
					</div>

					<div className="flex items-center gap-2">
						<Button
							asChild
							className="h-10 rounded-full border-[#e4e4df] bg-white px-5 font-semibold"
							variant="outline"
						>
							<Link href={publicUrlPath} target="_blank">
								Ver pública
							</Link>
						</Button>
						<Button
							aria-label="Más acciones"
							className="size-10 rounded-full border-[#e4e4df] bg-white"
							size="icon"
							type="button"
							variant="outline"
						>
							<MoreHorizontal />
						</Button>
					</div>
				</div>

				<div className="hidden md:block">
					<Tabs
						onValueChange={(value) =>
							onSegmentChange(value as NavItem["segment"])
						}
						value={activeSegment}
					>
						<div className="relative" ref={tabsListContainerRef}>
							<TabsList className="h-auto gap-8 rounded-none border-none bg-transparent p-0">
								{NAV_ITEMS.map((item, index) => {
									const isActive = activeSegment === item.segment;
									return (
										<TabsTrigger
											asChild
											className={cn(
												"group relative rounded-none border-transparent border-b-2 bg-transparent px-0 pb-3 font-medium text-[#566174] shadow-none outline-none hover:text-[#17213a] focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-[#17213a]/40 focus-visible:ring-offset-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none",
												isActive && "border-[#17213a] text-[#17213a]",
											)}
											key={item.segment || "summary"}
											value={item.segment}
										>
											<Link
												href={hrefFor(wishlistId, item.segment)}
												ref={(node) => {
													triggerRefs.current[index] = node;
												}}
											>
												{item.label}
												{!isActive && (
													<span
														aria-hidden="true"
														className="absolute inset-x-0 bottom-0 h-0.5 bg-[#e4e4df] opacity-0 transition-opacity group-hover:opacity-100"
													/>
												)}
											</Link>
										</TabsTrigger>
									);
								})}
							</TabsList>
							<span
								aria-hidden="true"
								className={cn(
									"pointer-events-none absolute bottom-0 z-10 h-0.5 bg-[#17213a] transition-[left,width,opacity] duration-200 ease-out",
									measured ? "opacity-100" : "opacity-0",
								)}
								style={{ left: indicator.left, width: indicator.width }}
							/>
						</div>
					</Tabs>
				</div>

				<div className="pb-4 md:hidden">
					<label
						className="mb-1.5 block font-medium text-muted-foreground text-xs"
						htmlFor="wishlist-section"
					>
						Sección
					</label>
					<Select
						onValueChange={(value) =>
							onSegmentChange(value as NavItem["segment"])
						}
						value={activeSegment}
					>
						<SelectTrigger className="h-10" id="wishlist-section">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{NAV_ITEMS.map((item) => (
								<SelectItem
									key={item.segment || "summary"}
									value={item.segment}
								>
									{item.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>
		</nav>
	);
}

export function WishlistDetailNav({
	publicUrlPath,
	slug,
	status,
	title,
	wishlistId,
}: Props) {
	const pathname = usePathname();
	const router = useRouter();
	const activeSegment = activeSegmentFromPathname(pathname, wishlistId);

	return (
		<WishlistDetailNavView
			activeSegment={activeSegment}
			onSegmentChange={(nextSegment) => {
				startTransition(() => {
					router.push(hrefFor(wishlistId, nextSegment));
				});
			}}
			publicUrlPath={publicUrlPath}
			slug={slug}
			status={status}
			title={title}
			wishlistId={wishlistId}
		/>
	);
}
