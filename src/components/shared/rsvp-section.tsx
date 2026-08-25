"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { usePublicWishlistAnalytics } from "@/components/layouts/public-wishlist/public-wishlist-analytics";
import { PublicWishlistProviders } from "@/components/providers/public-wishlist-providers";
import { CalendarSaveControl } from "@/components/shared/calendar-save-control";
import { Locale } from "@/generated/prisma/enums";
import { formatEventDate } from "@/lib/format/dates";
import { cn } from "@/lib/utils";
import { isRsvpClosed } from "@/lib/wishlist/rsvp-window";
import type {
	PublicGuestExtraGuestViewModel,
	PublicGuestViewModel,
} from "@/server/mappers/view-models";
import { api } from "@/trpc/react";

export type RsvpSectionProps = {
	guest: PublicGuestViewModel | undefined;
	wishlistSlug: string;
	eventTitle: string;
	eventDescription: string;
	inviteUrl: string;
	rsvpDeadline: string | null;
	eventDate: string | null;
	eventTime: string | null;
	endTime?: string | null;
	eventLocation: string | null;
	className?: string;
};

type RsvpFormProps = Omit<RsvpSectionProps, "guest"> & {
	guest: PublicGuestViewModel;
};

type ExtraStatus = "confirmed" | "declined";

const EYEBROW =
	"font-mono text-[8.5px] font-medium uppercase tracking-[0.16em] text-muted-foreground";

function formatShortDate(iso: string): string {
	return new Intl.DateTimeFormat("es-PE", {
		day: "numeric",
		month: "long",
	}).format(new Date(iso));
}

function joinNames(names: string[]): string {
	if (names.length === 0) return "";
	if (names.length === 1) return names[0] ?? "";
	return `${names.slice(0, -1).join(", ")} y ${names.at(-1)}`;
}

function joinPartyNames(
	primaryName: string,
	extraGuests: PublicGuestExtraGuestViewModel[],
): string {
	const named = extraGuests.filter(
		(extra): extra is PublicGuestExtraGuestViewModel & { name: string } =>
			Boolean(extra.name),
	);
	const unnamedCount = extraGuests.length - named.length;
	let joined = joinNames([primaryName, ...named.map((extra) => extra.name)]);
	if (unnamedCount > 0) {
		joined += ` y ${unnamedCount} más`;
	}
	return joined;
}

function extraGuestLabel(
	extra: PublicGuestExtraGuestViewModel,
	index: number,
): string {
	return extra.name ?? `Acompañante ${index + 1}`;
}

function extraGuestInitial(
	extra: PublicGuestExtraGuestViewModel,
	index: number,
): string {
	return extra.name
		? (extra.name.trim()[0]?.toUpperCase() ?? "?")
		: String(index + 1);
}

function initialExtraStatuses(
	guest: PublicGuestViewModel,
): Record<string, ExtraStatus> {
	const result: Record<string, ExtraStatus> = {};
	for (const extra of guest.extraGuests) {
		result[extra.id] = extra.status === "declined" ? "declined" : "confirmed";
	}
	return result;
}

export function RsvpSection(props: RsvpSectionProps) {
	// Public wishlist routes deliberately omit the application-wide provider
	// stack. RSVP is the only always-rendered public surface that uses a tRPC
	// hook, so keep its client context scoped to an invited guest.
	const { guest, ...rsvpProps } = props;
	if (!guest) return null;

	return (
		<PublicWishlistProviders>
			<RsvpForm {...rsvpProps} guest={guest} />
		</PublicWishlistProviders>
	);
}

