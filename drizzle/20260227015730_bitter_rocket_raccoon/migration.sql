ALTER TABLE "contact_requests" RENAME COLUMN "communicationsConsent" TO "communications_consent";--> statement-breakpoint
ALTER TABLE "contact_requests" ADD COLUMN "communications_id" uuid;