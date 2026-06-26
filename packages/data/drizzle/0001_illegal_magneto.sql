CREATE SCHEMA "tfp";
--> statement-breakpoint
CREATE TYPE "tfp"."billCategory" AS ENUM('Bathrooms', 'Book Ban', 'Digital Censorship', 'Documents', 'Drag', 'Educational Censorship', 'Health Care', 'Sports', 'Student Suppression', 'Trans Erasure', 'Abortion', 'Adoption', 'Aid and Abet', 'Anti-DEI', 'Anti-Discrimination', 'Armed Services', 'Censorship', 'College/Uni', 'Conscience/Religious Freedom', 'Conversion Therapy', 'Cross State', 'Custody', 'Data Collection', 'Deadnaming/Misgendering', 'Device Filter', 'Discrimination - Non Religious', 'Do Not Show', 'Econimic Boycotts', 'Economic Censorship', 'Effective Upon Signing', 'Fiduciary', 'Forced Outing', 'Healthcare Ban', 'Incarcerated', 'Insurance', 'K-12', 'Medical Liability', 'Misc Healthcare', 'Obscenity/Harmful to Minors', 'Other', 'Over 18', 'Panic Defense', 'Parents Rights', 'Pronouns', 'Public Funds', 'Resolution', 'Severability Clause', 'Sex Ed/Teaching Restriction', 'Social Media/Website', 'Online Censorship', 'Schools', 'Surveillance', 'Workplace Pronouns');--> statement-breakpoint
CREATE TYPE "tfp"."billImpact" AS ENUM('Negative', 'Positive');--> statement-breakpoint
CREATE TYPE "tfp"."billLevel" AS ENUM('State', 'National');--> statement-breakpoint
CREATE TYPE "tfp"."billProgress" AS ENUM('Prefiled/Awaiting Introduction', 'Introduced', 'House Committee', 'Senate Committee', 'Joint Committee', 'House Floor', 'Senate Floor', 'Crossed over', 'Final vote', 'Conference Between Chambers', 'To Governor', 'Veto Override Vote', 'Passed', 'Failed', 'Injuncted', 'Struck Down', 'Undone', 'Veto Overturn Vote', 'D.C. Council', 'To Be Introduced', 'To President');--> statement-breakpoint
CREATE TYPE "tfp"."billRepRelation" AS ENUM('Contact', 'Sponsor');--> statement-breakpoint
CREATE TYPE "tfp"."billStatus" AS ENUM('Active', 'Passed', 'Failed', 'Not Anti-Trans in current form');--> statement-breakpoint
CREATE TYPE "tfp"."billVote" AS ENUM('Yea', 'Nay');--> statement-breakpoint
CREATE TYPE "tfp"."importLogStatusEnum" AS ENUM('Successful', 'In Progress', 'Failed');--> statement-breakpoint
CREATE TYPE "tfp"."importLogTableEnum" AS ENUM('State Reps', 'National Reps', 'Negative Bills', 'Positive Bills', 'National Bills');--> statement-breakpoint
CREATE TYPE "tfp"."politicalParty" AS ENUM('Republican', 'Democrat', 'Independent', 'Unaffiliated', 'Libertarian', 'Progressive', 'Unenrolled', 'Vacant');--> statement-breakpoint
CREATE TYPE "tfp"."representativeLevel" AS ENUM('State', 'National');--> statement-breakpoint
CREATE TYPE "tfp"."representativeRole" AS ENUM('House Representative', 'Assembly Member', 'Senator');--> statement-breakpoint
CREATE TABLE "tfp"."billCategories" (
	"id" serial PRIMARY KEY NOT NULL,
	"billId" varchar(17) NOT NULL,
	"category" "tfp"."billCategory" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tfp"."billRepRelations" (
	"id" serial PRIMARY KEY NOT NULL,
	"billId" varchar(17) NOT NULL,
	"repId" varchar(17) NOT NULL,
	"type" "tfp"."billRepRelation" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tfp"."billVotes" (
	"id" serial PRIMARY KEY NOT NULL,
	"billId" varchar(17) NOT NULL,
	"repId" varchar(17) NOT NULL,
	"vote" "tfp"."billVote" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tfp"."bills" (
	"id" varchar(17) PRIMARY KEY NOT NULL,
	"caseName" varchar,
	"status" "tfp"."billStatus",
	"progress" "tfp"."billProgress",
	"impact" "tfp"."billImpact",
	"summary" text,
	"level" "tfp"."billLevel" DEFAULT 'State',
	"state" varchar,
	"billInformationLink" text,
	"legiscanBillId" integer,
	"yeaVoteCount" integer DEFAULT -1,
	"nayVoteCount" integer DEFAULT -1,
	"lastActivityDate" date,
	"introductionDate" date,
	"airtableCreatedAt" timestamp,
	"airtableModifiedAt" timestamp,
	"airtableData" json NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tfp"."importLogs" (
	"id" serial PRIMARY KEY NOT NULL,
	"status" "tfp"."importLogStatusEnum" DEFAULT 'In Progress',
	"errorMessage" text,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tfp"."importRecordLogs" (
	"id" serial PRIMARY KEY NOT NULL,
	"logId" integer,
	"recordId" varchar(17),
	"airtableId" varchar(17),
	"tableName" varchar,
	"importData" json,
	"currentData" json,
	"jsonDiff" text,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tfp"."representatives" (
	"id" varchar(17) PRIMARY KEY NOT NULL,
	"name" varchar,
	"politicalParty" "tfp"."politicalParty",
	"district" varchar,
	"role" "tfp"."representativeRole",
	"level" "tfp"."representativeLevel",
	"state" varchar,
	"reelectionDate" date,
	"legiscanId" integer,
	"followTheMoneyId" integer,
	"email" varchar,
	"facebook" varchar,
	"twitter" varchar,
	"website" text,
	"capitolPhoneNumber" varchar,
	"districtPhoneNumber" varchar,
	"capitolAddress" varchar,
	"districtAddress" varchar,
	"contentSearch" "tsvector" GENERATED ALWAYS AS ((
          setweight(to_tsvector('english', "tfp"."representatives"."name"), 'A') ||
          setweight(to_tsvector('english', "tfp"."representatives"."state"), 'A')
        )) STORED,
	"airtableCreatedAt" timestamp,
	"airtableModifiedAt" timestamp,
	"airtableData" json NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tfp"."billCategories" ADD CONSTRAINT "billCategories_billId_bills_id_fk" FOREIGN KEY ("billId") REFERENCES "tfp"."bills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tfp"."billRepRelations" ADD CONSTRAINT "billRepRelations_billId_bills_id_fk" FOREIGN KEY ("billId") REFERENCES "tfp"."bills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tfp"."billRepRelations" ADD CONSTRAINT "billRepRelations_repId_representatives_id_fk" FOREIGN KEY ("repId") REFERENCES "tfp"."representatives"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tfp"."billVotes" ADD CONSTRAINT "billVotes_billId_bills_id_fk" FOREIGN KEY ("billId") REFERENCES "tfp"."bills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tfp"."billVotes" ADD CONSTRAINT "billVotes_repId_representatives_id_fk" FOREIGN KEY ("repId") REFERENCES "tfp"."representatives"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tfp"."importRecordLogs" ADD CONSTRAINT "importRecordLogs_logId_importLogs_id_fk" FOREIGN KEY ("logId") REFERENCES "tfp"."importLogs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_content_search" ON "tfp"."representatives" USING gin ("contentSearch");