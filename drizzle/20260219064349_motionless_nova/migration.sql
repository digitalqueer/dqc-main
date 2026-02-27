CREATE TABLE "contact_requests" (
	"id" uuid PRIMARY KEY,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"email_address" varchar(255) NOT NULL,
	"comment" text NOT NULL UNIQUE,
	"communicationsConsent" boolean DEFAULT false
);
