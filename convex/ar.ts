import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const startARSession = mutation({
  args: {
    location: v.string(),
    deviceInfo: v.object({
      userAgent: v.string(),
      hasCamera: v.boolean(),
      hasGyroscope: v.boolean(),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("arSessions", {
      userId,
      sessionStart: Date.now(),
      hazardsDetected: [],
      location: args.location,
      deviceInfo: args.deviceInfo,
    });
  },
});

export const endARSession = mutation({
  args: {
    sessionId: v.id("arSessions"),
    hazardsDetected: v.array(v.id("hazards")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    await ctx.db.patch(args.sessionId, {
      sessionEnd: Date.now(),
      hazardsDetected: args.hazardsDetected,
    });
  },
});

export const getARSessionStats = query({
  args: {
    timeRange: v.optional(v.string()), // "today", "week", "month"
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const sessions = await ctx.db
      .query("arSessions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    let filteredSessions = sessions;

    if (args.timeRange) {
      const now = Date.now();
      let cutoff = 0;

      switch (args.timeRange) {
        case "today":
          cutoff = now - 24 * 60 * 60 * 1000;
          break;
        case "week":
          cutoff = now - 7 * 24 * 60 * 60 * 1000;
          break;
        case "month":
          cutoff = now - 30 * 24 * 60 * 60 * 1000;
          break;
      }

      filteredSessions = sessions.filter(
        (session) => session.sessionStart >= cutoff
      );
    }

    const totalSessions = filteredSessions.length;
    const totalHazardsDetected = filteredSessions.reduce(
      (sum, session) => sum + session.hazardsDetected.length,
      0
    );
    const averageSessionDuration = filteredSessions
      .filter((session) => session.sessionEnd)
      .reduce((sum, session) => {
        return sum + (session.sessionEnd! - session.sessionStart);
      }, 0) / filteredSessions.filter((session) => session.sessionEnd).length;

    return {
      totalSessions,
      totalHazardsDetected,
      averageSessionDuration: averageSessionDuration || 0,
      sessionsData: filteredSessions,
    };
  },
});
