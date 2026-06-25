import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

export default async function DashboardPage() {
	const { userId } = await auth();

	return (
		<div className="flex min-h-svh flex-col">
			<header className="flex items-center justify-between border-b px-6 py-4">
				<h1 className="font-semibold text-lg">Dashboard</h1>
				<UserButton />
			</header>
			<main className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
				<p className="text-muted-foreground text-sm">
					Signed in as user{" "}
					<span className="font-mono text-foreground">{userId}</span>
				</p>
			</main>
		</div>
	);
}
