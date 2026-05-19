import path from "path";
import fs from "fs/promises";
import { ThoughtPostDataSchema } from "../../schemas/thoughtPost.schema";
import z from "zod";
import matter from "gray-matter";

const THOUGHTS_POST_DIR = "src/posts/thoughts";

export async function getThoughtPost(slug: string) {
  const thoughtPostPath = path.resolve(THOUGHTS_POST_DIR, `${slug}.md`);
  const doesThoughtPostFileExist = await fs
    .access(thoughtPostPath, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false);
  if (!doesThoughtPostFileExist) {
    return null;
  }
  const thoughtPostFileContent = await fs.readFile(thoughtPostPath, "utf-8");
  const thoughtPostFrontMatter = matter(thoughtPostFileContent);
  const frontMatter = ThoughtPostDataSchema.safeParse(
    thoughtPostFrontMatter.data,
  );
  if (frontMatter.success) {
    return { data: frontMatter.data, content: thoughtPostFrontMatter.content };
  }
  return null;
}

export async function getThoughtsList() {
  const thoughtsPostDirectory = path.resolve(THOUGHTS_POST_DIR);
  const thoughtPostFileEntries = await fs.readdir(thoughtsPostDirectory);
  const thoughtPostEntryContents = await Promise.all(
    thoughtPostFileEntries.map((entryPath) =>
      fs.readFile(path.resolve(thoughtsPostDirectory, entryPath), "utf-8"),
    ),
  );
  const thoughtPostEntries = thoughtPostEntryContents.map((content) =>
    matter(content),
  );
  return thoughtPostEntries.reduce<z.infer<typeof ThoughtPostDataSchema>[]>(
    (acc, curr) => {
      const { success, data, error } = ThoughtPostDataSchema.safeParse(
        curr.data,
      );
      if (success) acc.push(data);
      else {
        console.warn("Failed to parse post data", error);
      }
      return acc;
    },
    [],
  );
}
