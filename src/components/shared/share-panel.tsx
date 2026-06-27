import { Copy, MessageCircle, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
	url: string;
	onCopy?: () => void;
	onQrDownload?: () => void;
	whatsAppUrl?: string;
	className?: string;
};

export function SharePanel({
	url,
	onCopy,
	onQrDownload,
	whatsAppUrl,
	className,
}: Props) {
	return (
		<section
			className={cn(
				"rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm",
				className,
			)}
		>
			<p className="text-muted-foreground text-xs uppercase tracking-wide">
				Enlace público
			</p>
			<p className="mt-2 break-all font-medium text-sm">{url}</p>
			<div className="mt-4 grid gap-2 sm:grid-cols-3">
				<button
					className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted"
					onClick={onCopy}
					type="button"
				>
					<Copy className="size-4" />
					Copiar
				</button>
				<a
					className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted"
					href={whatsAppUrl}
					rel="noreferrer"
					target="_blank"
				>
					<MessageCircle className="size-4" />
					WhatsApp
				</a>
				<button
					className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted"
					onClick={onQrDownload}
					type="button"
				>
					<QrCode className="size-4" />
					QR
				</button>
			</div>
		</section>
	);
}
