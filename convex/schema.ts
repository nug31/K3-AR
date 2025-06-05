import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  hazards: defineTable({
    name: v.string(),
    description: v.string(),
    category: v.string(), // "electrical", "chemical", "physical", "biological", "ergonomic"
    riskLevel: v.string(), // "low", "medium", "high", "critical"
    location: v.object({
      x: v.number(),
      y: v.number(),
      z: v.optional(v.number()),
      area: v.string(),
    }),
    detectionKeywords: v.array(v.string()),
    safetyMeasures: v.array(v.string()),
    iconUrl: v.optional(v.string()),
    isActive: v.boolean(),
    createdBy: v.id("users"),
  })
    .index("by_category", ["category"])
    .index("by_risk_level", ["riskLevel"])
    .index("by_location_area", ["location.area"]),

  safetyReports: defineTable({
    hazardId: v.optional(v.id("hazards")),
    reportType: v.string(), // "incident", "near_miss", "hazard_spotted", "safety_violation"
    title: v.string(),
    description: v.string(),
    location: v.object({
      x: v.number(),
      y: v.number(),
      area: v.string(),
    }),
    severity: v.string(), // "low", "medium", "high", "critical"
    status: v.string(), // "reported", "investigating", "resolved", "closed"
    reportedBy: v.id("users"),
    assignedTo: v.optional(v.id("users")),
    imageUrl: v.optional(v.string()),
    actionsTaken: v.optional(v.array(v.string())),
    resolvedAt: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_severity", ["severity"])
    .index("by_reporter", ["reportedBy"])
    .index("by_assignee", ["assignedTo"]),

  arSessions: defineTable({
    userId: v.id("users"),
    sessionStart: v.number(),
    sessionEnd: v.optional(v.number()),
    hazardsDetected: v.array(v.id("hazards")),
    location: v.string(),
    deviceInfo: v.object({
      userAgent: v.string(),
      hasCamera: v.boolean(),
      hasGyroscope: v.boolean(),
    }),
  })
    .index("by_user", ["userId"])
    .index("by_location", ["location"]),

  safetyTraining: defineTable({
    title: v.string(),
    description: v.string(),
    category: v.string(),
    content: v.string(),
    duration: v.number(), // in minutes
    requiredFor: v.array(v.string()), // job roles
    isActive: v.boolean(),
    createdBy: v.id("users"),
  })
    .index("by_category", ["category"]),

  userTrainingProgress: defineTable({
    userId: v.id("users"),
    trainingId: v.id("safetyTraining"),
    status: v.string(), // "not_started", "in_progress", "completed"
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    score: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_training", ["trainingId"])
    .index("by_status", ["status"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
