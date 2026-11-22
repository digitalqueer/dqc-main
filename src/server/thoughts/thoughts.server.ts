import { ThoughtPostDataSchema } from "../../schemas/thoughtPost.schema";
import z from "zod";
import matter from "gray-matter";

const THOUGHTS_POST_DIR = "/src/posts/thoughts";

// The posts' Markdown, built into the server bundle at build time and keyed by
// path, so they don't depend on the source being next to the running server
// (the production image only has the build). Thoughts move into the database
// once the admin can edit them.
const THOUGHT_POST_FILES = import.meta.glob<string>("/src/posts/thoughts/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

export async function getThoughtPost(slug: string) {
  const thoughtPostFileContent =
    THOUGHT_POST_FILES[`${THOUGHTS_POST_DIR}/${slug}.md`];
  if (thoughtPostFileContent === undefined) {
    return null;
  }
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
  const thoughtPostEntries = Object.values(THOUGHT_POST_FILES).map((content) =>
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
