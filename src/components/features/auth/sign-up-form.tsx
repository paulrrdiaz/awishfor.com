"use client";

import { useSignUp } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleButton } from "./google-button";
import {
	type SignUpValues,
	signUpSchema,
	type VerifyEmailValues,
	verifyEmailSchema,
} from "./schemas";

export function SignUpForm() {
	const router = useRouter();
	const { signUp, fetchStatus } = useSignUp();
	const [verifying, setVerifying] = useState(false);
	const [clerkError, setClerkError] = useState<string | null>(null);
	const [isGoogleLoading, setIsGoogleLoading] = useState(false);

	const signUpForm = useForm<SignUpValues>({
		resolver: zodResolver(signUpSchema),
	});

	const verifyForm = useForm<VerifyEmailValues>({
		resolver: zodResolver(verifyEmailSchema),
	});

	async function onSignUp(values: SignUpValues) {
		setClerkError(null);
		const { error } = await signUp.password({
			emailAddress: values.email,
			password: values.password,
		});
		if (error) {
			setClerkError(
				error.longMessage ?? "Something went wrong. Please try again.",
			);
			return;
		}
		const { error: verifyError } = await signUp.verifications.sendEmailCode();
		if (verifyError) {
			setClerkError(
				verifyError.longMessage ?? "Failed to send verification code.",
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
			setClerkError(error.longMessage ?? "Invalid code. Please try again.");
			return;
		}
		if (signUp.status === "complete") {
			await signUp.finalize();
			router.push("/");
		}
	}

	async function handleGoogleSignUp() {
		setIsGoogleLoading(true);
		const { error } = await signUp.sso({
			strategy: "oauth_google",
			redirectUrl: "/sso-callback",
			redirectCallbackUrl: "/",
		});
		if (error) {
			setClerkError(
				error.longMessage ?? "Something went wrong. Please try again.",
			);
			setIsGoogleLoading(false);
		}
	}

	const isFetching = fetchStatus === "fetching";

	if (verifying) {
		return (
			<form
				className="flex flex-col gap-4"
				onSubmit={verifyForm.handleSubmit(onVerify)}
			>
				<p className="text-muted-foreground text-sm">
					We sent a 6-digit code to your email. Enter it below to verify your
					account.
				</p>

				<div className="flex flex-col gap-1.5">
					<Label htmlFor="code">Verification code</Label>
					<Input
						aria-invalid={!!verifyForm.formState.errors.code}
						autoComplete="one-time-code"
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

				{clerkError && <p className="text-destructive text-sm">{clerkError}</p>}

				<Button
					className="w-full"
					disabled={verifyForm.formState.isSubmitting || isFetching}
					type="submit"
				>
					{verifyForm.formState.isSubmitting ? "Verifying…" : "Verify email"}
				</Button>
			</form>
		);
	}

	return (
		<div className="flex flex-col gap-6">
			<form
				className="flex flex-col gap-4"
				onSubmit={signUpForm.handleSubmit(onSignUp)}
			>
				<div className="flex flex-col gap-1.5">
					<Label htmlFor="email">Email</Label>
					<Input
						aria-invalid={!!signUpForm.formState.errors.email}
						autoComplete="email"
						id="email"
						placeholder="you@example.com"
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
					<Label htmlFor="password">Password</Label>
					<Input
						aria-invalid={!!signUpForm.formState.errors.password}
						autoComplete="new-password"
						id="password"
						placeholder="••••••••"
						type="password"
						{...signUpForm.register("password")}
					/>
					{signUpForm.formState.errors.password && (
						<p className="text-destructive text-xs">
							{signUpForm.formState.errors.password.message}
						</p>
					)}
				</div>

				{clerkError && <p className="text-destructive text-sm">{clerkError}</p>}

				{/* Clerk smart CAPTCHA mount point */}
				<div id="clerk-captcha" />

				<Button
					className="w-full"
					disabled={signUpForm.formState.isSubmitting || isFetching}
					type="submit"
				>
					{signUpForm.formState.isSubmitting ? "Creating account…" : "Sign up"}
				</Button>
			</form>

			<div className="relative flex items-center gap-3 text-muted-foreground text-xs before:flex-1 before:border-border before:border-t after:flex-1 after:border-border after:border-t">
				or
			</div>

			<GoogleButton
				isLoading={isGoogleLoading}
				label="Sign up with Google"
				onClick={handleGoogleSignUp}
			/>
		</div>
	);
}
