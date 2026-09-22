"use client";

import { Check, Copy, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type {
	FollowUpEmphasis,
	InviteFollowUpKind,
} from "@/lib/dashboard/invite-follow-up";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";

type Props = {
	wishlistId: string;
	inviteId: string;
	kind: InviteFollowUpKind;
	label: string;
	message: string;
	emphasis: FollowUpEmphasis;
	copyText?: (text: string) => Promise<void>;
};

export function ContextualFollowUpCopyControl({
	wishlistId,
	inviteId,
	kind,
	label,
	message,
	emphasis,
	copyText = (text) => navigator.clipboard.writeText(text),
}: Props) {
	const [feedback, setFeedback] = useState<
		"idle" | "copied" | "clipboard-error" | "persistence-warning"
	>("idle");
	const utils = api.useUtils();
	const recordCopy = api.invite.recordFollowUpCopy.useMutation({
		onError: () => setFeedback("persistence-warning"),
		onSuccess: async () => {
			await utils.invite.list.invalidate({ wishlistId });
		},
	});

	async function copyFollowUp() {
		try {
			await copyText(message);
			setFeedback("copied");
			recordCopy.mutate({ wishlistId, inviteId, kind });
		} catch {
			setFeedback("clipboard-error");
		}
	}

	const copied = feedback === "copied" || feedback === "persistence-warning";
	return (
		<div className="space-y-1.5">
			<Button
				className={cn("w-full", emphasis === "deemphasized" && "opacity-70")}
				disabled={recordCopy.isPending}
				onClick={copyFollowUp}
				size="sm"
				type="button"
				variant={emphasis === "recommended" ? "default" : "outline"}
			>
				{copied ? <Check /> : <Copy />}
				{copied ? "Mensaje copiado" : label}
			</Button>
			<p aria-live="polite" className="text-muted-foreground text-xs">
				{feedback === "clipboard-error" &&
					"No se pudo copiar el mensaje. Inténtalo otra vez."}
				{feedback === "persistence-warning" && (
					<>
						<TriangleAlert className="mr-1 inline size-3" />
						El mensaje se copió, pero no pudimos guardar este recordatorio.
					</>
				)}
			</p>
		</div>
	);
}
