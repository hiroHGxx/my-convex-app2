import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("messages").collect();
  },
});

export const send = mutation({
  args: { author: v.string(), body: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", { author: args.author, body: args.body });
  },
});