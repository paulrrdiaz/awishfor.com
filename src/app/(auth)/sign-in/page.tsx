import Link from "next/link";

import { SignInForm } from "@/components/features/auth/sign-in-form";

export default function SignInPage() {
	return (
		<div className="flex min-h-svh items-center justify-center p-4">
			<div className="w-full max-w-sm">
				<div className="mb-8 flex flex-col gap-1">
					<h1 className="font-semibold text-2xl tracking-tight">Sign in</h1>
					<p className="text-muted-foreground text-sm">
						Don&apos;t have an account?{" "}
						<Link
							className="text-foreground underline underline-offset-4"
							href="/sign-up"
						>
							Sign up
						</Link>
					</p>
				</div>
				<SignInForm />
			</div>
		</div>
	);
}
