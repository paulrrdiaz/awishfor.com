import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthHeading, AuthShell } from "@/components/shared/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { db } from "@/server/db";
import {
	type ClaimDatabase,
	claimInvitationByToken,
	getInvitationPreview,
	type InvitationPreviewDatabase,
} from "@/server/services/invitation-claim.service";
import { getOrCreateLocalUserId } from "@/server/services/local-user.service";

type InvitationStatus = "not_found" | "expired";

function InvitationStatusMessage({ status }: { status: InvitationStatus }) {
	const copy =
		status === "expired"
			? {
					heading: "Este enlace expiró",
					body: "Pide a quien te invitó que te comparta la lista de nuevo.",
				}
			: {
					heading: "Este enlace ya no es válido",
					body: "Puede que ya se haya usado o que no exista. Si crees que es un error, pide a quien te invitó que te comparta la lista de nuevo.",
				};

	return (
		<AuthShell brandVariant="benefits">
			<div className="flex flex-col gap-3">
				<AuthHeading>{copy.heading}</AuthHeading>
				<p className="text-muted-foreground text-sm">{copy.body}</p>
				<Button asChild className="mt-4 w-full rounded-full">
					<Link href="/dashboard">Ir al panel</Link>
				</Button>
			</div>
		</AuthShell>
	);
}

export default async function InvitationTokenPage({
	params,
}: {
	params: Promise<{ token: string }>;
}) {
	const { token } = await params;
	const { userId } = await auth();

	if (userId) {
		const localUserId = await getOrCreateLocalUserId({ db, userId });
		const result = await claimInvitationByToken(
			db as unknown as ClaimDatabase,
			{ token, localUserId },
		);

		if (result.status === "claimed") {
			redirect(`/dashboard/wishlists/${result.wishlistId}/gifts`);
		}

		return <InvitationStatusMessage status={result.status} />;
	}

	const preview = await getInvitationPreview(
		db as unknown as InvitationPreviewDatabase,
		{ token },
	);

	if (preview.status !== "found") {
		return <InvitationStatusMessage status={preview.status} />;
	}

	const redirectUrl = encodeURIComponent(`/invitations/${token}`);

	return (
		<AuthShell brandVariant="benefits">
			<div className="flex flex-col gap-3">
				<AuthHeading>{preview.ownerName} te invitó a colaborar</AuthHeading>
				<p className="text-muted-foreground text-sm">
					Únete a <strong>&ldquo;{preview.wishlistTitle}&rdquo;</strong> para
					ayudar a organizarla: agregar regalos, invitar personas y ver las
					compras registradas.
				</p>
				<Button asChild className="mt-4 w-full rounded-full">
					<Link href={`/sign-up?redirect_url=${redirectUrl}`}>
						Crear cuenta
					</Link>
				</Button>
				<p className="text-center text-muted-foreground text-sm">
					¿Ya tienes cuenta?{" "}
					<Link
						className="font-medium text-accent-foreground underline underline-offset-4"
						href={`/sign-in?redirect_url=${redirectUrl}`}
					>
						Iniciar sesión
					</Link>
				</p>
			</div>
		</AuthShell>
	);
}
