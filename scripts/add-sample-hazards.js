// Script to add sample hazards for testing AR detection
// Run this in browser console on your deployed app

const sampleHazards = [
  {
    name: "Kabel Listrik Terbuka",
    description: "Kabel listrik yang tidak terlindungi dapat menyebabkan sengatan listrik",
    category: "electrical",
    riskLevel: "high",
    location: "Bengkel TKR",
    detectionKeywords: ["wire", "electrical", "cable", "power", "voltage"],
    preventionSteps: [
      "Matikan sumber listrik sebelum bekerja",
      "Gunakan sarung tangan isolasi",
      "Periksa kondisi kabel secara berkala",
      "Tutup kabel dengan isolasi yang tepat"
    ]
  },
  {
    name: "Mesin Gerinda Tanpa Pelindung",
    description: "Mesin gerinda yang dioperasikan tanpa pelindung mata dapat menyebabkan cedera serius",
    category: "machinery",
    riskLevel: "critical",
    location: "Bengkel Mesin",
    detectionKeywords: ["machinery", "grinder", "metal", "cutting", "sparks"],
    preventionSteps: [
      "Selalu gunakan kacamata pelindung",
      "Pastikan pelindung mesin terpasang",
      "Gunakan sarung tangan anti-slip",
      "Periksa kondisi mata gerinda"
    ]
  },
  {
    name: "Komponen Elektronik Panas",
    description: "Komponen elektronik yang overheating dapat menyebabkan kebakaran",
    category: "fire",
    riskLevel: "medium",
    location: "Bengkel Elind",
    detectionKeywords: ["circuit", "electronic", "component", "heat", "overheating"],
    preventionSteps: [
      "Monitor suhu komponen secara berkala",
      "Pastikan ventilasi yang cukup",
      "Gunakan heat sink yang tepat",
      "Matikan perangkat jika terlalu panas"
    ]
  },
  {
    name: "Tumpahan Oli di Lantai",
    description: "Oli yang tumpah di lantai dapat menyebabkan terpeleset dan jatuh",
    category: "slip",
    riskLevel: "medium",
    location: "Bengkel TSM",
    detectionKeywords: ["oil", "spill", "floor", "slippery", "fuel"],
    preventionSteps: [
      "Bersihkan tumpahan segera",
      "Gunakan material penyerap oli",
      "Pasang tanda peringatan",
      "Gunakan alas kaki anti-slip"
    ]
  },
  {
    name: "Server Overheating",
    description: "Server yang terlalu panas dapat menyebabkan kerusakan sistem dan kebakaran",
    category: "fire",
    riskLevel: "high",
    location: "Bengkel TKI",
    detectionKeywords: ["server", "computer", "overheating", "ventilation", "cooling"],
    preventionSteps: [
      "Periksa sistem pendingin",
      "Bersihkan debu pada kipas",
      "Monitor suhu ruangan",
      "Pastikan sirkulasi udara baik"
    ]
  },
  {
    name: "Bahan Kimia Tidak Berlabel",
    description: "Bahan kimia tanpa label yang jelas dapat menyebabkan keracunan atau reaksi berbahaya",
    category: "chemical",
    riskLevel: "critical",
    location: "Gudang",
    detectionKeywords: ["chemical", "storage", "container", "unlabeled", "hazardous"],
    preventionSteps: [
      "Label semua bahan kimia dengan jelas",
      "Simpan di tempat yang aman",
      "Gunakan APD saat menangani",
      "Pisahkan bahan yang tidak kompatibel"
    ]
  },
  {
    name: "Pencahayaan Kurang",
    description: "Pencahayaan yang tidak memadai dapat menyebabkan kecelakaan kerja",
    category: "environmental",
    riskLevel: "low",
    location: "Other",
    detectionKeywords: ["lighting", "dark", "visibility", "illumination", "lamp"],
    preventionSteps: [
      "Tambah lampu penerangan",
      "Gunakan lampu kerja portable",
      "Periksa kondisi lampu secara berkala",
      "Bersihkan lampu dari debu"
    ]
  }
];

// Function to add hazards to Convex database
async function addSampleHazards() {
  console.log("Adding sample hazards...");
  
  for (const hazard of sampleHazards) {
    try {
      // This would be called through your Convex mutation
      // Replace with actual API call to your deployed app
      console.log(`Adding hazard: ${hazard.name}`);
      
      // Example API call (adjust URL to your deployed app):
      // await fetch('/api/hazards', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(hazard)
      // });
      
    } catch (error) {
      console.error(`Error adding hazard ${hazard.name}:`, error);
    }
  }
  
  console.log("Sample hazards added successfully!");
}

// Instructions for manual addition:
console.log("=== SAMPLE HAZARDS FOR MANUAL ADDITION ===");
console.log("Copy and paste these into your Convex dashboard:");
console.log(JSON.stringify(sampleHazards, null, 2));

// Uncomment to run automatically:
// addSampleHazards();
