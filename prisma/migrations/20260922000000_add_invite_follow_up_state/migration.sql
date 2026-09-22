CREATE TYPE "InviteFollowUpKind" AS ENUM (
    'invitation',
    'rsvp_reminder',
    'event_14_day',
    'event_7_day',
    'event_1_day'
);

ALTER TABLE "Invite"
ADD COLUMN "lastFollowUpKind" "InviteFollowUpKind",
ADD COLUMN "lastFollowUpCopiedAt" TIMESTAMP(3);

ALTER TABLE "Invite"
ADD CONSTRAINT "Invite_lastFollowUpPair_check"
CHECK (("lastFollowUpKind" IS NULL) = ("lastFollowUpCopiedAt" IS NULL));
