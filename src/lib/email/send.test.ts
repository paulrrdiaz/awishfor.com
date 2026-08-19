import { beforeEach, describe, expect, it, vi } from "vitest";
import type { EmailTemplate } from "@/lib/email/types";

const { mockSend, MockResendCtor } = vi.hoisted(() => {
	const mockSend = vi.fn();
	const MockResendCtor = vi.fn().mockImplementation(function (this: {
		emails: { send: typeof mockSend };
	}) {
		this.emails = { send: mockSend };
	});
	return { mockSend, MockResendCtor };
});

vi.mock("resend", () => ({ Resend: MockResendCtor }));

const mockEnv = vi.hoisted(() => ({
	env: {
		NODE_ENV: "test" as "test" | "development" | "production",
		RESEND_API_KEY: undefined as string | undefined,
		EMAIL_FROM: undefined as string | undefined,
		EMAIL_DEV_REDIRECT_TO: undefined as string | undefined,
	},
}));

vi.mock("@/env", () => mockEnv);

const SAMPLE_INPUT = {
	to: "recipient@example.com",
	subject: "Asunto de prueba",
	html: "<p>Hola</p>",
	text: "Hola",
};

describe("sendEmail", () => {
	beforeEach(() => {
		vi.resetModules();
		mockSend.mockReset();
		MockResendCtor.mockClear();
		mockEnv.env.NODE_ENV = "test";
		mockEnv.env.RESEND_API_KEY = undefined;
		mockEnv.env.EMAIL_FROM = undefined;
		mockEnv.env.EMAIL_DEV_REDIRECT_TO = undefined;
	});

	it("returns a skipped/unconfigured result and constructs no client when RESEND_API_KEY is absent", async () => {
		const { sendEmail } = await import("@/lib/email/send");

		const result = await sendEmail(SAMPLE_INPUT);

		expect(result).toEqual({ status: "skipped", reason: "unconfigured" });
		expect(MockResendCtor).not.toHaveBeenCalled();
		expect(mockSend).not.toHaveBeenCalled();
	});

	it("returns a skipped/non-production result and makes no provider call under NODE_ENV=test", async () => {
		mockEnv.env.RESEND_API_KEY = "re_test_key";
		mockEnv.env.EMAIL_FROM = "no-reply@awishfor.com";
		mockEnv.env.NODE_ENV = "test";
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

		const { sendEmail } = await import("@/lib/email/send");
		const result = await sendEmail(SAMPLE_INPUT);

		expect(result).toEqual({ status: "skipped", reason: "non-production" });
		expect(mockSend).not.toHaveBeenCalled();
		expect(logSpy).toHaveBeenCalledWith(
			"[email] skipped (non-production)",
			expect.objectContaining({
				to: SAMPLE_INPUT.to,
				subject: SAMPLE_INPUT.subject,
				html: SAMPLE_INPUT.html,
				text: SAMPLE_INPUT.text,
			}),
		);

		logSpy.mockRestore();
	});

	it("rewrites the recipient to the dev redirect address and preserves the original recipient in the log", async () => {
		mockEnv.env.RESEND_API_KEY = "re_test_key";
		mockEnv.env.EMAIL_FROM = "no-reply@awishfor.com";
		mockEnv.env.NODE_ENV = "test";
		mockEnv.env.EMAIL_DEV_REDIRECT_TO = "dev@example.com";
		mockSend.mockResolvedValue({ data: { id: "email_123" }, error: null });
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

		const { sendEmail } = await import("@/lib/email/send");
		const result = await sendEmail(SAMPLE_INPUT);

		expect(result).toEqual({ status: "sent", id: "email_123" });
		expect(mockSend).toHaveBeenCalledWith(
			expect.objectContaining({ to: "dev@example.com" }),
		);
		expect(logSpy).toHaveBeenCalledWith(
			"[email] redirecting to dev address",
			expect.objectContaining({
				originalTo: SAMPLE_INPUT.to,
				redirectTo: "dev@example.com",
			}),
		);

		logSpy.mockRestore();
	});

	it("returns a failed result when the provider rejects the send", async () => {
		mockEnv.env.RESEND_API_KEY = "re_test_key";
		mockEnv.env.EMAIL_FROM = "no-reply@awishfor.com";
		mockEnv.env.NODE_ENV = "production";
		mockSend.mockResolvedValue({
			data: null,
			error: {
				message: "Invalid `to` field",
				statusCode: 422,
				name: "validation_error",
			},
		});

		const { sendEmail } = await import("@/lib/email/send");
		const result = await sendEmail(SAMPLE_INPUT);

		expect(result).toEqual({ status: "failed", error: "Invalid `to` field" });
	});

	it("returns a failed result rather than throwing when the network call fails", async () => {
		mockEnv.env.RESEND_API_KEY = "re_test_key";
		mockEnv.env.EMAIL_FROM = "no-reply@awishfor.com";
		mockEnv.env.NODE_ENV = "production";
		mockSend.mockRejectedValue(new Error("fetch failed"));

		const { sendEmail } = await import("@/lib/email/send");

		await expect(sendEmail(SAMPLE_INPUT)).resolves.toEqual({
			status: "failed",
			error: "fetch failed",
		});
	});
});

describe("email template contract", () => {
	it("produces a non-empty subject, HTML, and text, with the HTML's action URL preserved in the text", () => {
		const actionUrl = "https://awishfor.com/w/invite/abc123";
		const sampleTemplate: EmailTemplate<{ url: string }> = ({ url }) => ({
			subject: "Te invitaron a colaborar",
			html: `<p>Te invitaron a colaborar. <a href="${url}">Ver invitación</a></p>`,
			text: `Te invitaron a colaborar. Abre este enlace: ${url}`,
		});

		const content = sampleTemplate({ url: actionUrl });

		expect(content.subject).not.toHaveLength(0);
		expect(content.html).not.toHaveLength(0);
		expect(content.text).not.toHaveLength(0);
		expect(content.html).toContain(actionUrl);
		expect(content.text).toContain(actionUrl);
	});
});
