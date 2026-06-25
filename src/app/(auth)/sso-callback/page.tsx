"use client";

import { useClerk, useSignIn, useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function SSOCallbackPage() {
	const clerk = useClerk();
	const { signIn } = useSignIn();
	const { signUp } = useSignUp();
	const router = useRouter();
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
				const url = decorateUrl("/dashboard");
				if (url.startsWith("http")) {
					window.location.href = url;
				} else {
					router.push(url);
				}
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
	}, [clerk, signIn, signUp, router]);

	return <div id="clerk-captcha" />;
}
