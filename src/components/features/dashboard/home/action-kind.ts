import {
	ArchiveIcon,
	BellIcon,
	ClipboardCheckIcon,
	UserPlusIcon,
} from "lucide-react";
import type { HomeAction } from "@/lib/dashboard/home-actions";
import { formatShortEventDate } from "@/lib/dashboard/home-format";

export const ACTION_KIND_ICON: Record<HomeAction["kind"], typeof BellIcon> = {
	complete_draft: ClipboardCheckIcon,
	review_rsvps: BellIcon,
	invite_guests: UserPlusIcon,
	archive: ArchiveIcon,
};

export function actionRowTitle(action: HomeAction): string {
	switch (action.kind) {
		case "complete_draft":
			return "Completa tu wishlist para publicarla";
		case "review_rsvps":
			return action.pendingCount === 1
				? "Revisa 1 respuesta pendiente"
				: `Revisa ${action.pendingCount} respuestas pendientes`;
		case "invite_guests":
			return "Invita a tus primeros participantes";
		case "archive":
			return "Archiva esta wishlist";
		default:
			return action satisfies never;
	}
}

export function actionRowContext(action: HomeAction): string {
	switch (action.kind) {
		case "complete_draft":
			return "borrador sin publicar";
		case "review_rsvps":
			return "esperando respuestas";
		case "invite_guests":
			return "publicada, todavía sin invitados";
		case "archive":
			return action.eventDate
				? `el evento fue el ${formatShortEventDate(action.eventDate)}`
				: "el evento ya pasó";
		default:
			return action satisfies never;
	}
}
