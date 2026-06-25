import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function Home() {
	const { userId } = await auth();

	return (
		<main className="flex min-h-svh flex-col items-center justify-center gap-4 p-8">
			<h1 className="font-semibold text-3xl tracking-tight">Welcome</h1>
			{userId ? (
				<Link
					className="rounded-md bg-foreground px-4 py-2 font-medium text-background text-sm hover:opacity-90"
					href="/dashboard"
				>
					Go to Dashboard →
				</Link>
			) : (
				<Link
					className="rounded-md bg-foreground px-4 py-2 font-medium text-background text-sm hover:opacity-90"
					href="/sign-in"
				>
					Sign in to get started →
				</Link>
			)}
		</main>
	);
}
