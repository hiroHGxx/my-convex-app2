import { query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return "Hello Convex!";
  },
});