"use client";

import { useSignIn } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { resolveRedirectPath } from "@/lib/auth/safe-redirect";
import { GoogleButton } from "./google-button";
import { OutlookButton } from "./outlook-button";
import { type SignInValues, signInSchema } from "./schemas";

export function SignInForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const redirectPath = resolveRedirectPath(searchParams.get("redirect_url"));
	const forgotPasswordHref = searchParams.get("redirect_url")
		? `/forgot-password?redirect_url=${encodeURIComponent(redirectPath)}`
		: "/forgot-password";
	const { signIn, fetchStatus } = useSignIn();
	const [clerkError, setClerkError] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();
	const [isOutlookPending, startOutlookTransition] = useTransition();
	// Visual only — there's no remember-me/session-length param wired to the
	// Clerk sign-in call today.
	const [rememberMe, setRememberMe] = useState(true);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<SignInValues>({
		resolver: zodResolver(signInSchema),
	});

	async function onSubmit(values: SignInValues) {
		setClerkError(null);
		try {
			const { error } = await signIn.password({
				emailAddress: values.email,
				password: values.password,
			});
			if (error) {
				if (error.code === "session_exists") {
					router.replace(redirectPath);
					return;
				}
				setClerkError(
					error.longMessage ?? "Algo salió mal. Inténtalo de nuevo.",
				);
				return;
			}
			if (signIn.status === "complete") {
				await signIn.finalize();
				router.push(redirectPath);
			}
		} catch {
			setClerkError("Algo salió mal. Inténtalo de nuevo.");
		}
	}

	async function handleGoogleSignIn() {
		setClerkError(null);
		startTransition(async () => {
			try {
				const { error } = await signIn.sso({
					strategy: "oauth_google",
					redirectUrl: redirectPath,
					redirectCallbackUrl: `/sso-callback?redirect_url=${encodeURIComponent(redirectPath)}`,
				});
				if (error) {
					if (error.code === "session_exists") {
						router.replace(redirectPath);
						return;
					}
					setClerkError(
						error.longMessage ?? "Algo salió mal. Inténtalo de nuevo.",
					);
				}
			} catch {
				setClerkError("Algo salió mal. Inténtalo de nuevo.");
			}
		});
	}

	async function handleOutlookSignIn() {
		setClerkError(null);
		startOutlookTransition(async () => {
			try {
				const { error } = await signIn.sso({
					strategy: "oauth_microsoft",
					redirectUrl: redirectPath,
					redirectCallbackUrl: `/sso-callback?redirect_url=${encodeURIComponent(redirectPath)}`,
				});
				if (error) {
					if (error.code === "session_exists") {
						router.replace(redirectPath);
						return;
					}
					setClerkError(
						error.longMessage ?? "Algo salió mal. Inténtalo de nuevo.",
					);
				}
			} catch {
				setClerkError("Algo salió mal. Inténtalo de nuevo.");
			}
		});
	}

	const isBusy = fetchStatus === "fetching" || isSubmitting;

	return (
		<div className="flex flex-col gap-6">
			<form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
				<div className="flex flex-col gap-1.5">
					<Label htmlFor="email">Correo electrónico</Label>
					<Input
						aria-invalid={!!errors.email}
						autoComplete="email"
						className="rounded-md"
						id="email"
						placeholder="tu@correo.com"
						type="email"
						{...register("email")}
					/>
					{errors.email && (
						<p className="text-destructive text-xs">{errors.email.message}</p>
					)}
				</div>

				<div className="flex flex-col gap-1.5">
					<Label htmlFor="password">Contraseña</Label>
					<PasswordInput
						aria-invalid={!!errors.password}
						autoComplete="current-password"
						className="rounded-md"
						id="password"
						placeholder="••••••••"
						{...register("password")}
					/>
					{errors.password && (
						<p className="text-destructive text-xs">
							{errors.password.message}
						</p>
					)}
				</div>

				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Checkbox
							checked={rememberMe}
							id="remember-me"
							onCheckedChange={(checked) => setRememberMe(checked === true)}
						/>
						<Label className="font-normal text-sm" htmlFor="remember-me">
							Recordarme 30 días
						</Label>
					</div>
					<Link
						className="text-accent-foreground text-xs hover:underline"
						href={forgotPasswordHref}
					>
						¿Olvidaste tu contraseña?
					</Link>
				</div>

				{clerkError && <p className="text-destructive text-sm">{clerkError}</p>}

				{/* Clerk smart CAPTCHA mount point */}
				<div id="clerk-captcha" />

				<Button className="w-full rounded-full" disabled={isBusy} type="submit">
					{isSubmitting ? "Iniciando sesión…" : "Iniciar sesión"}
				</Button>
			</form>

			<div className="relative flex items-center gap-3 text-muted-foreground text-xs before:flex-1 before:border-border before:border-t after:flex-1 after:border-border after:border-t">
				o continúa con
			</div>

			<div className="grid grid-cols-2 gap-3">
				<GoogleButton
					isLoading={isPending}
					label="Google"
					onClick={handleGoogleSignIn}
				/>
				<OutlookButton
					isLoading={isOutlookPending}
					label="Outlook"
					onClick={handleOutlookSignIn}
				/>
			</div>
		</div>
	);
}
