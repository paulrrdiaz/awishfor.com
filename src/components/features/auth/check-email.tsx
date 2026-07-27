import { Mail } from "lucide-react";
import type { ReactNode } from "react";

interface CheckEmailProps {
	email?: string;
	children: ReactNode;
	onResend?: () => void;
	onChangeEmail?: () => void;
	isResending?: boolean;
	resendMessage?: string;
}

/**
 * Presentational "Revisa tu correo" state. Rendered in place by the sign-up
 * and recovery forms so the active Clerk verification/reset session is kept
 * alive — not a separate route.
 */
export function CheckEmail({
	email,
	children,
	onResend,
	onChangeEmail,
	isResending = false,
	resendMessage,
}: CheckEmailProps) {
	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-3">
				<div className="flex size-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
					<Mail className="size-5" />
				</div>
				<h2 className="font-serif text-foreground text-xl">Revisa tu correo</h2>
				<p className="text-muted-foreground text-sm">
					Enviamos un código a{" "}
					{email ? (
						<span className="font-medium text-foreground">{email}</span>
					) : (
						"tu correo"
					)}
					. Ingrésalo abajo para continuar.
				</p>
			</div>

			{children}

			{(onResend || onChangeEmail) && (
				<div className="flex flex-col gap-1">
					<p className="text-muted-foreground text-sm">
						¿No lo recibiste?{" "}
						{onResend && (
							<button
								className="underline underline-offset-4 hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
								disabled={isResending}
								onClick={onResend}
								type="button"
							>
								{isResending ? "Reenviando…" : "Reenviar"}
							</button>
						)}
						{onResend && onChangeEmail && " · "}
						{onChangeEmail && (
							<button
								className="underline underline-offset-4 hover:text-foreground"
								onClick={onChangeEmail}
								type="button"
							>
								Cambiar correo
							</button>
						)}
					</p>
					{resendMessage && (
						<p className="text-accent-foreground text-xs">{resendMessage}</p>
					)}
				</div>
			)}
		</div>
	);
}
