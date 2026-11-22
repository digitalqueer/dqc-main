import { sql } from "drizzle-orm";
import {
  boolean,
  char,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";

// <-- Contact requests -->
/** Messages sent from the public contact form, after the Turnstile check. */
export const contactRequestTable = pgTable("contact_requests", {
  id: uuid()
    .primaryKey()
    .$default(() => uuidv7()),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  email: varchar("email_address", { length: 255 }).notNull(),
  comment: text("comment").notNull(),
  communicationsConsent: boolean("communications_consent").default(false),
  /** The Resend contact made when they opted in to communications. */
  communicationsId: char("communications_id", { length: 36 }),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});
export type InsertableContactRequest = typeof contactRequestTable.$inferInsert;
export type SelectableContactRequest = typeof contactRequestTable.$inferSelect;

// <-- Relations -->
export const schema = {
  contactRequestTable,
} as const;