function RsvpForm({
	guest,
	wishlistSlug,
	eventTitle,
	eventDescription,
	inviteUrl,
	rsvpDeadline,
	eventDate,
	eventTime,
	endTime,
	eventLocation,
	className,
}: RsvpFormProps) {
	const router = useRouter();
	const [mode, setMode] = useState<"auto" | "form">("auto");
	const [primaryChoice, setPrimaryChoice] = useState<
		"confirmed" | "declined" | null
	>(() =>
		guest.status === "confirmed" || guest.status === "declined"
			? guest.status
			: null,
	);
	const [extraStatuses, setExtraStatuses] = useState<
		Record<string, ExtraStatus>
	>(() => initialExtraStatuses(guest));
	const analytics = usePublicWishlistAnalytics();

	const respondMutation = api.invite.respond.useMutation({
		onError: () => {
			toast.error("No pudimos guardar tu respuesta. Intenta de nuevo.");
		},
		onSuccess: (data) => {
			const partySize =
				primaryChoice === "confirmed"
					? 1 +
						guest.extraGuests.filter(
							(extra) => extraStatuses[extra.id] === "confirmed",
						).length
					: 0;
			analytics?.captureRsvp(
				data.status === "confirmed" ? "confirmed" : "declined",
				partySize,
			);
			setMode("auto");
			router.refresh();
			toast.success(
				data.status === "confirmed"
					? "¡Gracias por confirmar!"
					: "Respuesta registrada",
			);
		},
	});

	const closed = isRsvpClosed(eventDate, rsvpDeadline);
	const showForm = !closed && (mode === "form" || guest.status === "pending");
	const isDeclined = guest.status === "declined";

	function openForm() {
		setPrimaryChoice(
			guest.status === "confirmed" || guest.status === "declined"
				? guest.status
				: null,
		);
		setExtraStatuses(initialExtraStatuses(guest));
		setMode("form");
	}

	function handleSubmit() {
		if (primaryChoice === null) return;
		respondMutation.mutate({
			wishlistSlug,
			guestSlug: guest.slug,
			status: primaryChoice,
			extraGuests: guest.extraGuests.map((extra) => ({
				id: extra.id,
				status:
					primaryChoice === "declined"
						? "declined"
						: (extraStatuses[extra.id] ?? "confirmed"),
			})),
		});
	}

	const attendingPartyNames = joinPartyNames(
		guest.primaryName,
		guest.extraGuests.filter((extra) => extra.status === "confirmed"),
	);

	return (
		<section className={cn("mx-auto w-full max-w-4xl px-6 py-10", className)}>
			<div className="flex justify-center">
				<div className="w-full max-w-[420px]">
					{showForm ? (
						<div className="relative rounded-xl border border-border bg-card px-[26px] pt-[26px] pb-[22px] shadow-[0_14px_34px_rgba(80,30,60,.1)]">
							<span className="absolute -top-2 left-[26px] size-4 rounded-full bg-primary shadow-[0_2px_7px_rgba(80,30,60,.26)]" />
							<div className={cn(EYEBROW, "mb-[7px]")}>
								Confirmación de asistencia
							</div>
							<div className="mb-1 font-heading font-semibold text-[25px] text-card-foreground leading-[1.15]">
								¿Nos acompañas?
							</div>
							<div className="mb-5 text-[13px] text-muted-foreground">
								{joinPartyNames(guest.primaryName, guest.extraGuests)}
								{rsvpDeadline && (
									<>
										{" "}
										· confirma antes del{" "}
										<b className="text-card-foreground">
											{formatShortDate(rsvpDeadline)}
										</b>
									</>
								)}
							</div>

							<div className="mb-[18px] flex gap-2.5">
								<button
									className={cn(
										"flex-1 rounded-[10px] px-2.5 py-[13px] font-semibold text-[14px]",
										primaryChoice === "confirmed"
											? "bg-primary text-primary-foreground"
											: "border-[1.5px] border-primary bg-card text-primary-foreground",
									)}
									disabled={respondMutation.isPending}
									onClick={() => setPrimaryChoice("confirmed")}
									type="button"
								>
									Sí, ahí estaré
								</button>
								<button
									className={cn(
										"flex-1 rounded-[10px] px-2.5 py-[13px] text-[14px]",
										primaryChoice === "declined"
											? "border border-foreground/30 bg-muted font-semibold text-foreground"
											: "border border-border bg-card text-muted-foreground",
									)}
									disabled={respondMutation.isPending}
									onClick={() => setPrimaryChoice("declined")}
									type="button"
								>
									No podré ir
								</button>
							</div>

							{primaryChoice !== "declined" && guest.extraGuests.length > 0 && (
								<div className="border-border border-t border-dashed pt-4">
									<div className={cn(EYEBROW, "mb-2.5")}>
										Tu acompañante{guest.extraGuests.length > 1 ? "s" : ""}
									</div>
									<div className="flex flex-col gap-2">
										{guest.extraGuests.map((extra, index) => {
											const status = extraStatuses[extra.id] ?? "confirmed";
											return (
												<div
													className="flex items-center justify-between gap-3 rounded-[10px] bg-muted px-3.5 py-[11px]"
													key={extra.id}
												>
													<div className="flex items-center gap-2.5">
														<span className="flex size-[26px] items-center justify-center rounded-full border border-border bg-card font-heading font-semibold text-[11px] text-muted-foreground">
															{extraGuestInitial(extra, index)}
														</span>
														<span className="text-[13.5px] text-card-foreground">
															{extraGuestLabel(extra, index)}
														</span>
													</div>
													<div className="flex gap-1.5">
														<button
															className={cn(
																"rounded-full px-3 py-1.5 text-[11.5px]",
																status === "confirmed"
																	? "bg-primary font-semibold text-primary-foreground"
																	: "border border-border bg-card text-muted-foreground",
															)}
															disabled={respondMutation.isPending}
															onClick={() =>
																setExtraStatuses((prev) => ({
																	...prev,
																	[extra.id]: "confirmed",
																}))
															}
															type="button"
														>
															Viene
														</button>
														<button
															className={cn(
																"rounded-full px-3 py-1.5 text-[11.5px]",
																status === "declined"
																	? "bg-primary font-semibold text-primary-foreground"
																	: "border border-border bg-card text-muted-foreground",
															)}
															disabled={respondMutation.isPending}
															onClick={() =>
																setExtraStatuses((prev) => ({
																	...prev,
																	[extra.id]: "declined",
																}))
															}
															type="button"
														>
															No viene
														</button>
													</div>
												</div>
											);
										})}
									</div>
								</div>
							)}

							<button
								className="mt-[18px] w-full rounded-full bg-primary p-[13px] font-semibold text-[13.5px] text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
								disabled={primaryChoice === null || respondMutation.isPending}
								onClick={handleSubmit}
								type="button"
							>
								{respondMutation.isPending
									? "Enviando…"
									: "Enviar confirmación"}
							</button>
						</div>
					) : (
						<div className="flex items-center gap-3.5 rounded-xl border border-border bg-card px-5 py-[18px] shadow-[0_10px_26px_rgba(80,30,60,.08)]">
							<span
								className={cn(
									"flex size-[34px] shrink-0 items-center justify-center rounded-full text-[15px]",
									isDeclined
										? "bg-muted text-muted-foreground"
										: "bg-primary text-primary-foreground",
								)}
							>
								{isDeclined ? "✕" : "✓"}
							</span>
							<div className="flex-1">
								<div className="font-heading font-semibold text-[16px] text-card-foreground leading-[1.3]">
									{isDeclined
										? "No podrás asistir"
										: `Confirmado — ${attendingPartyNames}`}
								</div>
								{!isDeclined && eventDate && (
									<div className="mt-0.5 text-[12px] text-muted-foreground">
										Te esperamos el{" "}
										{formatEventDate(eventDate, Locale.es, eventTime, endTime)}
										{eventLocation ? ` · ${eventLocation}` : ""}
									</div>
								)}
							</div>
							{!closed && (
								<button
									className="whitespace-nowrap text-[11.5px] text-accent-foreground underline"
									onClick={openForm}
									type="button"
								>
									Cambiar
								</button>
							)}
						</div>
					)}
				</div>
			</div>
			{guest.status === "confirmed" && eventDate && (
				<CalendarSaveControl
					description={eventDescription}
					endTime={endTime}
					eventDate={eventDate}
					eventTime={eventTime}
					inviteUrl={inviteUrl}
					location={eventLocation}
					title={eventTitle}
				/>
			)}
		</section>
	);
}
