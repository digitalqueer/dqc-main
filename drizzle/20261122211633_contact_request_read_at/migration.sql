ALTER TABLE "contact_requests" ADD COLUMN "read_at" timestamp;--> statement-breakpoint
CREATE INDEX "contact_request_read_at_created_at_idx" ON "contact_requests" ("read_at","created_at");