"use client";

import { MessageCircleIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
	guestWhatsAppMessage,
	SHARE_PURPOSE_LABELS,
	type SharePurpose,
	toGuestWhatsAppShareUrl,
} from "@/lib/wishlist/share";

const PURPOSES: SharePurpose[] = ["invitation", "reminder", "thanks"];

type Props = {
	guestName: string;
	inviteUrl: string;
	eventType: string;
	initialPurpose: SharePurpose;
};

export function ShareGuestMessage({
	guestName,
	inviteUrl,
	eventType,
	initialPurpose,
}: Props) {
	const [purpose, setPurpose] = useState<SharePurpose>(initialPurpose);
	const message = guestWhatsAppMessage({
		purpose,
		eventType,
		guestName,
		inviteUrl,
	});
	const whatsAppUrl = toGuestWhatsAppShareUrl({
		purpose,
		eventType,
		guestName,
		inviteUrl,
	});

	return (
		<>
			<section className="space-y-2">
				<p className="text-muted-foreground text-xs">Para {guestName}</p>
				<div className="flex gap-1.5">
					{PURPOSES.map((option) => (
						<button
							className={cn(
								"rounded-full border px-3 py-1.5 font-medium text-sm",
								purpose === option
									? "border-primary bg-primary/10 text-foreground"
									: "border-border text-muted-foreground",
							)}
							key={option}
							onClick={() => setPurpose(option)}
							type="button"
						>
							{SHARE_PURPOSE_LABELS[option]}
						</button>
					))}
				</div>
			</section>

			<section className="rounded-2xl border border-border bg-card p-4">
				<p className="mb-2 text-muted-foreground text-xs">Mensaje</p>
				<p className="whitespace-pre-wrap text-sm">{message}</p>
			</section>

			<Button asChild className="w-full" type="button">
				<a href={whatsAppUrl} rel="noreferrer" target="_blank">
					<MessageCircleIcon /> Enviar por WhatsApp
				</a>
			</Button>
		</>
	);
}
