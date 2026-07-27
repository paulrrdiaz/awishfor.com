import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { ForgotPasswordForm } from "@/components/features/auth/forgot-password-form";
import { AuthHeading, AuthShell } from "@/components/shared/auth/auth-shell";

export default function ForgotPasswordPage() {
	return (
		<AuthShell>
			<div className="mb-8 flex flex-col gap-3">
				<Link
					className="flex w-fit items-center gap-1 text-muted-foreground text-sm hover:text-foreground"
					href="/sign-in"
				>
					<ChevronLeft className="size-4" />
					Volver a iniciar sesión
				</Link>
				<AuthHeading>¿Olvidaste tu contraseña?</AuthHeading>
				<p className="text-muted-foreground text-sm">
					Ingresa tu correo y te enviaremos un código para restablecerla.
				</p>
			</div>

			<Suspense>
				<ForgotPasswordForm />
			</Suspense>
		</AuthShell>
	);
}
