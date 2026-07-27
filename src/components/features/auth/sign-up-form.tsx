"use client";

import { useSignUp } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { resolveRedirectPath } from "@/lib/auth/safe-redirect";
import { CheckEmail } from "./check-email";
import { GoogleButton } from "./google-button";
import { OutlookButton } from "./outlook-button";
import { PasswordStrengthMeter } from "./password-strength-meter";
import {
	type SignUpValues,
	signUpSchema,
	type VerifyEmailValues,
	verifyEmailSchema,
} from "./schemas";

export function SignUpForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const redirectPath = resolveRedirectPath(searchParams.get("redirect_url"));
	const { signUp, errors: clerkSignalErrors, fetchStatus } = useSignUp();
	const [verifying, setVerifying] = useState(false);
	const [clerkError, setClerkError] = useState<string | null>(null);
	const [isGoogleLoading, setIsGoogleLoading] = useState(false);
	const [isOutlookLoading, setIsOutlookLoading] = useState(false);
	const [isResending, setIsResending] = useState(false);
	const [resendMessage, setResendMessage] = useState<string | null>(null);

	useEffect(() => {
		if (!isGoogleLoading && !isOutlookLoading) return;
		const globalErrors = clerkSignalErrors?.global;
		if (!globalErrors?.length) return;
		const msg =
			globalErrors[0]?.longMessage ?? "Algo salió mal. Inténtalo de nuevo.";
		setClerkError(msg);
		setIsGoogleLoading(false);
		setIsOutlookLoading(false);
	}, [clerkSignalErrors, isGoogleLoading, isOutlookLoading]);

	const signUpForm = useForm<SignUpValues>({
		resolver: zodResolver(signUpSchema),
	});
	const passwordValue = signUpForm.watch("password") ?? "";

	const verifyForm = useForm<VerifyEmailValues>({
		resolver: zodResolver(verifyEmailSchema),
	});

	async function onSignUp(values: SignUpValues) {
		setClerkError(null);
		const { error } = await signUp.password({
			emailAddress: values.email,
			password: values.password,
			firstName: values.name,
			legalAccepted: values.acceptedTerms,
		});
		if (error) {
			setClerkError(error.longMessage ?? "Algo salió mal. Inténtalo de nuevo.");
			return;
		}
		const { error: verifyError } = await signUp.verifications.sendEmailCode();
		if (verifyError) {
			setClerkError(
				verifyError.longMessage ??
					"No se pudo enviar el código de verificación.",
			);
			return;
		}
		setVerifying(true);
	}

	async function onVerify(values: VerifyEmailValues) {
		setClerkError(null);
		const { error } = await signUp.verifications.verifyEmailCode({
			code: values.code,
		});
		if (error) {
			setClerkError(
				error.longMessage ?? "Código inválido. Inténtalo de nuevo.",
			);
			return;
		}
		if (signUp.status === "complete") {
			await signUp.finalize();
			router.push(redirectPath);
		}
	}

	async function handleResend() {
		setIsResending(true);
		setResendMessage(null);
		setClerkError(null);
		const { error } = await signUp.verifications.sendEmailCode();
		setIsResending(false);
		if (error) {
			setClerkError(error.longMessage ?? "No se pudo reenviar el código.");
			return;
		}
		setResendMessage("Te enviamos un nuevo código.");
	}

	async function handleGoogleSignUp() {
		setIsGoogleLoading(true);
		setClerkError(null);
		try {
			const { error } = await signUp.sso({
				strategy: "oauth_google",
				redirectUrl: redirectPath,
				redirectCallbackUrl: `/sso-callback?redirect_url=${encodeURIComponent(redirectPath)}`,
			});
			if (error) {
				setClerkError(
					error.longMessage ?? "Algo salió mal. Inténtalo de nuevo.",
				);
				setIsGoogleLoading(false);
			}
		} catch {
			setClerkError("Algo salió mal. Inténtalo de nuevo.");
			setIsGoogleLoading(false);
		}
	}

	async function handleOutlookSignUp() {
		setIsOutlookLoading(true);
		setClerkError(null);
		try {
			const { error } = await signUp.sso({
				strategy: "oauth_microsoft",
				redirectUrl: redirectPath,
				redirectCallbackUrl: `/sso-callback?redirect_url=${encodeURIComponent(redirectPath)}`,
			});
			if (error) {
				setClerkError(
					error.longMessage ?? "Algo salió mal. Inténtalo de nuevo.",
				);
				setIsOutlookLoading(false);
			}
		} catch {
			setClerkError("Algo salió mal. Inténtalo de nuevo.");
			setIsOutlookLoading(false);
		}
	}

	const isFetching = fetchStatus === "fetching";

	if (verifying) {
		return (
			<CheckEmail
				isResending={isResending}
				onResend={handleResend}
				resendMessage={resendMessage ?? undefined}
			>
				<form
					className="flex flex-col gap-4"
					onSubmit={verifyForm.handleSubmit(onVerify)}
				>
					<div className="flex flex-col gap-1.5">
						<Label htmlFor="code">Código de verificación</Label>
						<Input
							aria-invalid={!!verifyForm.formState.errors.code}
							autoComplete="one-time-code"
							className="rounded-md"
							id="code"
							inputMode="numeric"
							placeholder="000000"
							type="text"
							{...verifyForm.register("code")}
						/>
						{verifyForm.formState.errors.code && (
							<p className="text-destructive text-xs">
								{verifyForm.formState.errors.code.message}
							</p>
						)}
					</div>

					{clerkError && (
						<p className="text-destructive text-sm">{clerkError}</p>
					)}

					<Button
						className="w-full rounded-full"
						disabled={verifyForm.formState.isSubmitting || isFetching}
						type="submit"
					>
						{verifyForm.formState.isSubmitting
							? "Verificando…"
							: "Verificar correo"}
					</Button>
				</form>
			</CheckEmail>
		);
	}

	return (
		<div className="flex flex-col gap-6">
			<form
				className="flex flex-col gap-4"
				onSubmit={signUpForm.handleSubmit(onSignUp)}
			>
				<div className="flex flex-col gap-1.5">
					<Label htmlFor="name">Nombre</Label>
					<Input
						aria-invalid={!!signUpForm.formState.errors.name}
						autoComplete="name"
						className="rounded-md"
						id="name"
						placeholder="Daniela Rivas"
						type="text"
						{...signUpForm.register("name")}
					/>
					{signUpForm.formState.errors.name && (
						<p className="text-destructive text-xs">
							{signUpForm.formState.errors.name.message}
						</p>
					)}
				</div>

				<div className="flex flex-col gap-1.5">
					<Label htmlFor="email">Correo electrónico</Label>
					<Input
						aria-invalid={!!signUpForm.formState.errors.email}
						autoComplete="email"
						className="rounded-md"
						id="email"
						placeholder="tu@correo.com"
						type="email"
						{...signUpForm.register("email")}
					/>
					{signUpForm.formState.errors.email && (
						<p className="text-destructive text-xs">
							{signUpForm.formState.errors.email.message}
						</p>
					)}
				</div>

				<div className="flex flex-col gap-1.5">
					<Label htmlFor="password">Contraseña</Label>
					<PasswordInput
						aria-invalid={!!signUpForm.formState.errors.password}
						autoComplete="new-password"
						className="rounded-md"
						id="password"
						placeholder="••••••••"
						{...signUpForm.register("password")}
					/>
					<PasswordStrengthMeter password={passwordValue} />
					{signUpForm.formState.errors.password ? (
						<p className="text-destructive text-xs">
							{signUpForm.formState.errors.password.message}
						</p>
					) : (
						<p className="text-muted-foreground text-xs">
							Usa 8 o más caracteres con letras, números y símbolos.
						</p>
					)}
				</div>

				<Controller
					control={signUpForm.control}
					name="acceptedTerms"
					render={({ field }) => (
						<div className="flex items-start gap-2">
							<Checkbox
								checked={field.value === true}
								className="mt-0.5"
								id="accepted-terms"
								onCheckedChange={(checked) => field.onChange(checked === true)}
							/>
							<Label
								className="block font-normal text-sm leading-snug"
								htmlFor="accepted-terms"
							>
								Acepto los{" "}
								<Link
									className="text-accent-foreground underline underline-offset-4"
									href="/terms"
									target="_blank"
								>
									Términos
								</Link>{" "}
								y la{" "}
								<Link
									className="text-accent-foreground underline underline-offset-4"
									href="/privacy"
									target="_blank"
								>
									Política de privacidad
								</Link>
								.
							</Label>
						</div>
					)}
				/>
				{signUpForm.formState.errors.acceptedTerms && (
					<p className="text-destructive text-xs">
						Debes aceptar los Términos y la Política de privacidad.
					</p>
				)}

				{clerkError && <p className="text-destructive text-sm">{clerkError}</p>}

				{/* Clerk smart CAPTCHA mount point */}
				<div id="clerk-captcha" />

				<Button
					className="w-full rounded-full"
					disabled={signUpForm.formState.isSubmitting || isFetching}
					type="submit"
				>
					{signUpForm.formState.isSubmitting
						? "Creando cuenta…"
						: "Crear cuenta"}
				</Button>
			</form>

			<div className="relative flex items-center gap-3 text-muted-foreground text-xs before:flex-1 before:border-border before:border-t after:flex-1 after:border-border after:border-t">
				o regístrate con
			</div>

			<div className="grid grid-cols-2 gap-3">
				<GoogleButton
					isLoading={isGoogleLoading}
					label="Google"
					onClick={handleGoogleSignUp}
				/>
				<OutlookButton
					isLoading={isOutlookLoading}
					label="Outlook"
					onClick={handleOutlookSignUp}
				/>
			</div>
		</div>
	);
}
