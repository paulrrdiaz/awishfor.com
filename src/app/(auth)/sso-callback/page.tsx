"use client";

import { useClerk, useSignIn, useSignUp } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { resolveRedirectPath } from "@/lib/auth/safe-redirect";

export default function SSOCallbackPage() {
	const clerk = useClerk();
	const { signIn } = useSignIn();
	const { signUp } = useSignUp();
	const router = useRouter();
	const searchParams = useSearchParams();
	const redirectPath = resolveRedirectPath(searchParams.get("redirect_url"));
	const hasRun = useRef(false);

	useEffect(() => {
		void (async () => {
			if (!clerk.loaded || hasRun.current) return;
			hasRun.current = true;

			const navigate = async ({
				session,
				decorateUrl,
			}: {
				session: { currentTask?: unknown } | null;
				decorateUrl: (url: string) => string;
			}) => {
				if (session?.currentTask) return;
				const url = decorateUrl(redirectPath);
				// Hard navigation (not router.push) so the destination is a fresh
				// request that picks up the session cookie Clerk just set — a
				// client-side transition can race ahead of that cookie landing.
				window.location.href = url;
			};

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const signInStatus = signIn?.status as string | null;

			if (signInStatus === "complete") {
				await signIn?.finalize({ navigate });
				return;
			}

			if (signUp?.isTransferable) {
				await signIn?.create({ transfer: true });
				if ((signIn?.status as string | null) === "complete") {
					await signIn?.finalize({ navigate });
					return;
				}
				router.push("/sign-in");
				return;
			}

			if (signIn?.isTransferable) {
				await signUp?.create({ transfer: true });
				if (signUp?.status === "complete") {
					await signUp.finalize({ navigate });
					return;
				}
				router.push("/sign-in");
				return;
			}

			if (signUp?.status === "complete") {
				await signUp.finalize({ navigate });
				return;
			}

			if (
				signIn?.existingSession?.sessionId ??
				signUp?.existingSession?.sessionId
			) {
				const sessionId =
					signIn?.existingSession?.sessionId ??
					signUp?.existingSession?.sessionId;
				await clerk.setActive({ session: sessionId, navigate });
				return;
			}

			router.push("/sign-in");
		})();
	}, [clerk, signIn, signUp, router, redirectPath]);

	return <div id="clerk-captcha" />;
}
