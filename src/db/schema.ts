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
import { createInsertSchema, createSelectSchema } from "drizzle-orm/zod";
import { v7 as uuidv7 } from "uuid";

export const contactRequestTable = pgTable("contact_requests", {
  id: uuid()
    .primaryKey()
    .$default(() => uuidv7()),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  email: varchar("email_address", { length: 255 }).notNull(),
  comment: text("comment").notNull(),
  communicationsConsent: boolean("communications_consent").default(false),
  communicationsId: char("communications_id", { length: 36 }),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});
export type InsertableContactRequest = typeof contactRequestTable.$inferInsert;
export type SelectableContactRequest = typeof contactRequestTable.$inferSelect;
export const contactRequestSelectSchema =
  createSelectSchema(contactRequestTable);
export const contactRequestInsertSchema =
  createInsertSchema(contactRequestTable);
