"use client";

import { useSignIn } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleButton } from "./google-button";
import { type SignInValues, signInSchema } from "./schemas";

export function SignInForm() {
	const router = useRouter();
	const { signIn, fetchStatus } = useSignIn();
	const [clerkError, setClerkError] = useState<string | null>(null);
	const [isGoogleLoading, setIsGoogleLoading] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<SignInValues>({
		resolver: zodResolver(signInSchema),
	});

	async function onSubmit(values: SignInValues) {
		setClerkError(null);
		const { error } = await signIn.password({
			emailAddress: values.email,
			password: values.password,
		});
		if (error) {
			setClerkError(
				error.longMessage ?? "Something went wrong. Please try again.",
			);
			return;
		}
		if (signIn.status === "complete") {
			await signIn.finalize();
			router.push("/dashboard");
		}
	}

	async function handleGoogleSignIn() {
		setIsGoogleLoading(true);
		const { error } = await signIn.sso({
			strategy: "oauth_google",
			redirectUrl: "/sso-callback",
			redirectCallbackUrl: "/dashboard",
		});
		if (error) {
			setClerkError(
				error.longMessage ?? "Something went wrong. Please try again.",
			);
			setIsGoogleLoading(false);
		}
	}

	const isBusy = fetchStatus === "fetching" || isSubmitting;

	return (
		<div className="flex flex-col gap-6">
			<form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
				<div className="flex flex-col gap-1.5">
					<Label htmlFor="email">Email</Label>
					<Input
						aria-invalid={!!errors.email}
						autoComplete="email"
						id="email"
						placeholder="you@example.com"
						type="email"
						{...register("email")}
					/>
					{errors.email && (
						<p className="text-destructive text-xs">{errors.email.message}</p>
					)}
				</div>

				<div className="flex flex-col gap-1.5">
					<Label htmlFor="password">Password</Label>
					<Input
						aria-invalid={!!errors.password}
						autoComplete="current-password"
						id="password"
						placeholder="••••••••"
						type="password"
						{...register("password")}
					/>
					{errors.password && (
						<p className="text-destructive text-xs">
							{errors.password.message}
						</p>
					)}
				</div>

				{clerkError && <p className="text-destructive text-sm">{clerkError}</p>}

				<Button className="w-full" disabled={isBusy} type="submit">
					{isSubmitting ? "Signing in…" : "Sign in"}
				</Button>
			</form>

			<div className="relative flex items-center gap-3 text-muted-foreground text-xs before:flex-1 before:border-border before:border-t after:flex-1 after:border-border after:border-t">
				or
			</div>

			<GoogleButton isLoading={isGoogleLoading} onClick={handleGoogleSignIn} />
		</div>
	);
}
