import z from "zod";

export const ThoughtPostDataSchema = z.object({
  title: z.string(),
  slug: z.string(),
  author: z.string(),
  description: z.string().optional(),
  publishedAt: z.date().optional(),
});

export type ThoughtPost = z.output<typeof ThoughtPostDataSchema>;
