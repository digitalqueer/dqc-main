// Client-safe module: constants and validation schemas shared by the project
// server functions (inputs) and the admin project forms. Nothing here may
// touch server-only APIs. Keep imports relative: drizzle-kit loads the
// database schema, which may import from lib modules.
import * as z from "zod";
import { richTextDocumentSchema } from "./rich-text";
import {
  identifierSchema,
  optionalText,
  optionalUrl,
  reorderIdsSchema,
  requiredText,
} from "./validation";

/** Projects are listed in two groups, backed by the `is_active` column. */
export const PROJECT_STATUSES = ["active", "past"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  active: "Active",
  past: "Past",
};

export const toProjectStatus = (is_active: boolean): ProjectStatus =>
  is_active ? "active" : "past";

export const projectInputSchema = z
  .object({
    /** URL slug: /projects/{id}. Fixed once the project is created. */
    id: identifierSchema,
    name: requiredText("Enter a name"),
    status: z.enum(PROJECT_STATUSES),
    description: optionalText(4000),
    websiteLink: optionalUrl,
    sourceLink: optionalUrl,
    startDate: requiredText("Enter when it started, e.g. Spring 2026", 40),
    endDate: optionalText(40),
  })
  .transform(({ status, ...project }) => ({
    ...project,
    isActive: status === "active",
  }));
/** Form-side shape: `status` select, blank optional fields allowed. */
export type ProjectInput = z.input<typeof projectInputSchema>;

export const projectIdSchema = z.object({ id: identifierSchema });

export const projectSlugSchema = z.object({
  slug: z.string().min(1).max(120),
});

export const projectReorderSchema = z.object({
  status: z.enum(PROJECT_STATUSES),
  ids: reorderIdsSchema,
});

/** A short list of active projects, e.g. for the home page or dashboard. */
export const projectListLimitSchema = z.object({
  limit: z.number().int().min(1).max(50),
});

/** Saving or publishing a project's page from the editor. */
export const projectPageContentSchema = z.object({
  id: identifierSchema,
  content: richTextDocumentSchema,
});

/** "Spring 2026 – Current", "2021 – 2025", or just the start. */
export function projectDates(project: {
  startDate: string;
  endDate: string | null;
  isActive: boolean;
}) {
  const end = project.endDate ?? (project.isActive ? "Current" : null);
  return end ? `${project.startDate} – ${end}` : project.startDate;
}
