import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listReports = query({
  args: {
    status: v.optional(v.string()),
    reportType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    let reports;

    if (args.status) {
      reports = await ctx.db
        .query("safetyReports")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
    } else {
      reports = await ctx.db
        .query("safetyReports")
        .order("desc")
        .collect();
    }

    if (args.reportType) {
      return reports.filter((report) => report.reportType === args.reportType);
    }

    return reports;
  },
});

export const getMyReports = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db
      .query("safetyReports")
      .withIndex("by_reporter", (q) => q.eq("reportedBy", userId))
      .order("desc")
      .collect();
  },
});

export const createReport = mutation({
  args: {
    hazardId: v.optional(v.id("hazards")),
    reportType: v.string(),
    title: v.string(),
    description: v.string(),
    location: v.object({
      x: v.number(),
      y: v.number(),
      area: v.string(),
    }),
    severity: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("safetyReports", {
      ...args,
      status: "reported",
      reportedBy: userId,
    });
  },
});

export const updateReportStatus = mutation({
  args: {
    reportId: v.id("safetyReports"),
    status: v.string(),
    actionsTaken: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const updates: any = {
      status: args.status,
    };

    if (args.actionsTaken) {
      updates.actionsTaken = args.actionsTaken;
    }

    if (args.status === "resolved" || args.status === "closed") {
      updates.resolvedAt = Date.now();
    }

    await ctx.db.patch(args.reportId, updates);
  },
});

export const assignReport = mutation({
  args: {
    reportId: v.id("safetyReports"),
    assignedTo: v.id("users"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    await ctx.db.patch(args.reportId, {
      assignedTo: args.assignedTo,
      status: "investigating",
    });
  },
});
