import { describe, expect, it } from "vitest";
import { wishlistInvitationEmail } from "@/lib/email/templates/wishlist-invitation";

const baseInput = {
	wishlistTitle: "Boda de Ana",
	inviterName: "Ana Torres",
	ctaUrl: "https://example.com/invitations/abc123",
};

describe("wishlistInvitationEmail", () => {
	it("names the wishlist and the inviter in the subject", () => {
		const { subject } = wishlistInvitationEmail({
			...baseInput,
			variant: "new_account",
		});
		expect(subject).toContain("Ana Torres");
		expect(subject).toContain("Boda de Ana");
	});

	it("puts the invitation URL in the plain-text body", () => {
		const { text } = wishlistInvitationEmail({
			...baseInput,
			variant: "new_account",
		});
		expect(text).toContain(baseInput.ctaUrl);
	});

	it("uses the account-creation call to action for the new_account variant", () => {
		const { html, text } = wishlistInvitationEmail({
			...baseInput,
			variant: "new_account",
		});
		expect(text).toContain("Crear cuenta");
		expect(html).toContain("Crear cuenta");
	});

	it("uses the view-list call to action for the existing_account variant", () => {
		const { html, text } = wishlistInvitationEmail({
			...baseInput,
			variant: "existing_account",
		});
		expect(text).toContain("Ver la lista");
		expect(html).toContain("Ver la lista");
	});

	it("escapes HTML-significant characters in user-provided text", () => {
		const { html } = wishlistInvitationEmail({
			wishlistTitle: '<script>alert("x")</script>',
			inviterName: "Ana & Marco",
			ctaUrl: baseInput.ctaUrl,
			variant: "new_account",
		});
		expect(html).not.toContain("<script>");
		expect(html).toContain("&amp;");
	});
});
