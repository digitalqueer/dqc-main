import { UsStates, usStateValues } from "@/utils/states.js";
import { SQL, sql } from "drizzle-orm";
import {
  customType,
  date,
  index,
  integer,
  json,
  pgSchema,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { createInsertSchema } from "drizzle-zod";

export const tfpSchema = pgSchema("tfp");
export type TfpSchema = typeof tfpSchema;

// Enumerations
export const billStatusEnum = tfpSchema.enum("billStatus", [
  "Active",
  "Passed",
  "Failed",
  "Not Anti-Trans in current form",
]);
export const billImpactEnum = tfpSchema.enum("billImpact", [
  "Negative",
  "Positive",
]);
export const billProgressEnum = tfpSchema.enum("billProgress", [
  "Prefiled/Awaiting Introduction",
  "Introduced",
  "House Committee",
  "Senate Committee",
  "Joint Committee",
  "House Floor",
  "Senate Floor",
  "Crossed over",
  "Final vote",
  "Conference Between Chambers",
  "To Governor",
  "Veto Override Vote",
  "Passed",
  "Failed",
  "Injuncted",
  "Struck Down",
  "Undone",
  // Positive Bills
  "Veto Overturn Vote",
  "D.C. Council",
  "To Be Introduced",
  // National Bills
  "To President",
]);
export const billRepRelationTypeEnum = tfpSchema.enum("billRepRelation", [
  "Contact",
  "Sponsor",
]);
export const billVoteEnum = tfpSchema.enum("billVote", ["Yea", "Nay"]);
export const politicalPartyEnum = tfpSchema.enum("politicalParty", [
  "Republican",
  "Democrat",
  "Independent",
  "Unaffiliated",
  "Libertarian",
  "Progressive",
  "Unenrolled",
  "Vacant",
]);
export const billLevelEnum = tfpSchema.enum("billLevel", ["State", "National"]);
export const representativeLevelEnum = tfpSchema.enum("representativeLevel", [
  "State",
  "National",
]);
export const representativeRoleEnum = tfpSchema.enum("representativeRole", [
  "House Representative",
  "Assembly Member",
  "Senator",
]);
export const billCategoriesEnum = tfpSchema.enum("billCategory", [
  // Primary Categories
  "Bathrooms",
  "Book Ban",
  "Digital Censorship",
  "Documents",
  "Drag",
  "Educational Censorship",
  "Health Care",
  "Sports",
  "Student Suppression",
  "Trans Erasure",
  // Expanded Categories
  "Abortion",
  "Adoption",
  "Aid and Abet",
  "Anti-DEI",
  "Anti-Discrimination",
  "Armed Services",
  "Censorship",
  "College/Uni",
  "Conscience/Religious Freedom",
  "Conversion Therapy",
  "Cross State",
  "Custody",
  "Data Collection",
  "Deadnaming/Misgendering",
  "Device Filter",
  "Discrimination - Non Religious",
  "Do Not Show",
  "Econimic Boycotts",
  "Economic Censorship",
  "Effective Upon Signing",
  "Fiduciary",
  "Forced Outing",
  "Healthcare Ban",
  "Incarcerated",
  "Insurance",
  "K-12",
  "Medical Liability",
  "Misc Healthcare",
  "Obscenity/Harmful to Minors",
  "Other",
  "Over 18",
  "Panic Defense",
  "Parents Rights",
  "Pronouns",
  "Public Funds",
  "Resolution",
  "Severability Clause",
  "Sex Ed/Teaching Restriction",
  "Social Media/Website",
  "Online Censorship",
  "Schools",
  "Surveillance",
  "Workplace Pronouns",
]);
export const importLogStatusEnum = tfpSchema.enum("importLogStatusEnum", [
  "Successful",
  "In Progress",
  "Failed",
]);
export const importLogTableEnum = tfpSchema.enum("importLogTableEnum", [
  "State Reps",
  "National Reps",
  "Negative Bills",
  "Positive Bills",
  "National Bills",
]);

// Columns
export const airtableId = (name: string) => {
  return varchar(name, { length: 17 });
};
const airtableRows = {
  airtableCreatedAt: timestamp("airtableCreatedAt", { mode: "date" }),
  airtableModifiedAt: timestamp("airtableModifiedAt", { mode: "date" }),
  _raw: json("airtableData").notNull(),
};
const tsVector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});

