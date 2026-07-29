import { Badge } from "@/components/ui/badge";

const RSVP_STATUS_META: Record<
	string,
	{ label: string; variant: "published" | "archived" | "draft" }
> = {
	confirmed: { label: "Confirmado", variant: "published" },
	declined: { label: "No asistirá", variant: "archived" },
	pending: { label: "Pendiente", variant: "draft" },
};

type Props = {
	status: string;
};

export function RsvpStatusBadge({ status }: Props) {
	const meta = RSVP_STATUS_META[status] ?? RSVP_STATUS_META.pending;
	return <Badge variant={meta?.variant}>{meta?.label}</Badge>;
}
