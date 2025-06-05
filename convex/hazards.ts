import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listHazards = query({
  args: {
    category: v.optional(v.string()),
    area: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    let hazards;

    if (args.category) {
      hazards = await ctx.db
        .query("hazards")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .collect();
    } else {
      hazards = await ctx.db.query("hazards").collect();
    }

    if (args.area) {
      return hazards.filter((hazard) => hazard.location.area === args.area);
    }

    return hazards.filter((hazard) => hazard.isActive);
  },
});

export const getHazardById = query({
  args: { hazardId: v.id("hazards") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.get(args.hazardId);
  },
});

export const createHazard = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    category: v.string(),
    riskLevel: v.string(),
    location: v.object({
      x: v.number(),
      y: v.number(),
      z: v.optional(v.number()),
      area: v.string(),
    }),
    detectionKeywords: v.array(v.string()),
    safetyMeasures: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("hazards", {
      ...args,
      isActive: true,
      createdBy: userId,
    });
  },
});

export const updateHazard = mutation({
  args: {
    hazardId: v.id("hazards"),
    updates: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      category: v.optional(v.string()),
      riskLevel: v.optional(v.string()),
      location: v.optional(v.object({
        x: v.number(),
        y: v.number(),
        z: v.optional(v.number()),
        area: v.string(),
      })),
      detectionKeywords: v.optional(v.array(v.string())),
      safetyMeasures: v.optional(v.array(v.string())),
      isActive: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const hazard = await ctx.db.get(args.hazardId);
    if (!hazard) {
      throw new Error("Hazard not found");
    }

    await ctx.db.patch(args.hazardId, args.updates);
  },
});

export const searchHazardsByKeywords = query({
  args: {
    keywords: v.array(v.string()),
    area: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const hazards = await ctx.db.query("hazards").collect();
    
    return hazards.filter((hazard) => {
      if (!hazard.isActive) return false;
      if (args.area && hazard.location.area !== args.area) return false;
      
      return args.keywords.some((keyword) =>
        hazard.detectionKeywords.some((detectionKeyword) =>
          detectionKeyword.toLowerCase().includes(keyword.toLowerCase())
        )
      );
    });
  },
});