// Tables
export const representatives = tfpSchema.table(
  "representatives",
  {
    id: airtableId("id").primaryKey(),
    name: varchar("name"),
    politicalParty: politicalPartyEnum("politicalParty"),
    district: varchar("district"),
    role: representativeRoleEnum("role"),
    level: representativeLevelEnum("level"),
    state: varchar("state", {
      enum: usStateValues as [UsStates, ...UsStates[]],
    }),
    reelectionDate: date("reelectionDate", { mode: "date" }),
    legiscanId: integer("legiscanId"),
    followTheMoneyId: integer("followTheMoneyId"),
    email: varchar("email"),
    facebook: varchar("facebook"),
    twitter: varchar("twitter"),
    website: text("website"),
    capitolPhoneNumber: varchar("capitolPhoneNumber"),
    districtPhoneNumber: varchar("districtPhoneNumber"),
    capitolAddress: varchar("capitolAddress"),
    districtAddress: varchar("districtAddress"),
    search: tsVector("contentSearch", {
      dimensions: 3,
    }).generatedAlwaysAs(
      (): SQL => sql`(
          setweight(to_tsvector('english', ${representatives.name}), 'A') ||
          setweight(to_tsvector('english', ${representatives.state}), 'A')
        )`,
    ),
    ...airtableRows,
  },
  (table) => ({
    idx: index("idx_content_search").using("gin", table.search),
  }),
);
export type Representative = typeof representatives.$inferSelect;
export type NewRepresentative = typeof representatives.$inferInsert;
export const insertRepSchema = createInsertSchema(representatives);
export const selectRepSchema = createSelectSchema(representatives);

export const bills = tfpSchema.table("bills", {
  id: airtableId("id").primaryKey(),
  caseName: varchar("caseName"),
  status: billStatusEnum("status"),
  progress: billProgressEnum("progress"),
  impact: billImpactEnum("impact"),
  summary: text("summary"),
  level: billLevelEnum("level").default("State"),
  state: varchar("state", { enum: usStateValues as [UsStates, ...UsStates[]] }),
  link: text("billInformationLink"),
  legiscanBillId: integer("legiscanBillId"),
  yeaVoteCount: integer("yeaVoteCount").default(-1),
  nayVoteCount: integer("nayVoteCount").default(-1),
  lastActivityDate: date("lastActivityDate", { mode: "date" }),
  introductionDate: date("introductionDate", { mode: "date" }),
  ...airtableRows,
});
export type Bill = typeof bills.$inferSelect;
export type NewBill = typeof bills.$inferInsert;
export const insertBillSchema = createInsertSchema(bills);
export const selectBillSchema = createSelectSchema(bills);

export const billCategories = tfpSchema.table("billCategories", {
  id: serial("id").primaryKey(),
  billId: airtableId("billId")
    .notNull()
    .references(() => bills.id, { onDelete: "cascade" }),
  category: billCategoriesEnum("category").notNull(),
});
export type BillCategory = typeof billCategories.$inferSelect;
export type NewBillCategory = typeof billCategories.$inferInsert;
export const insertBillCategorySchema = createInsertSchema(billCategories);
export const selectBillCategorySchema = createSelectSchema(billCategories);

export const billRepRelations = tfpSchema.table("billRepRelations", {
  id: serial("id").primaryKey(),
  billId: airtableId("billId")
    .notNull()
    .references(() => bills.id, { onDelete: "cascade" }),
  repId: airtableId("repId")
    .notNull()
    .references(() => representatives.id, { onDelete: "cascade" }),
  type: billRepRelationTypeEnum("type").notNull(),
});
export type BillRepRelation = typeof billRepRelations.$inferSelect;
export type NewBillRepRelation = typeof billRepRelations.$inferInsert;
export const insertBillRepRelationSchema = createInsertSchema(billRepRelations);
export const selectBillRepRelationSchema = createSelectSchema(billRepRelations);

export const billVotes = tfpSchema.table("billVotes", {
  id: serial("id").primaryKey(),
  billId: airtableId("billId")
    .notNull()
    .references(() => bills.id, { onDelete: "cascade" }),
  repId: airtableId("repId")
    .notNull()
    .references(() => representatives.id, { onDelete: "cascade" }),
  vote: billVoteEnum("vote").notNull(),
});
export type BillVote = typeof billVotes.$inferSelect;
export type NewBillVote = typeof billVotes.$inferInsert;
export const insertBillVoteSchema = createInsertSchema(billVotes);
export const selectBillVoteSchema = createSelectSchema(billVotes);

export const importLogs = tfpSchema.table("importLogs", {
  id: serial("id").primaryKey(),
  status: importLogStatusEnum("status").default("In Progress"),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow(),
});
export type ImportLog = typeof importLogs.$inferSelect;
export type NewImportLog = typeof importLogs.$inferInsert;
export const insertImportLogSchema = createInsertSchema(importLogs);
export const selectImportLogSchema = createSelectSchema(importLogs);

export const importRecordLogs = tfpSchema.table("importRecordLogs", {
  id: serial("id").primaryKey(),
  logId: integer("logId").references(() => importLogs.id, {
    onDelete: "cascade",
  }),
  recordId: airtableId("recordId"),
  tableId: airtableId("airtableId"),
  tableName: varchar("tableName"),
  importData: json("importData"),
  currentData: json("currentData"),
  diff: text("jsonDiff"),
  createdAt: timestamp("createdAt").defaultNow(),
});
export type ImportRecordLog = typeof importRecordLogs.$inferSelect;
export type NewImportRecordLog = typeof importRecordLogs.$inferInsert;
export const insertImportRecordLogSchema = createInsertSchema(importRecordLogs);
export const selectImportRecordLogSchema = createSelectSchema(importRecordLogs);
