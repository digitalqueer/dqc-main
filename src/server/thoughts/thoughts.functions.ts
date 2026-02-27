import { createServerFn } from "@tanstack/react-start";
import { getThoughtPost, getThoughtsList } from "./thoughts.server";
import z from "zod";

export const getThoughtPostServerFn = createServerFn({ method: "GET" })
  .inputValidator(z.object({ slug: z.string() }))
  .handler(async ({ data }) => getThoughtPost(data.slug));
export const getThoughtsListServerFn = createServerFn({
  method: "GET",
}).handler(getThoughtsList);
