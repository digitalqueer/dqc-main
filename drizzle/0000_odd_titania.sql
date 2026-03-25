CREATE TABLE "contact_requests" (
	"id" uuid PRIMARY KEY NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"email_address" varchar(255) NOT NULL,
	"comment" text NOT NULL,
	"communications_consent" boolean DEFAULT false,
	"communications_id" char(36),
	"created_at" timestamp DEFAULT now() NOT NULL
);
