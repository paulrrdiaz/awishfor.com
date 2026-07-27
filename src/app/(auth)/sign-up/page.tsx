import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import { SignUpForm } from "@/components/features/auth/sign-up-form";
import { AuthHeading, AuthShell } from "@/components/shared/auth/auth-shell";

export default function SignUpPage() {
	return (
		<AuthShell brandVariant="benefits">
			<div className="mb-8 flex flex-col gap-3">
				<Image
					alt="A Wish For"
					className="mx-auto mb-4 size-50"
					height={200}
					src="/assets/logo.svg"
					width={200}
				/>
				<AuthHeading>Crea tu cuenta</AuthHeading>
				<p className="text-muted-foreground text-sm">
					Empieza gratis. Crea wishlists hermosas para tus momentos especiales.
				</p>
			</div>

			<Suspense>
				<SignUpForm />
			</Suspense>

			<p className="mt-8 text-center text-muted-foreground text-sm">
				¿Ya tienes cuenta?{" "}
				<Link
					className="font-medium text-accent-foreground underline underline-offset-4"
					href="/sign-in"
				>
					Iniciar sesión
				</Link>
			</p>
		</AuthShell>
	);
}
