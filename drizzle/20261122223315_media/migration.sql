CREATE TABLE "media" (
	"id" uuid PRIMARY KEY,
	"storage_key" text NOT NULL UNIQUE,
	"status" text DEFAULT 'pending' NOT NULL,
	"original_name" text NOT NULL,
	"content_type" text NOT NULL,
	"byte_size" integer NOT NULL,
	"width" integer,
	"height" integer,
	"alt_text" text,
	"caption" text,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "media_status_created_at_idx" ON "media" ("status","created_at");--> statement-breakpoint
CREATE INDEX "media_tags_idx" ON "media" USING gin ("tags");