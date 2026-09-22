import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const schema = readFileSync(
	resolve(process.cwd(), "prisma/schema.prisma"),
	"utf8",
);
const migration = readFileSync(
	resolve(
		process.cwd(),
		"prisma/migrations/20260922000000_add_invite_follow_up_state/migration.sql",
	),
	"utf8",
);

describe("invite follow-up persistence schema", () => {
	it("keeps existing invites at the nullable no-copy state", () => {
		expect(schema).toContain("lastFollowUpKind InviteFollowUpKind?");
		expect(schema).toContain("lastFollowUpCopiedAt DateTime?");
		expect(migration).toContain(
			'ADD COLUMN "lastFollowUpKind" "InviteFollowUpKind"',
		);
		expect(migration).toContain(
			'ADD COLUMN "lastFollowUpCopiedAt" TIMESTAMP(3)',
		);
		expect(migration).not.toMatch(/lastFollowUp(?:Kind|CopiedAt).*DEFAULT/i);
	});

	it("requires the follow-up kind and copy time to be paired", () => {
		expect(migration).toContain('CONSTRAINT "Invite_lastFollowUpPair_check"');
		expect(migration).toContain(
			'("lastFollowUpKind" IS NULL) = ("lastFollowUpCopiedAt" IS NULL)',
		);
	});
});
