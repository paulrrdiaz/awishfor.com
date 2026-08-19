import type { EmailContent, EmailTemplate } from "@/lib/email/types";

export type WishlistInvitationVariant = "existing_account" | "new_account";

export type WishlistInvitationEmailInput = {
	wishlistTitle: string;
	inviterName: string;
	ctaUrl: string;
	variant: WishlistInvitationVariant;
};

const CTA_LABEL: Record<WishlistInvitationVariant, string> = {
	existing_account: "Ver la lista",
	new_account: "Crear cuenta",
};

const escapeHtml = (value: string) =>
	value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");

export const wishlistInvitationEmail: EmailTemplate<
	WishlistInvitationEmailInput
> = ({ wishlistTitle, inviterName, ctaUrl, variant }): EmailContent => {
	const subject = `${inviterName} te invitó a colaborar en "${wishlistTitle}"`;
	const ctaLabel = CTA_LABEL[variant];
	const safeTitle = escapeHtml(wishlistTitle);
	const safeInviter = escapeHtml(inviterName);
	const safeUrl = escapeHtml(ctaUrl);

	const html = `<!doctype html>
<html lang="es">
	<body style="margin:0;padding:0;background-color:#f7f7f2;font-family:Arial,Helvetica,sans-serif;">
		<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f7f2;padding:32px 16px;">
			<tr>
				<td align="center">
					<table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e4e4df;">
						<tr>
							<td style="padding:32px 32px 24px 32px;">
								<p style="margin:0 0 8px 0;font-size:13px;color:#7c8494;">A Wish For</p>
								<h1 style="margin:0 0 16px 0;font-size:20px;color:#17213a;">${safeInviter} te invitó a colaborar</h1>
								<p style="margin:0 0 24px 0;font-size:15px;line-height:1.5;color:#404859;">
									${safeInviter} quiere que ayudes a organizar <strong>"${safeTitle}"</strong>. Podrás agregar y editar regalos, invitar a más personas y ver las compras registradas.
								</p>
								<a href="${safeUrl}" style="display:inline-block;background-color:#3c6743;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:15px;font-weight:600;">
									${ctaLabel}
								</a>
								<p style="margin:24px 0 0 0;font-size:12px;line-height:1.5;color:#9aa1ad;">
									Si no esperabas esta invitación, puedes ignorar este correo.
								</p>
							</td>
						</tr>
					</table>
				</td>
			</tr>
		</table>
	</body>
</html>`;

	const text = [
		`${inviterName} te invitó a colaborar en "${wishlistTitle}".`,
		"",
		`${ctaLabel}: ${ctaUrl}`,
		"",
		"Si no esperabas esta invitación, puedes ignorar este correo.",
	].join("\n");

	return { subject, html, text };
};
