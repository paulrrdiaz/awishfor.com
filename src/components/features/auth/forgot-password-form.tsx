"use client";

import { useSignIn } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { resolveRedirectPath } from "@/lib/auth/safe-redirect";
import { CheckEmail } from "./check-email";
import {
	type ResetPasswordValues,
	type ResetRequestValues,
	resetPasswordSchema,
	resetRequestSchema,
} from "./schemas";

export function ForgotPasswordForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const redirectPath = resolveRedirectPath(searchParams.get("redirect_url"));
	const { signIn, fetchStatus } = useSignIn();
	const [stage, setStage] = useState<"request" | "reset">("request");
	const [email, setEmail] = useState<string | null>(null);
	const [clerkError, setClerkError] = useState<string | null>(null);
	const [isResending, setIsResending] = useState(false);
	const [resendMessage, setResendMessage] = useState<string | null>(null);

	const requestForm = useForm<ResetRequestValues>({
		resolver: zodResolver(resetRequestSchema),
	});

	const resetForm = useForm<ResetPasswordValues>({
		resolver: zodResolver(resetPasswordSchema),
	});

	async function onRequest(values: ResetRequestValues) {
		setClerkError(null);
		try {
			const { error } = await signIn.create({ identifier: values.email });
			if (error) {
				setClerkError(
					error.longMessage ?? "Algo salió mal. Inténtalo de nuevo.",
				);
				return;
			}
			const { error: sendError } =
				await signIn.resetPasswordEmailCode.sendCode();
			if (sendError) {
				setClerkError(sendError.longMessage ?? "No se pudo enviar el código.");
				return;
			}
			setEmail(values.email);
			setStage("reset");
		} catch {
			setClerkError("Algo salió mal. Inténtalo de nuevo.");
		}
	}

	async function onReset(values: ResetPasswordValues) {
		setClerkError(null);
		const { error: verifyError } =
			await signIn.resetPasswordEmailCode.verifyCode({ code: values.code });
		if (verifyError) {
			setClerkError(
				verifyError.longMessage ?? "Código inválido. Inténtalo de nuevo.",
			);
			return;
		}
		const { error: submitError } =
			await signIn.resetPasswordEmailCode.submitPassword({
				password: values.password,
			});
		if (submitError) {
			setClerkError(
				submitError.longMessage ?? "No se pudo actualizar la contraseña.",
			);
			return;
		}
		if (signIn.status === "complete") {
			await signIn.finalize();
			router.push(redirectPath);
		}
	}

	async function handleResend() {
		setIsResending(true);
		setResendMessage(null);
		setClerkError(null);
		const { error } = await signIn.resetPasswordEmailCode.sendCode();
		setIsResending(false);
		if (error) {
			setClerkError(error.longMessage ?? "No se pudo reenviar el código.");
			return;
		}
		setResendMessage("Te enviamos un nuevo código.");
	}

	const isFetching = fetchStatus === "fetching";

	if (stage === "reset") {
		return (
			<CheckEmail
				email={email ?? undefined}
				isResending={isResending}
				onChangeEmail={() => setStage("request")}
				onResend={handleResend}
				resendMessage={resendMessage ?? undefined}
			>
				<form
					className="flex flex-col gap-4"
					onSubmit={resetForm.handleSubmit(onReset)}
				>
					<div className="flex flex-col gap-1.5">
						<Label htmlFor="code">Código de verificación</Label>
						<Input
							aria-invalid={!!resetForm.formState.errors.code}
							autoComplete="one-time-code"
							className="rounded-md"
							id="code"
							inputMode="numeric"
							placeholder="000000"
							type="text"
							{...resetForm.register("code")}
						/>
						{resetForm.formState.errors.code && (
							<p className="text-destructive text-xs">
								{resetForm.formState.errors.code.message}
							</p>
						)}
					</div>

					<div className="flex flex-col gap-1.5">
						<Label htmlFor="password">Nueva contraseña</Label>
						<PasswordInput
							aria-invalid={!!resetForm.formState.errors.password}
							autoComplete="new-password"
							className="rounded-md"
							id="password"
							placeholder="••••••••"
							{...resetForm.register("password")}
						/>
						{resetForm.formState.errors.password && (
							<p className="text-destructive text-xs">
								{resetForm.formState.errors.password.message}
							</p>
						)}
					</div>

					{clerkError && (
						<p className="text-destructive text-sm">{clerkError}</p>
					)}

					<Button
						className="w-full rounded-full"
						disabled={resetForm.formState.isSubmitting || isFetching}
						type="submit"
					>
						{resetForm.formState.isSubmitting
							? "Actualizando…"
							: "Restablecer contraseña"}
					</Button>
				</form>
			</CheckEmail>
		);
	}

	return (
		<form
			className="flex flex-col gap-4"
			onSubmit={requestForm.handleSubmit(onRequest)}
		>
			<div className="flex flex-col gap-1.5">
				<Label htmlFor="email">Correo electrónico</Label>
				<Input
					aria-invalid={!!requestForm.formState.errors.email}
					autoComplete="email"
					className="rounded-md"
					id="email"
					placeholder="tu@correo.com"
					type="email"
					{...requestForm.register("email")}
				/>
				{requestForm.formState.errors.email && (
					<p className="text-destructive text-xs">
						{requestForm.formState.errors.email.message}
					</p>
				)}
			</div>

			{clerkError && <p className="text-destructive text-sm">{clerkError}</p>}

			{/* Clerk smart CAPTCHA mount point */}
			<div id="clerk-captcha" />

			<Button
				className="w-full rounded-full"
				disabled={requestForm.formState.isSubmitting || isFetching}
				type="submit"
			>
				{requestForm.formState.isSubmitting ? "Enviando…" : "Enviar código"}
			</Button>
		</form>
	);
}
