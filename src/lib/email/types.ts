export type SendResult =
	| { status: "sent"; id: string }
	| { status: "skipped"; reason: "unconfigured" | "non-production" }
	| { status: "failed"; error: string };

export type EmailContent = {
	subject: string;
	html: string;
	text: string;
};

export type EmailTemplate<Input> = (input: Input) => EmailContent;
