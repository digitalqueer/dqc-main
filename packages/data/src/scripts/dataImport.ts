import { command, boolean, run } from "@drizzle-team/brocli";

const pull = command({
  name: "pull",
  options: {
    fresh: boolean().default(false),
  },
  async handler() {},
});

run([pull]);
