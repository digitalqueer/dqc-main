CREATE TABLE "post" (
	"id" uuid PRIMARY KEY,
	"kind" text NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"author" text,
	"description" text,
	"draft_content" jsonb,
	"draft_updated_at" timestamp,
	"published_content" jsonb,
	"excerpt" text,
	"published_at" timestamp,
	"revised_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "post_kind_slug_unique" UNIQUE("kind","slug")
);
--> statement-breakpoint
CREATE TABLE "project" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"description" text,
	"website_link" text,
	"source_link" text,
	"start_date" text NOT NULL,
	"end_date" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_page" (
	"project_id" text PRIMARY KEY,
	"draft_content" jsonb,
	"draft_updated_at" timestamp,
	"published_content" jsonb,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_member" (
	"id" uuid PRIMARY KEY,
	"name" text NOT NULL,
	"pronouns" text,
	"draft_content" jsonb,
	"draft_updated_at" timestamp,
	"published_content" jsonb,
	"published_at" timestamp,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "post_kind_published_at_idx" ON "post" ("kind","published_at");--> statement-breakpoint
ALTER TABLE "project_page" ADD CONSTRAINT "project_page_project_id_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;