"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
	createInviteAction,
	updateInviteAction,
} from "@/app/(protected)/dashboard/wishlists/[id]/guests/actions";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import type { DashboardInviteViewModel } from "@/server/mappers/view-models";
import {
	INVITE_MAX_EXTRA_GUESTS,
	INVITE_PRIMARY_NAME_MAX_LENGTH,
} from "@/server/validators/invite.schema";

const guestSheetSchema = z.object({
	primaryName: z
		.string()
		.trim()
		.min(1, "El nombre es obligatorio")
		.max(INVITE_PRIMARY_NAME_MAX_LENGTH),
	primaryEmail: z.string().trim().optional(),
	primaryPhone: z.string().trim().optional(),
	slug: z.string().trim().optional(),
	extraGuestNames: z.array(z.string()).length(INVITE_MAX_EXTRA_GUESTS),
});

type GuestSheetFormValues = z.infer<typeof guestSheetSchema>;

const BLANK_VALUES: GuestSheetFormValues = {
	primaryName: "",
	primaryEmail: "",
	primaryPhone: "",
	slug: "",
	extraGuestNames: ["", "", "", ""],
};

function valuesFromInvite(
	invite: DashboardInviteViewModel,
): GuestSheetFormValues {
	const names = invite.extraGuests.map((guest) => guest.name ?? "");
	while (names.length < INVITE_MAX_EXTRA_GUESTS) {
		names.push("");
	}
	return {
		primaryName: invite.primaryName,
		primaryEmail: invite.primaryEmail ?? "",
		primaryPhone: invite.primaryPhone ?? "",
		slug: invite.slug,
		extraGuestNames: names.slice(0, INVITE_MAX_EXTRA_GUESTS),
	};
}

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	wishlistId: string;
	invite?: DashboardInviteViewModel | null;
};

export function GuestSheet({ open, onOpenChange, wishlistId, invite }: Props) {
	const mode = invite ? "edit" : "create";
	const [isPending, startTransition] = useTransition();

	const form = useForm<GuestSheetFormValues>({
		resolver: zodResolver(guestSheetSchema),
		defaultValues: BLANK_VALUES,
	});

	useEffect(() => {
		if (!open) return;
		form.reset(invite ? valuesFromInvite(invite) : BLANK_VALUES);
	}, [open, invite, form.reset]);

	function onSubmit(values: GuestSheetFormValues) {
		startTransition(async () => {
			try {
				const extraGuests = values.extraGuestNames
					.map((name) => name.trim())
					.filter((name) => name !== "")
					.map((name) => ({ name }));

				if (mode === "create") {
					await createInviteAction({
						wishlistId,
						primaryName: values.primaryName,
						primaryEmail: values.primaryEmail || undefined,
						primaryPhone: values.primaryPhone || undefined,
						slug: values.slug || undefined,
						extraGuests,
					});
					toast.success("Invitado agregado");
				} else if (invite) {
					await updateInviteAction(wishlistId, {
						inviteId: invite.id,
						primaryName: values.primaryName,
						primaryEmail: values.primaryEmail || undefined,
						primaryPhone: values.primaryPhone || undefined,
						slug: values.slug || undefined,
						extraGuests,
					});
					toast.success("Cambios guardados");
				}
				onOpenChange(false);
			} catch (error) {
				const message =
					error instanceof Error && error.message
						? error.message
						: "No pudimos guardar el invitado. Intenta de nuevo.";
				toast.error(message);
			}
		});
	}

	return (
		<Sheet onOpenChange={onOpenChange} open={open}>
			<SheetContent className="flex w-full flex-col sm:max-w-lg" side="right">
				<SheetHeader>
					<SheetTitle>
						{mode === "create" ? "Agregar invitado" : "Editar invitado"}
					</SheetTitle>
					<SheetDescription>
						Crea un enlace personalizado para que tu invitado confirme su
						asistencia.
					</SheetDescription>
				</SheetHeader>

				<form
					className="flex min-h-0 flex-1 flex-col"
					onSubmit={form.handleSubmit(onSubmit)}
				>
					<div className="flex-1 space-y-5 overflow-y-auto px-4 pb-4">
						<FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<Field className="sm:col-span-2">
								<FieldLabel htmlFor="guest-sheet-name">
									Nombre del invitado{" "}
									<span className="text-destructive">*</span>
								</FieldLabel>
								<Input
									id="guest-sheet-name"
									{...form.register("primaryName")}
								/>
								<FieldError errors={[form.formState.errors.primaryName]} />
							</Field>

							<Field>
								<FieldLabel htmlFor="guest-sheet-email">
									Correo{" "}
									<span className="font-normal text-muted-foreground">
										· opcional
									</span>
								</FieldLabel>
								<Input
									id="guest-sheet-email"
									type="email"
									{...form.register("primaryEmail")}
								/>
							</Field>
							<Field>
								<FieldLabel htmlFor="guest-sheet-phone">
									Teléfono{" "}
									<span className="font-normal text-muted-foreground">
										· opcional
									</span>
								</FieldLabel>
								<Input
									id="guest-sheet-phone"
									{...form.register("primaryPhone")}
								/>
							</Field>

							<Field className="sm:col-span-2">
								<FieldLabel htmlFor="guest-sheet-slug">
									Enlace personalizado
								</FieldLabel>
								<Input
									id="guest-sheet-slug"
									placeholder="Se genera desde el nombre si lo dejas vacío"
									{...form.register("slug")}
								/>
								<FieldDescription>
									/w/&lt;tu-lista&gt;/{form.watch("slug") || "nombre-invitado"}
								</FieldDescription>
							</Field>

							<div className="space-y-3 border-t pt-4 sm:col-span-2">
								<FieldLabel>
									Acompañantes{" "}
									<span className="font-normal text-muted-foreground">
										· hasta {INVITE_MAX_EXTRA_GUESTS}, nombre opcional
									</span>
								</FieldLabel>
								{Array.from({ length: INVITE_MAX_EXTRA_GUESTS }).map(
									(_, index) => (
										<Input
											// biome-ignore lint/suspicious/noArrayIndexKey: fixed-length companion slots
											key={index}
											placeholder={`Acompañante ${index + 1} (opcional)`}
											{...form.register(`extraGuestNames.${index}` as const)}
										/>
									),
								)}
							</div>
						</FieldGroup>
					</div>

					<SheetFooter className="flex-row justify-end border-t">
						<Button
							onClick={() => onOpenChange(false)}
							type="button"
							variant="outline"
						>
							Cancelar
						</Button>
						<Button disabled={isPending} type="submit">
							{isPending ? <Loader2 className="animate-spin" /> : null}
							{mode === "create" ? "Agregar invitado" : "Guardar cambios"}
						</Button>
					</SheetFooter>
				</form>
			</SheetContent>
		</Sheet>
	);
}
