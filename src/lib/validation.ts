// Client-safe building blocks for the admin form schemas. Nothing here may
// touch server-only APIs. Keep imports relative: the database schema (loaded
// by drizzle-kit) imports modules that import this one.
import slugify from "slugify";
import * as z from "zod";

/** A URL slug from a title or name, e.g. "Trans Formations" → "trans-formations". */
export function toIdentifier(value: string) {
  return slugify(value, { lower: true, strict: true });
}

export const identifierSchema = z
  .string()
  .trim()
  .min(1, "Enter a name to generate a slug")
  .max(120)
  // `*` so an empty value reports only the `min` message above.
  .regex(/^[a-z0-9-]*$/, "Only lowercase letters, numbers, and dashes");

export const requiredText = (message: string, max = 200) =>
  z.string().trim().min(1, message).max(max);

/** Empty strings from the form are stored as NULL. */
export const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => value || null);

export const optionalUrl = z
  .union([z.literal(""), z.url("Enter a full URL, e.g. https://…")])
  .transform((value) => value || null);

/** A full list of record ids in their new display order. */
export const reorderIdsSchema = z
  .array(z.string().min(1).max(120))
  .max(500)
  .refine((ids) => new Set(ids).size === ids.length, "Duplicate ids");
