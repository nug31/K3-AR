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

    // Create sample hazards for different workshop areas
    const sampleHazards = [
      // Bengkel TKR Hazards
      {
        name: "Exposed Electrical Wiring",
        description: "Damaged electrical cables with exposed copper wiring that pose electrocution risk",
        category: "electrical",
        riskLevel: "high",
        location: { x: 10, y: 20, area: "Bengkel TKR" },
        detectionKeywords: ["wire", "cable", "electrical", "exposed", "copper", "battery"],
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
        name: "Car Battery Acid Leak",
        description: "Vehicle battery showing signs of acid leakage, corrosive hazard",
        category: "chemical",
        riskLevel: "medium",
        location: { x: 25, y: 35, area: "Bengkel TKR" },
        detectionKeywords: ["battery", "acid", "leak", "corrosive", "vehicle"],
        safetyMeasures: [
          "Wear acid-resistant gloves",
          "Use eye protection",
          "Neutralize spill with baking soda",
          "Ventilate area properly"
        ],
        isActive: true,
        createdBy: "system" as any,
      },
      {
        name: "Engine Hoist Safety Risk",
        description: "Heavy engine lifting equipment without proper safety chains",
        category: "physical",
        riskLevel: "high",
        location: { x: 40, y: 30, area: "Bengkel TKR" },
        detectionKeywords: ["engine", "hoist", "lifting", "heavy", "chain"],
        safetyMeasures: [
          "Inspect lifting equipment before use",
          "Use safety chains as backup",
          "Clear area below lifted objects",
          "Never work under unsecured loads"
        ],
        isActive: true,
        createdBy: "system" as any,
      },
      // Bengkel Mesin Hazards
      {
        name: "Unguarded Lathe Machine",
        description: "Lathe machine operating without proper safety guards",
        category: "physical",
        riskLevel: "critical",
        location: { x: 15, y: 25, area: "Bengkel Mesin" },
        detectionKeywords: ["lathe", "machine", "unguarded", "rotating", "cutting"],
        safetyMeasures: [
          "Install proper machine guards",
          "Use emergency stop procedures",
          "Wear close-fitting clothing",
          "Remove jewelry and loose items"
        ],
        isActive: true,
        createdBy: "system" as any,
      },
      {
        name: "Metal Cutting Oil Spill",
        description: "Slippery cutting oil creating slip hazard on workshop floor",
        category: "chemical",
        riskLevel: "medium",
        location: { x: 30, y: 40, area: "Bengkel Mesin" },
        detectionKeywords: ["oil", "spill", "cutting", "slippery", "metal"],
        safetyMeasures: [
          "Clean spill immediately",
          "Use absorbent materials",
          "Place warning signs",
          "Wear non-slip footwear"
        ],
        isActive: true,
        createdBy: "system" as any,
      },
      {
        name: "Welding Fume Exposure",
        description: "Inadequate ventilation during welding operations",
        category: "chemical",
        riskLevel: "high",
        location: { x: 50, y: 20, area: "Bengkel Mesin" },
        detectionKeywords: ["welding", "fume", "smoke", "ventilation", "metal"],
        safetyMeasures: [
          "Use local exhaust ventilation",
          "Wear appropriate respirator",
          "Work in well-ventilated areas",
          "Take regular breaks"
        ],
        isActive: true,
        createdBy: "system" as any,
      },
      // Bengkel Elind Hazards
      {
        name: "High Voltage Circuit Board",
        description: "Exposed high voltage components in electronic equipment",
        category: "electrical",
        riskLevel: "critical",
        location: { x: 20, y: 30, area: "Bengkel Elind" },
        detectionKeywords: ["voltage", "circuit", "electronic", "component", "high"],
        safetyMeasures: [
          "Turn off power before servicing",
          "Use lockout/tagout procedures",
          "Test circuits before touching",
          "Use insulated tools only"
        ],
        isActive: true,
        createdBy: "system" as any,
      },
      {
        name: "Overheating Electronic Components",
        description: "Electronic components running at dangerous temperatures",
        category: "fire",
        riskLevel: "high",
        location: { x: 35, y: 45, area: "Bengkel Elind" },
        detectionKeywords: ["overheating", "electronic", "component", "temperature", "hot"],
        safetyMeasures: [
          "Check cooling systems regularly",
          "Monitor component temperatures",
          "Ensure proper ventilation",
          "Replace faulty components immediately"
        ],
        isActive: true,
        createdBy: "system" as any,
      },
      // Bengkel TSM Hazards
      {
        name: "Fuel Spill Hazard",
        description: "Gasoline or diesel fuel spilled on workshop floor",
        category: "fire",
        riskLevel: "critical",
        location: { x: 25, y: 35, area: "Bengkel TSM" },
        detectionKeywords: ["fuel", "gasoline", "diesel", "spill", "flammable"],
        safetyMeasures: [
          "Eliminate ignition sources immediately",
          "Ventilate area thoroughly",
          "Use appropriate absorbent materials",
          "Dispose of contaminated materials safely"
        ],
        isActive: true,
        createdBy: "system" as any,
      },
      {
        name: "Engine Parts Scattered",
        description: "Motorcycle engine parts creating trip hazards on floor",
        category: "physical",
        riskLevel: "medium",
        location: { x: 40, y: 25, area: "Bengkel TSM" },
        detectionKeywords: ["engine", "parts", "scattered", "trip", "motorcycle"],
        safetyMeasures: [
          "Organize parts in designated areas",
          "Use proper storage containers",
          "Keep walkways clear",
          "Label all components"
        ],
        isActive: true,
        createdBy: "system" as any,
      },
      // Bengkel TKI Hazards
      {
        name: "Server Overheating",
        description: "Computer servers running at dangerous temperatures",
        category: "fire",
        riskLevel: "medium",
        location: { x: 30, y: 40, area: "Bengkel TKI" },
        detectionKeywords: ["server", "computer", "overheating", "temperature", "network"],
        safetyMeasures: [
          "Check cooling system operation",
          "Monitor server temperatures",
          "Ensure proper airflow",
          "Clean dust from components"
        ],
        isActive: true,
        createdBy: "system" as any,
      },
      {
        name: "Cable Management Hazard",
        description: "Network cables creating trip hazards and fire risks",
        category: "electrical",
        riskLevel: "low",
        location: { x: 15, y: 30, area: "Bengkel TKI" },
        detectionKeywords: ["cable", "network", "trip", "management", "wire"],
        safetyMeasures: [
          "Use cable management systems",
          "Secure loose cables",
          "Route cables away from walkways",
          "Regular inspection of cable condition"
        ],
        isActive: true,
        createdBy: "system" as any,
      },
      // Gudang Hazards
      {
        name: "Blocked Emergency Exit",
        description: "Emergency exit route blocked by stored materials",
        category: "fire",
        riskLevel: "high",
        location: { x: 10, y: 50, area: "Gudang" },
        detectionKeywords: ["emergency", "exit", "blocked", "storage", "evacuation"],
        safetyMeasures: [
          "Clear exit routes immediately",
          "Mark emergency exits clearly",
          "Regular inspection of exit routes",
          "Train staff on evacuation procedures"
        ],
        isActive: true,
        createdBy: "system" as any,
      },
      {
        name: "Unstable Storage Stack",
        description: "Materials stacked unsafely creating falling hazard",
        category: "physical",
        riskLevel: "medium",
        location: { x: 45, y: 35, area: "Gudang" },
        detectionKeywords: ["storage", "stack", "unstable", "falling", "materials"],
        safetyMeasures: [
          "Secure stacks with strapping",
          "Limit stack height",
          "Use proper storage equipment",
          "Regular stability checks"
        ],
        isActive: true,
        createdBy: "system" as any,
      },
      // Other Area Hazards
      {
        name: "Wet Floor Slip Hazard",
        description: "Wet floor surface creating slip and fall risk",
        category: "physical",
        riskLevel: "medium",
        location: { x: 20, y: 25, area: "Other" },
        detectionKeywords: ["wet", "floor", "slip", "water", "cleaning"],
        safetyMeasures: [
          "Place wet floor warning signs",
          "Use non-slip mats",
          "Clean spills immediately",
          "Wear appropriate footwear"
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
