import Link from "next/link";
import { Suspense } from "react";

import { SignUpForm } from "@/components/features/auth/sign-up-form";

export default function SignUpPage() {
	return (
		<div className="flex min-h-svh items-center justify-center p-4">
			<div className="w-full max-w-sm">
				<div className="mb-8 flex flex-col gap-1">
					<h1 className="font-semibold text-2xl tracking-tight">
						Create an account
					</h1>
					<p className="text-muted-foreground text-sm">
						Already have an account?{" "}
						<Link
							className="text-foreground underline underline-offset-4"
							href="/sign-in"
						>
							Sign in
						</Link>
					</p>
				</div>
				<Suspense>
					<SignUpForm />
				</Suspense>
			</div>
		</div>
	);
}
