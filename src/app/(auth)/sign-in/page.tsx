import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import { SignInForm } from "@/components/features/auth/sign-in-form";
import { AuthHeading, AuthShell } from "@/components/shared/auth/auth-shell";

export default function SignInPage() {
	return (
		<AuthShell>
			<div className="mb-8 flex flex-col gap-3">
				<Image
					alt="A Wish For"
					className="mx-auto mb-4 size-50"
					height={200}
					src="/assets/logo.svg"
					width={200}
				/>
				<AuthHeading>Bienvenido de nuevo</AuthHeading>
				<p className="text-muted-foreground text-sm">
					Qué bueno verte otra vez. Inicia sesión para gestionar tus wishlists.
				</p>
			</div>

			<Suspense>
				<SignInForm />
			</Suspense>

			<p className="mt-8 text-center text-muted-foreground text-sm">
				¿Aún no tienes cuenta?{" "}
				<Link
					className="font-medium text-accent-foreground underline underline-offset-4"
					href="/sign-up"
				>
					Crear cuenta gratis
				</Link>
			</p>
		</AuthShell>
	);
}
