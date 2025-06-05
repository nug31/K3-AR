import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedHazards = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if hazards already exist
    const existingHazards = await ctx.db.query("hazards").collect();
    if (existingHazards.length > 0) {
      return "Hazards already exist";
    }

    // Create sample hazards
    const sampleHazards = [
      {
        name: "Exposed Electrical Wiring",
        description: "Damaged electrical cables with exposed copper wiring that pose electrocution risk",
        category: "electrical",
        riskLevel: "high",
        location: { x: 10, y: 20, area: "Factory Floor A" },
        detectionKeywords: ["wire", "cable", "electrical", "exposed", "copper"],
        safetyMeasures: [
          "Turn off power at main breaker",
          "Use insulated tools only",
          "Wear rubber gloves and safety boots",
          "Call qualified electrician"
        ],
        isActive: true,
        createdBy: "system" as any, // Will be replaced with actual user ID
      },
      {
        name: "Chemical Spill Area",
        description: "Area where corrosive chemicals may leak, requiring immediate attention",
        category: "chemical",
        riskLevel: "critical",
        location: { x: 5, y: 15, area: "Chemical Storage" },
        detectionKeywords: ["chemical", "spill", "leak", "corrosive", "acid", "base"],
        safetyMeasures: [
          "Evacuate immediate area",
          "Wear full PPE including respirator",
          "Use chemical spill kit",
          "Ventilate area",
          "Contact emergency response team"
        ],
        isActive: true,
        createdBy: "system" as any,
      },
      {
        name: "Unsecured Ladder",
        description: "Ladder not properly secured or positioned, risk of falling",
        category: "physical",
        riskLevel: "medium",
        location: { x: 30, y: 25, area: "Warehouse" },
        detectionKeywords: ["ladder", "unsecured", "unstable", "falling", "height"],
        safetyMeasures: [
          "Secure ladder base with spotter",
          "Check ladder condition before use",
          "Maintain 3-point contact",
          "Use safety harness for heights over 2m"
        ],
        isActive: true,
        createdBy: "system" as any,
      },
      {
        name: "Heavy Machinery Operation Zone",
        description: "Area with active heavy machinery requiring safety protocols",
        category: "physical",
        riskLevel: "high",
        location: { x: 50, y: 40, area: "Factory Floor B" },
        detectionKeywords: ["machinery", "heavy", "equipment", "moving", "crushing"],
        safetyMeasures: [
          "Wear high-visibility vest",
          "Maintain safe distance from moving parts",
          "Use lockout/tagout procedures",
          "Never bypass safety guards"
        ],
        isActive: true,
        createdBy: "system" as any,
      },
      {
        name: "Poor Ventilation Area",
        description: "Area with inadequate air circulation leading to potential respiratory issues",
        category: "biological",
        riskLevel: "medium",
        location: { x: 15, y: 35, area: "Electrical Room" },
        detectionKeywords: ["ventilation", "air", "breathing", "stuffy", "circulation"],
        safetyMeasures: [
          "Use portable ventilation fans",
          "Wear appropriate respiratory protection",
          "Limit exposure time",
          "Monitor air quality regularly"
        ],
        isActive: true,
        createdBy: "system" as any,
      },
      {
        name: "Repetitive Motion Workstation",
        description: "Workstation requiring repetitive motions that may cause strain injuries",
        category: "ergonomic",
        riskLevel: "low",
        location: { x: 25, y: 30, area: "Factory Floor A" },
        detectionKeywords: ["repetitive", "motion", "strain", "ergonomic", "workstation"],
        safetyMeasures: [
          "Take regular breaks every hour",
          "Use proper posture and technique",
          "Adjust workstation height",
          "Perform stretching exercises"
        ],
        isActive: true,
        createdBy: "system" as any,
      }
    ];

    // Get the first user to assign as creator
    const users = await ctx.db.query("users").collect();
    const systemUserId = users.length > 0 ? users[0]._id : null;

    if (!systemUserId) {
      throw new Error("No users found. Please sign in first.");
    }

    // Insert hazards
    for (const hazard of sampleHazards) {
      await ctx.db.insert("hazards", {
        ...hazard,
        createdBy: systemUserId,
      });
    }

    return `Created ${sampleHazards.length} sample hazards`;
  },
});

export const seedReports = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if reports already exist
    const existingReports = await ctx.db.query("safetyReports").collect();
    if (existingReports.length > 0) {
      return "Reports already exist";
    }

    // Get users and hazards
    const users = await ctx.db.query("users").collect();
    const hazards = await ctx.db.query("hazards").collect();

    if (users.length === 0) {
      throw new Error("No users found. Please sign in first.");
    }

    if (hazards.length === 0) {
      throw new Error("No hazards found. Please seed hazards first.");
    }

    const userId = users[0]._id;
    const sampleReports = [
      {
        hazardId: hazards[0]._id,
        reportType: "hazard_spotted",
        title: "Exposed Wiring Discovered",
        description: "Found damaged electrical cable near workstation 5. Immediate attention required.",
        location: { x: 10, y: 20, area: "Factory Floor A" },
        severity: "high",
        status: "reported",
        reportedBy: userId,
      },
      {
        reportType: "near_miss",
        title: "Near Miss with Forklift",
        description: "Worker almost struck by forklift in warehouse aisle. Driver visibility was limited.",
        location: { x: 35, y: 28, area: "Warehouse" },
        severity: "medium",
        status: "investigating",
        reportedBy: userId,
      },
      {
        reportType: "incident",
        title: "Minor Chemical Exposure",
        description: "Worker experienced minor skin irritation from cleaning chemical splash.",
        location: { x: 8, y: 12, area: "Chemical Storage" },
        severity: "low",
        status: "resolved",
        reportedBy: userId,
        resolvedAt: Date.now() - 24 * 60 * 60 * 1000, // 1 day ago
      }
    ];

    // Insert reports
    for (const report of sampleReports) {
      await ctx.db.insert("safetyReports", report);
    }

    return `Created ${sampleReports.length} sample reports`;
  },
});
