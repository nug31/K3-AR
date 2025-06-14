import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { useLanguage } from "../contexts/LanguageContext";

// Computer Vision Detection Engine
class CVDetectionEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private detectionCallbacks: ((detections: any[]) => void)[] = [];
  private lastDetectionTime = 0;
  private detectionCooldown = 3000; // 3 seconds between detections
  private recentDetections: Map<string, number> = new Map(); // Track recent detections by type
  private detectionSuppressionTime = 10000; // 10 seconds suppression for same hazard type

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  // Analyze video frame for safety violations
  analyzeFrame(video: HTMLVideoElement): Promise<any[]> {
    return new Promise((resolve) => {
      if (!video.videoWidth || !video.videoHeight) {
        resolve([]);
        return;
      }

      this.canvas.width = video.videoWidth;
      this.canvas.height = video.videoHeight;
      this.ctx.drawImage(video, 0, 0);

      const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      const detections = this.performDetection(imageData);

      resolve(detections);
    });
  }

  // Advanced detection algorithms with suppression logic
  private performDetection(imageData: ImageData): any[] {
    const detections: any[] = [];
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const currentTime = Date.now();

    // Check if we should suppress detections based on cooldown
    if (currentTime - this.lastDetectionTime < this.detectionCooldown) {
      return [];
    }

    // 1. Detect exposed wires (looking for thin dark lines) - BALANCED DETECTION
    const wireDetection = this.detectExposedWires(data, width, height);
    if (wireDetection.confidence > 0.5) { // Balanced threshold to avoid false positives
      detections.push({
        type: 'exposed_wire',
        name: 'Kabel Listrik Terbuka',
        confidence: wireDetection.confidence,
        position: wireDetection.position,
        riskLevel: 'high',
        category: 'electrical'
      });
    }

    // 2. Detect missing PPE (looking for skin color in work areas) - BALANCED
    const ppeDetection = this.detectMissingPPE(data, width, height);
    if (ppeDetection.confidence > 0.4) { // Balanced threshold with comprehensive validation
      detections.push({
        type: 'missing_ppe',
        name: 'Pekerja Tanpa APD',
        confidence: ppeDetection.confidence,
        position: ppeDetection.position,
        riskLevel: 'critical',
        category: 'safety'
      });
    }

    // 3. Detect cluttered workspace (looking for scattered objects) - ENHANCED FOR CABLES
    const clutterDetection = this.detectClutteredWorkspace(data, width, height);
    if (clutterDetection.confidence > 0.3) { // Lowered for better clutter detection
      detections.push({
        type: 'cluttered_workspace',
        name: 'Area Kerja Berantakan',
        confidence: clutterDetection.confidence,
        position: clutterDetection.position,
        riskLevel: 'medium',
        category: 'organization'
      });
    }

    // 4. Detect unsafe object placement (looking for objects in walkways) - BALANCED DETECTION
    const unsafePlacementDetection = this.detectUnsafeObjectPlacement(data, width, height);
    if (unsafePlacementDetection.confidence > 0.6) { // Higher threshold to avoid false positives
      detections.push({
        type: 'unsafe_placement',
        name: 'Penempatan Barang Tidak Aman',
        confidence: unsafePlacementDetection.confidence,
        position: unsafePlacementDetection.position,
        riskLevel: 'high',
        category: 'organization'
      });
    }

    // 5. Detect fire hazards (looking for red/orange colors indicating heat/fire) - HIGHEST THRESHOLD
    const fireHazardDetection = this.detectFireHazards(data, width, height);
    if (fireHazardDetection.confidence > 0.85) { // Increased from 0.8
      detections.push({
        type: 'fire_hazard',
        name: 'Potensi Bahaya Kebakaran',
        confidence: fireHazardDetection.confidence,
        position: fireHazardDetection.position,
        riskLevel: 'critical',
        category: 'fire'
      });
    }

    // Filter out recently detected hazards to avoid spam
    const filteredDetections = detections.filter(detection => {
      const lastDetected = this.recentDetections.get(detection.type);
      if (lastDetected && (currentTime - lastDetected) < this.detectionSuppressionTime) {
        return false; // Skip this detection type if detected recently
      }
      return true;
    });

    // Update recent detections map and last detection time
    if (filteredDetections.length > 0) {
      filteredDetections.forEach(detection => {
        this.recentDetections.set(detection.type, currentTime);
      });
      this.lastDetectionTime = currentTime;
    }

    return filteredDetections;
  }

  // Detect exposed wires using improved edge detection
  private detectExposedWires(data: Uint8ClampedArray, width: number, height: number) {
    let wirePixels = 0;
    let totalEdges = 0;
    let avgX = 0, avgY = 0;
    let lineSegments = 0;

    for (let y = 2; y < height - 2; y++) {
      for (let x = 2; x < width - 2; x++) {
        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        // Enhanced edge detection with better thresholds
        const gx = Math.abs(data[((y-1)*width+(x-1))*4] - data[((y-1)*width+(x+1))*4]);
        const gy = Math.abs(data[((y-1)*width+x)*4] - data[((y+1)*width+x)*4]);
        const edge = Math.sqrt(gx*gx + gy*gy);

        if (edge > 40) { // Lowered threshold for better cable detection
          totalEdges++;

          // Enhanced wire detection criteria for various cable types
          const isDarkLine = r < 80 && g < 80 && b < 80; // Relaxed for black cables
          const isMetallic = Math.abs(r - g) < 30 && Math.abs(g - b) < 30 && r > 60; // Metallic colors
          const isColoredWire = (r > 120 && g < 120 && b < 120) || // Red wire
                               (g > 120 && r < 120 && b < 120) || // Green wire
                               (b > 120 && r < 120 && g < 120) || // Blue wire
                               (r > 120 && g > 120 && b < 120) || // Yellow wire
                               (r > 100 && g > 100 && b > 100 && Math.abs(r-g) < 40); // Gray cables

          if (isDarkLine || isMetallic || isColoredWire) {
            // Check for line continuity (wire-like patterns)
            let continuity = 0;
            for (let dx = -2; dx <= 2; dx++) {
              for (let dy = -2; dy <= 2; dy++) {
                if (x + dx >= 0 && x + dx < width && y + dy >= 0 && y + dy < height) {
                  const checkIdx = ((y + dy) * width + (x + dx)) * 4;
                  const checkR = data[checkIdx];
                  const checkG = data[checkIdx + 1];
                  const checkB = data[checkIdx + 2];

                  if (Math.abs(checkR - r) < 30 && Math.abs(checkG - g) < 30 && Math.abs(checkB - b) < 30) {
                    continuity++;
                  }
                }
              }
            }

            if (continuity > 5) { // Relaxed continuity for scattered cables
              wirePixels++;
              avgX += x;
              avgY += y;

              // Check for line segments
              if (continuity > 8) { // Relaxed line segment requirement
                lineSegments++;
              }
            }
          }
        }
      }
    }

    // Stricter confidence calculation to avoid false positives
    const minWirePixels = width * height * 0.001; // Increased minimum pixels requirement
    const hasLineSegments = lineSegments > 5; // Stricter line segment requirement
    const edgeDensity = totalEdges / (width * height);
    const wireToEdgeRatio = totalEdges > 0 ? wirePixels / totalEdges : 0;

    let confidence = 0;
    // Much stricter requirements: need significant wire pixels, multiple line segments,
    // reasonable edge density, and good wire-to-edge ratio
    if (wirePixels > minWirePixels && hasLineSegments && edgeDensity < 0.3 &&
        wireToEdgeRatio > 0.1 && wirePixels > 50) {
      confidence = Math.min((wirePixels / minWirePixels) * 0.3, 0.7); // Reduced max confidence
    }

    return {
      confidence,
      position: wirePixels > 0 ? {
        x: (avgX / wirePixels / width) * 100,
        y: (avgY / wirePixels / height) * 100
      } : { x: 50, y: 50 }
    };
  }

  // Detect missing PPE with human shape detection
  private detectMissingPPE(data: Uint8ClampedArray, width: number, height: number) {
    let skinPixels = 0;
    let skinClusters = 0;
    let totalPixels = width * height;
    let avgX = 0, avgY = 0;
    let handAreaSkin = 0;
    let headAreaSkin = 0;
    let humanShapeScore = 0;

    // Focus on specific body areas where PPE should be worn
    const handAreaY = Math.floor(height * 0.6); // Lower 40% for hands
    const headAreaY = Math.floor(height * 0.3); // Upper 30% for head

    // Create skin map for shape analysis
    const skinMap: boolean[][] = Array(height).fill(null).map(() => Array(width).fill(false));

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        // Enhanced skin color detection
        if (this.isSkinColor(r, g, b)) {
          skinMap[y][x] = true;
          skinPixels++;
          avgX += x;
          avgY += y;

          // Count skin in specific areas
          if (y > handAreaY) {
            handAreaSkin++;
          }
          if (y < headAreaY) {
            headAreaSkin++;
          }

          // Check for skin clusters (connected skin regions)
          let neighboringSkin = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (x + dx >= 0 && x + dx < width && y + dy >= 0 && y + dy < height) {
                const neighborIdx = ((y + dy) * width + (x + dx)) * 4;
                if (this.isSkinColor(data[neighborIdx], data[neighborIdx + 1], data[neighborIdx + 2])) {
                  neighboringSkin++;
                }
              }
            }
          }

          if (neighboringSkin > 5) {
            skinClusters++;
          }
        }
      }
    }

    // Human shape detection - look for vertical arrangement of skin regions
    if (skinPixels > 0) {
      humanShapeScore = this.analyzeHumanShape(skinMap, width, height);
    }

    // Motion detection - check if skin regions are in human-like proportions
    const aspectRatioScore = this.checkHumanProportions(skinMap, width, height);

    // Very strict confidence calculation with human shape validation
    const skinDensity = skinPixels / totalPixels;
    const hasSignificantSkinClusters = skinClusters > (skinPixels * 0.4); // Increased from 0.3
    const hasHandExposure = handAreaSkin > (width * height * 0.015); // Balanced threshold for hands
    const hasHeadExposure = headAreaSkin > (width * height * 0.008); // Balanced threshold for head
    const hasHumanShape = humanShapeScore > 0.3; // Balanced - require reasonable human shape
    const hasHumanProportions = aspectRatioScore > 0.4; // Balanced - require reasonable proportions
    const hasMinimumSkinArea = skinPixels > (width * height * 0.015); // Require at least 1.5% skin

    let confidence = 0;

    // Balanced requirements - reasonable validation for real human detection
    if (hasSignificantSkinClusters && hasHumanShape && hasHumanProportions &&
        hasMinimumSkinArea && (hasHandExposure || hasHeadExposure) && skinDensity > 0.005) {

      // Optional clothing context validation (not mandatory)
      const hasClothingContext = this.detectClothingContext(data, width, height, skinMap);
      const contextMultiplier = hasClothingContext ? 1.0 : 0.7; // Reduce confidence if no clothing context

      if (hasHandExposure && hasHeadExposure) {
        confidence = Math.min(skinDensity * 20 * humanShapeScore * contextMultiplier, 0.9);
      } else if (hasHandExposure) {
        confidence = Math.min(skinDensity * 15 * humanShapeScore * contextMultiplier, 0.7);
      } else if (hasHeadExposure) {
        confidence = Math.min(skinDensity * 12 * humanShapeScore * contextMultiplier, 0.6);
      }
    }

    return {
      confidence,
      position: skinPixels > 0 ? {
        x: (avgX / skinPixels / width) * 100,
        y: (avgY / skinPixels / height) * 100
      } : { x: 50, y: 30 }
    };
  }

  // Analyze if skin regions form human-like shape
  private analyzeHumanShape(skinMap: boolean[][], width: number, height: number): number {
    let shapeScore = 0;
    const centerX = Math.floor(width / 2);

    // Look for head region (top 30%)
    let headRegions = 0;
    for (let y = 0; y < height * 0.3; y++) {
      for (let x = centerX - width * 0.1; x < centerX + width * 0.1; x++) {
        if (x >= 0 && x < width && skinMap[y] && skinMap[y][Math.floor(x)]) {
          headRegions++;
        }
      }
    }

    // Look for torso region (middle 40%)
    let torsoRegions = 0;
    for (let y = height * 0.3; y < height * 0.7; y++) {
      for (let x = centerX - width * 0.15; x < centerX + width * 0.15; x++) {
        if (x >= 0 && x < width && skinMap[y] && skinMap[y][Math.floor(x)]) {
          torsoRegions++;
        }
      }
    }

    // Look for hand/arm regions (sides)
    let armRegions = 0;
    for (let y = height * 0.4; y < height * 0.8; y++) {
      // Left side
      for (let x = 0; x < width * 0.3; x++) {
        if (skinMap[y] && skinMap[y][x]) armRegions++;
      }
      // Right side
      for (let x = width * 0.7; x < width; x++) {
        if (skinMap[y] && skinMap[y][x]) armRegions++;
      }
    }

    // Calculate shape score based on human-like distribution
    const totalSkinPixels = headRegions + torsoRegions + armRegions;
    if (totalSkinPixels > 0) {
      const headRatio = headRegions / totalSkinPixels;
      const torsoRatio = torsoRegions / totalSkinPixels;
      const armRatio = armRegions / totalSkinPixels;

      // Human-like ratios: head ~20%, torso ~50%, arms ~30%
      if (headRatio > 0.1 && headRatio < 0.4 && torsoRatio > 0.3 && armRatio > 0.1) {
        shapeScore = Math.min((headRatio + torsoRatio + armRatio) / 3, 1);
      }
    }

    return shapeScore;
  }

  // Check if skin regions have human-like proportions
  private checkHumanProportions(skinMap: boolean[][], width: number, height: number): number {
    let minX = width, maxX = 0, minY = height, maxY = 0;
    let skinCount = 0;

    // Find bounding box of skin regions
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (skinMap[y] && skinMap[y][x]) {
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
          skinCount++;
        }
      }
    }

    if (skinCount === 0) return 0;

    const skinWidth = maxX - minX;
    const skinHeight = maxY - minY;
    const aspectRatio = skinHeight / skinWidth;

    // Human proportions: height should be 1.5-3x width
    if (aspectRatio >= 1.2 && aspectRatio <= 4 && skinWidth > width * 0.1 && skinHeight > height * 0.2) {
      return Math.min(aspectRatio / 2, 1);
    }

    return 0;
  }

  // Detect clothing context around skin regions
  private detectClothingContext(data: Uint8ClampedArray, width: number, height: number, skinMap: boolean[][]): boolean {
    let clothingPixels = 0;
    let totalChecked = 0;

    // Look for clothing colors around skin regions
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (skinMap[y] && skinMap[y][x]) {
          // Check surrounding pixels for clothing-like colors
          for (let dy = -5; dy <= 5; dy++) {
            for (let dx = -5; dx <= 5; dx++) {
              const checkY = y + dy;
              const checkX = x + dx;
              if (checkX >= 0 && checkX < width && checkY >= 0 && checkY < height) {
                const idx = (checkY * width + checkX) * 4;
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];

                totalChecked++;

                // Look for clothing-like colors (not skin, not background)
                if (!this.isSkinColor(r, g, b) && !this.isBackgroundColor(r, g, b)) {
                  clothingPixels++;
                }
              }
            }
          }
        }
      }
    }

    // Require significant clothing context around skin
    return totalChecked > 0 && (clothingPixels / totalChecked) > 0.3;
  }

  // Helper to detect background colors
  private isBackgroundColor(r: number, g: number, b: number): boolean {
    // Very bright (overexposed) or very dark areas
    const brightness = (r + g + b) / 3;
    return brightness > 240 || brightness < 30;
  }

  // Enhanced cluttered workspace detection for cables and objects
  private detectClutteredWorkspace(data: Uint8ClampedArray, width: number, height: number) {
    let variance = 0;
    let mean = 0;
    let totalPixels = width * height;
    let edgeCount = 0;
    let objectCount = 0;

    // Calculate mean brightness
    for (let i = 0; i < data.length; i += 4) {
      mean += (data[i] + data[i + 1] + data[i + 2]) / 3;
    }
    mean /= totalPixels;

    // Enhanced analysis for clutter detection
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const brightness = (r + g + b) / 3;

        // Calculate variance
        variance += Math.pow(brightness - mean, 2);

        // Detect edges (indicating objects/cables)
        const gx = Math.abs(data[((y-1)*width+(x-1))*4] - data[((y-1)*width+(x+1))*4]);
        const gy = Math.abs(data[((y-1)*width+x)*4] - data[((y+1)*width+x)*4]);
        const edge = Math.sqrt(gx*gx + gy*gy);

        if (edge > 30) { // Lower threshold for edge detection
          edgeCount++;
        }

        // Detect scattered objects (non-floor colors)
        if (!this.isFloorColor(r, g, b) && brightness > 50 && brightness < 200) {
          objectCount++;
        }
      }
    }

    variance /= totalPixels;

    // Enhanced confidence calculation
    const varianceScore = Math.min(variance / 8000, 1); // Lowered threshold
    const edgeScore = Math.min(edgeCount / (totalPixels * 0.1), 1);
    const objectScore = Math.min(objectCount / (totalPixels * 0.05), 1);

    const confidence = Math.max(varianceScore, edgeScore, objectScore * 0.8);

    return {
      confidence,
      position: { x: 50, y: 70 }
    };
  }

  // Enhanced unsafe object placement detection for cables and obstacles
  private detectUnsafeObjectPlacement(data: Uint8ClampedArray, width: number, height: number) {
    let obstaclePixels = 0;
    let cablePixels = 0;
    let floorArea = 0;
    let avgX = 0, avgY = 0;

    // Focus on bottom half of image (floor area where people walk)
    const startY = Math.floor(height * 0.5);

    for (let y = startY; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        floorArea++;

        // Detect objects on floor (non-floor colors)
        if (!this.isFloorColor(r, g, b)) {
          obstaclePixels++;
          avgX += x;
          avgY += y;

          // Specifically detect cables on floor
          const isDarkCable = r < 80 && g < 80 && b < 80;
          const isColoredCable = (r > 100 && g < 100 && b < 100) ||
                                (g > 100 && r < 100 && b < 100) ||
                                (b > 100 && r < 100 && g < 100);

          if (isDarkCable || isColoredCable) {
            cablePixels++;
          }
        }
      }
    }

    // Stricter confidence calculation to avoid false positives
    const obstacleRatio = floorArea > 0 ? obstaclePixels / floorArea : 0;
    const cableRatio = floorArea > 0 ? cablePixels / floorArea : 0;

    // Much stricter thresholds to avoid false positives
    let confidence = 0;
    if (cableRatio > 0.03 && cablePixels > 100) { // Significant cables on floor
      confidence = Math.min(cableRatio * 15, 0.8);
    } else if (obstacleRatio > 0.1 && obstaclePixels > 200) { // Significant obstacles
      confidence = Math.min(obstacleRatio * 6, 0.7);
    }

    return {
      confidence,
      position: obstaclePixels > 0 ? {
        x: (avgX / obstaclePixels / width) * 100,
        y: (avgY / obstaclePixels / height) * 100
      } : { x: 50, y: 80 }
    };
  }

  // Detect fire hazards by looking for heat signatures
  private detectFireHazards(data: Uint8ClampedArray, width: number, height: number) {
    let hotPixels = 0;
    let totalPixels = width * height;
    let avgX = 0, avgY = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        // Detect hot colors (red/orange dominant)
        if (r > 180 && g > 100 && g < 180 && b < 100) {
          hotPixels++;
          avgX += x;
          avgY += y;
        }
      }
    }

    const confidence = hotPixels > 0 ? Math.min(hotPixels / (totalPixels * 0.01), 1) : 0;
    return {
      confidence,
      position: hotPixels > 0 ? {
        x: (avgX / hotPixels / width) * 100,
        y: (avgY / hotPixels / height) * 100
      } : { x: 50, y: 50 }
    };
  }

  // Enhanced helper function to detect skin color with better accuracy
  private isSkinColor(r: number, g: number, b: number): boolean {
    // Multiple skin tone detection algorithms

    // Algorithm 1: Traditional RGB skin detection
    const traditional = r > 95 && g > 40 && b > 20 &&
                       r > g && r > b &&
                       Math.abs(r - g) > 15 &&
                       r - b > 15;

    // Algorithm 2: HSV-based skin detection (converted from RGB)
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let h = 0;
    if (delta !== 0) {
      if (max === r) h = ((g - b) / delta) % 6;
      else if (max === g) h = (b - r) / delta + 2;
      else h = (r - g) / delta + 4;
    }
    h = h * 60;
    if (h < 0) h += 360;

    const s = max === 0 ? 0 : delta / max;
    const v = max / 255;

    const hsvSkin = (h >= 0 && h <= 50) && s >= 0.23 && s <= 0.68 && v >= 0.35 && v <= 0.95;

    // Algorithm 3: YCbCr color space (more robust for different lighting)
    const y = 0.299 * r + 0.587 * g + 0.114 * b;
    const cb = -0.169 * r - 0.331 * g + 0.5 * b + 128;
    const cr = 0.5 * r - 0.419 * g - 0.081 * b + 128;

    const ycbcrSkin = y > 80 && cb >= 77 && cb <= 127 && cr >= 133 && cr <= 173;

    // Algorithm 4: Normalized RGB
    const sum = r + g + b;
    if (sum === 0) return false;

    const nr = r / sum;
    const ng = g / sum;
    const nb = b / sum;

    const normalizedSkin = nr > 0.36 && ng > 0.28 && ng < 0.363 && nb < 0.32;

    // Balanced - require at least 2 algorithms to agree for better detection
    const votes = [traditional, hsvSkin, ycbcrSkin, normalizedSkin].filter(Boolean).length;

    // Additional brightness check to avoid false positives from bright surfaces
    const brightness = (r + g + b) / 3;
    const isReasonableBrightness = brightness > 60 && brightness < 200;

    return votes >= 2 && isReasonableBrightness;
  }

  // Enhanced helper function to detect floor color
  private isFloorColor(r: number, g: number, b: number): boolean {
    // Typical floor colors (gray, brown, white, concrete, tiles)
    const isGray = Math.abs(r - g) < 40 && Math.abs(g - b) < 40 && Math.abs(r - b) < 40 && r > 80 && r < 180;
    const isBrown = r > 80 && g > 50 && b < 100 && r > g && g >= b;
    const isWhite = r > 180 && g > 180 && b > 180;
    const isConcrete = Math.abs(r - g) < 30 && Math.abs(g - b) < 30 && r > 100 && r < 160;
    const isTile = Math.abs(r - g) < 50 && Math.abs(g - b) < 50 && r > 120 && r < 200;

    // Very bright areas (overexposed floor)
    const isBright = r > 220 && g > 220 && b > 220;

    return isGray || isBrown || isWhite || isConcrete || isTile || isBright;
  }
}

export function ARScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [detectedHazards, setDetectedHazards] = useState<any[]>([]);
  const [currentLocation, setCurrentLocation] = useState("Bengkel TKR");
  const [cvDetections, setCvDetections] = useState<any[]>([]);
  const [isAutoDetectionEnabled, setIsAutoDetectionEnabled] = useState(true);
  const [detectionSensitivity, setDetectionSensitivity] = useState(0.7);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cvEngineRef = useRef<CVDetectionEngine | null>(null);
  const [sessionId, setSessionId] = useState<any>(null);
  const { t } = useLanguage();

  const startARSession = useMutation(api.ar.startARSession);
  const endARSession = useMutation(api.ar.endARSession);
  const hazards = useQuery(api.hazards.listHazards, { area: currentLocation });
  const searchHazards = useQuery(api.hazards.searchHazardsByKeywords, { keywords: [], area: currentLocation });

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Initialize CV Detection Engine
      if (!cvEngineRef.current) {
        cvEngineRef.current = new CVDetectionEngine();
      }

      const deviceInfo = {
        userAgent: navigator.userAgent,
        hasCamera: true,
        hasGyroscope: 'DeviceOrientationEvent' in window,
      };

      const newSessionId = await startARSession({
        location: currentLocation,
        deviceInfo,
      });

      setSessionId(newSessionId);
      setIsScanning(true);
      toast.success(t('ar.start_scanning'));
    } catch (error) {
      toast.error(t('ar.camera_access'));
      console.error("Camera error:", error);
    }
  };

  const stopCamera = async () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }

    if (sessionId) {
      await endARSession({
        sessionId,
        hazardsDetected: detectedHazards.map(h => h._id),
      });
    }

    setIsScanning(false);
    setDetectedHazards([]);
    setSessionId(null);
    toast.success(t('ar.stop_scanning'));
  };

  // Enhanced hazard detection with visual scanning simulation
  const simulateHazardDetection = () => {
    if (!hazards || hazards.length === 0) {
      // Show message if no hazards available
      toast.info('⚠️ No hazard data available. Please add hazards to database first.');
      return;
    }

    // Enhanced object detection simulation based on location
    const locationBasedObjects = {
      "Bengkel TKR": ["wire", "electrical", "cable", "battery", "engine"],
      "Bengkel Mesin": ["machinery", "metal", "oil", "cutting", "welding"],
      "Bengkel Elind": ["circuit", "electronic", "voltage", "component", "wire"],
      "Bengkel TSM": ["fuel", "gasoline", "engine", "exhaust", "transmission"],
      "Bengkel TKI": ["computer", "server", "cable", "monitor", "network"],
      "Gudang": ["storage", "box", "chemical", "material", "equipment"],
      "Other": ["general", "floor", "lighting", "ventilation", "safety"]
    };

    const currentObjects = locationBasedObjects[currentLocation as keyof typeof locationBasedObjects] || [];

    // Increase detection probability - 80% chance of finding something
    if (Math.random() < 0.8) {
      const randomObject = currentObjects[Math.floor(Math.random() * currentObjects.length)];

      const matchingHazards = hazards.filter(hazard =>
        hazard.detectionKeywords.some(keyword =>
          keyword.toLowerCase().includes(randomObject.toLowerCase()) ||
          randomObject.toLowerCase().includes(keyword.toLowerCase())
        )
      );

      // If no matching hazards for location, use any hazard for demo
      const availableHazards = matchingHazards.length > 0 ? matchingHazards : hazards;

      if (availableHazards.length > 0) {
        const hazardToAdd = availableHazards[Math.floor(Math.random() * availableHazards.length)];

        if (!detectedHazards.find(h => h._id === hazardToAdd._id)) {
          setDetectedHazards(prev => [...prev, {
            ...hazardToAdd,
            detectedAt: Date.now(),
            position: {
              x: Math.random() * 80 + 10, // 10-90% from left
              y: Math.random() * 60 + 20  // 20-80% from top
            }
          }]);

          // Enhanced notification with sound
          toast.warning(`⚠️ ${t('ar.hazard_detected')}: ${hazardToAdd.name}`, {
            duration: 4000,
            action: {
              label: t('common.view'),
              onClick: () => console.log('View hazard details')
            }
          });

          // Vibrate if supported
          if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200]);
          }
        } else {
          // If hazard already detected, show message
          toast.info('🔍 Hazard already detected. Clear detected hazards to test again.');
        }
      }
    } else {
      // Show message when detection fails due to probability
      toast.info('🔍 No hazards detected in this scan. Try again!');
    }
  };

  // Sample hazards for testing when database is empty
  const sampleHazards = [
    {
      _id: 'sample-1',
      name: 'Kabel Listrik Terbuka',
      description: 'Kabel listrik yang tidak terlindungi',
      category: 'electrical',
      riskLevel: 'high',
      location: currentLocation,
      detectionKeywords: ['wire', 'electrical', 'cable']
    },
    {
      _id: 'sample-2',
      name: 'Lantai Licin',
      description: 'Lantai yang licin karena tumpahan oli',
      category: 'slip',
      riskLevel: 'medium',
      location: currentLocation,
      detectionKeywords: ['floor', 'oil', 'slip']
    },
    {
      _id: 'sample-3',
      name: 'Mesin Tanpa Pelindung',
      description: 'Mesin yang beroperasi tanpa safety guard',
      category: 'machinery',
      riskLevel: 'critical',
      location: currentLocation,
      detectionKeywords: ['machinery', 'equipment', 'cutting']
    }
  ];

  // Force detection for testing - always works
  const forceDetection = () => {
    console.log('🔍 Force detection triggered!');
    console.log('Hazards from database:', hazards?.length || 0);
    console.log('Currently detected hazards:', detectedHazards.length);

    const availableHazards = hazards && hazards.length > 0 ? hazards : sampleHazards;
    const undetectedHazards = availableHazards.filter(h => !detectedHazards.find(d => d._id === h._id));

    console.log('Available hazards for detection:', undetectedHazards.length);

    if (undetectedHazards.length === 0) {
      toast.info('🔍 All hazards already detected. Clear detected hazards to test again.');
      return;
    }

    const hazardToAdd = undetectedHazards[Math.floor(Math.random() * undetectedHazards.length)];

    setDetectedHazards(prev => [...prev, {
      ...hazardToAdd,
      detectedAt: Date.now(),
      position: {
        x: Math.random() * 80 + 10, // 10-90% from left
        y: Math.random() * 60 + 20  // 20-80% from top
      }
    }]);

    // Enhanced notification with sound
    toast.success(`✅ ${t('ar.hazard_detected')}: ${hazardToAdd.name}`, {
      duration: 4000,
      action: {
        label: t('common.view'),
        onClick: () => console.log('View hazard details')
      }
    });

    // Vibrate if supported
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
  };

  // Smart auto detection - avoid spam and focus on new hazard types
  const performAutoDetection = async () => {
    if (!videoRef.current || !cvEngineRef.current || !isAutoDetectionEnabled) return;

    try {
      const detections = await cvEngineRef.current.analyzeFrame(videoRef.current);

      // Get already detected hazard types
      const detectedTypes = detectedHazards.map(h => h.type);
      const recentlyDetectedTypes = detectedHazards
        .filter(h => Date.now() - h.detectedAt < 30000) // 30 seconds cooldown per type
        .map(h => h.type);

      // Prioritize undetected hazard types
      const undetectedHazards = detections.filter(d =>
        !detectedTypes.includes(d.type) &&
        d.confidence >= detectionSensitivity
      );

      // If no new types, allow re-detection of types not seen recently
      const availableHazards = undetectedHazards.length > 0
        ? undetectedHazards
        : detections.filter(d =>
            !recentlyDetectedTypes.includes(d.type) &&
            d.confidence >= detectionSensitivity
          );

      // Process only the highest confidence detection to avoid spam
      if (availableHazards.length > 0) {
        const bestDetection = availableHazards.reduce((best, current) =>
          current.confidence > best.confidence ? current : best
        );

        const newHazard = {
          _id: `cv_${bestDetection.type}_${Date.now()}`,
          name: bestDetection.name,
          description: `Terdeteksi otomatis: ${bestDetection.name}`,
          category: bestDetection.category,
          riskLevel: bestDetection.riskLevel,
          location: currentLocation,
          detectedAt: Date.now(),
          position: bestDetection.position,
          confidence: bestDetection.confidence,
          detectionMethod: 'computer_vision',
          type: bestDetection.type
        };

        setDetectedHazards(prev => [...prev, newHazard]);

        // Enhanced notification with priority indicator
        const isNewType = !detectedTypes.includes(bestDetection.type);
        const priorityIcon = isNewType ? '🆕' : '🔄';

        toast.warning(`${priorityIcon} ${t('ar.hazard_detected')}: ${bestDetection.name}`, {
          duration: 5000,
          description: `Confidence: ${Math.round(bestDetection.confidence * 100)}% | ${isNewType ? 'New Type' : 'Re-detected'}`,
          action: {
            label: t('common.view'),
            onClick: () => console.log('View CV detection details', bestDetection)
          }
        });

        // Vibrate if supported
        if ('vibrate' in navigator) {
          navigator.vibrate(isNewType ? [300, 100, 300, 100, 300] : [200, 100, 200]);
        }

        console.log('🤖 Smart CV Detection:', {
          type: bestDetection.type,
          confidence: Math.round(bestDetection.confidence * 100) + '%',
          isNewType,
          totalDetectedTypes: detectedTypes.length,
          availableHazards: availableHazards.length
        });
      }

      setCvDetections(detections);
    } catch (error) {
      console.error('CV Detection error:', error);
    }
  };

  useEffect(() => {
    if (isScanning) {
      // Start both traditional and CV detection
      simulateHazardDetection();
      performAutoDetection();

      // Adaptive intervals based on detected hazards count
      const detectedTypesCount = [...new Set(detectedHazards.map(h => h.type))].length;
      const maxHazardTypes = 5; // exposed_wire, missing_ppe, cluttered_workspace, unsafe_placement, fire_hazard

      // Slow down detection as more types are found
      const traditionalInterval = setInterval(simulateHazardDetection, 5000); // Reduced frequency
      const cvIntervalTime = detectedTypesCount >= maxHazardTypes ? 10000 : 3000; // Slow down when all types found
      const cvInterval = setInterval(performAutoDetection, cvIntervalTime);

      console.log(`🔍 Detection intervals: Traditional=${5000}ms, CV=${cvIntervalTime}ms (${detectedTypesCount}/${maxHazardTypes} types found)`);

      return () => {
        clearInterval(traditionalInterval);
        clearInterval(cvInterval);
      };
    }
  }, [isScanning, hazards, currentLocation, isAutoDetectionEnabled, detectionSensitivity, detectedHazards.length]);

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "critical": return "text-red-600 bg-red-100";
      case "high": return "text-orange-600 bg-orange-100";
      case "medium": return "text-yellow-600 bg-yellow-100";
      case "low": return "text-green-600 bg-green-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Camera View */}
      <div className="flex-1 relative bg-black">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        />
        
        {/* Enhanced AR Overlay */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Scanning grid overlay */}
            <div className="absolute inset-0 opacity-30">
              <svg className="w-full h-full">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00ff00" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            {/* Scanning crosshair */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-8 h-8 border-2 border-green-400 rounded-full animate-ping"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 border-2 border-green-400 rounded-full"></div>
            </div>

            {/* Scanning indicator with animation */}
            <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-gradient-to-r from-green-500 to-blue-500 text-white px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-medium shadow-lg animate-pulse">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                🔍 {t('ar.start_scanning')}...
              </div>
            </div>

            {/* AI Detection Status */}
            {isAutoDetectionEnabled && (
              <div className="absolute top-2 md:top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                  🤖 AI Detection
                </div>
              </div>
            )}

            {/* Location indicator with enhanced styling */}
            <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 md:px-4 py-2 rounded-full text-xs md:text-sm shadow-lg">
              📍 {currentLocation}
            </div>

            {/* Hazard count indicator */}
            {detectedHazards.length > 0 && (
              <div className="absolute top-12 md:top-16 left-2 md:left-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                ⚠️ {detectedHazards.length} {t('ar.hazards_found')}
              </div>
            )}

            {/* Enhanced detected hazards overlay with positioning */}
            {detectedHazards.map((hazard, index) => (
              <div
                key={hazard._id}
                className="absolute animate-bounce"
                style={{
                  top: `${hazard.position?.y || (20 + index * 15)}%`,
                  left: `${hazard.position?.x || 50}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {/* Hazard marker with different styles for CV vs traditional detection */}
                <div className="relative">
                  {hazard.detectionMethod === 'computer_vision' ? (
                    <>
                      <div className="absolute inset-0 bg-purple-500 rounded-full animate-ping opacity-75 w-8 h-8"></div>
                      <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold shadow-lg border-2 border-white">
                        🤖
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75 w-6 h-6"></div>
                      <div className="relative bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg">
                        ⚠️
                      </div>
                    </>
                  )}
                </div>

                {/* Hazard info popup with enhanced info for CV detections */}
                <div className={`absolute top-10 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-90 text-white p-3 rounded-lg shadow-xl max-w-xs min-w-max ${
                  hazard.detectionMethod === 'computer_vision' ? 'border-2 border-purple-400' : ''
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {hazard.detectionMethod === 'computer_vision' ? '🤖' : '⚠️'}
                    </span>
                    <div>
                      <div className="font-semibold text-sm">{hazard.name}</div>
                      <div className="text-xs opacity-90">{t(`category.${hazard.category}`)}</div>
                      {hazard.confidence && (
                        <div className="text-xs text-purple-300 mt-1">
                          AI Confidence: {Math.round(hazard.confidence * 100)}%
                        </div>
                      )}
                      <div className={`text-xs px-2 py-1 rounded mt-1 ${getRiskColor(hazard.riskLevel)}`}>
                        {t(`risk.${hazard.riskLevel}`).toUpperCase()}
                      </div>
                      {hazard.detectionMethod === 'computer_vision' && (
                        <div className="text-xs text-purple-200 mt-1 italic">
                          Detected by AI Computer Vision
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Arrow pointing to marker */}
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-black border-opacity-90"></div>
                </div>
              </div>
            ))}

            {/* Scanning progress bar */}
            <div className="absolute bottom-20 left-4 right-4">
              <div className="bg-black bg-opacity-50 rounded-full p-2">
                <div className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full animate-pulse"></div>
              </div>
              <div className="text-center text-white text-xs mt-1 font-medium">
                {t('ar.scanning_environment')}...
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-white border-t p-3 md:p-4">
        <div className="flex flex-col gap-3 md:gap-4">
          {/* Location selector */}
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
              {t('ar.location')}
            </label>
            <select
              value={currentLocation}
              onChange={(e) => setCurrentLocation(e.target.value)}
              className="input-modern w-full text-sm md:text-base"
              disabled={isScanning}
            >
              <option value="Bengkel TKR">{t('location.bengkel_tkr')}</option>
              <option value="Bengkel Mesin">{t('location.bengkel_mesin')}</option>
              <option value="Bengkel Elind">{t('location.bengkel_elind')}</option>
              <option value="Bengkel TSM">{t('location.bengkel_tsm')}</option>
              <option value="Bengkel TKI">{t('location.bengkel_tki')}</option>
              <option value="Gudang">{t('location.warehouse')}</option>
              <option value="Other">{t('location.other')}</option>
            </select>
          </div>

          {/* Scanner controls */}
          <div className="flex gap-2">
            {!isScanning ? (
              <button
                onClick={startCamera}
                className="btn-primary flex-1 py-4 md:py-3 text-sm md:text-base"
              >
                🎥 {t('ar.start_scanning')}
              </button>
            ) : (
              <>
                <button
                  onClick={stopCamera}
                  className="btn-secondary flex-1 py-4 md:py-3 text-sm md:text-base"
                  style={{background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'}}
                >
                  ⏹️ {t('ar.stop_scanning')}
                </button>
                <button
                  onClick={forceDetection}
                  className="btn-primary px-4 py-4 md:py-3 text-sm md:text-base"
                  style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}
                >
                  🔍 Test
                </button>
              </>
            )}
          </div>

          {/* Auto Detection Controls */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-blue-800">
                🤖 Auto Detection (AI Computer Vision)
              </label>
              <button
                onClick={() => setIsAutoDetectionEnabled(!isAutoDetectionEnabled)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  isAutoDetectionEnabled
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {isAutoDetectionEnabled ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="mb-2">
              <label className="text-xs text-blue-700 block mb-1">
                Detection Sensitivity: {Math.round(detectionSensitivity * 100)}%
              </label>
              <input
                type="range"
                min="0.3"
                max="0.9"
                step="0.1"
                value={detectionSensitivity}
                onChange={(e) => setDetectionSensitivity(parseFloat(e.target.value))}
                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                disabled={!isAutoDetectionEnabled}
              />
              <div className="flex justify-between text-xs text-blue-600 mt-1">
                <span>Low</span>
                <span>Medium</span>
                <span>High</span>
              </div>
            </div>

            {/* Smart Detection Status */}
            <div className="text-xs">
              <div className="mb-2 font-medium text-blue-700">🎯 Detection Progress:</div>
              <div className="grid grid-cols-1 gap-1">
                {[
                  { type: 'exposed_wire', name: 'Exposed Wires', icon: '🔌' },
                  { type: 'missing_ppe', name: 'Missing PPE', icon: '🦺' },
                  { type: 'cluttered_workspace', name: 'Cluttered Areas', icon: '📦' },
                  { type: 'unsafe_placement', name: 'Unsafe Placement', icon: '⚠️' },
                  { type: 'fire_hazard', name: 'Fire Hazards', icon: '🔥' }
                ].map(hazardType => {
                  const isDetected = detectedHazards.some(h => h.type === hazardType.type);
                  const recentlyDetected = detectedHazards.some(h =>
                    h.type === hazardType.type &&
                    Date.now() - h.detectedAt < 30000
                  );
                  return (
                    <div key={hazardType.type} className={`flex items-center justify-between p-1 rounded ${
                      isDetected ? 'bg-green-100 text-green-700' :
                      recentlyDetected ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      <span className="flex items-center gap-1">
                        <span>{hazardType.icon}</span>
                        <span>{hazardType.name}</span>
                      </span>
                      <span className="text-xs font-medium">
                        {isDetected ? '✅ Found' :
                         recentlyDetected ? '🔄 Recent' :
                         '🔍 Searching'}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 text-center text-blue-600 font-medium">
                {[...new Set(detectedHazards.map(h => h.type))].length}/5 Types Found
              </div>
            </div>
          </div>

          {/* Debug info */}
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            📊 Debug: {hazards?.length || 0} hazards in DB | {detectedHazards.length} detected |
            CV: {cvDetections.length} objects | Location: {currentLocation}
          </div>

          {/* Detection summary */}
          {detectedHazards.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-yellow-800">
                  {t('ar.detected_hazards')} ({detectedHazards.length})
                </h3>
                <button
                  onClick={() => setDetectedHazards([])}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  🗑️ Clear
                </button>
              </div>
              <div className="space-y-2">
                {detectedHazards.map((hazard) => (
                  <div key={hazard._id} className="flex justify-between items-center text-sm">
                    <span className="text-yellow-700">{hazard.name}</span>
                    <span className={`px-2 py-1 rounded text-xs ${getRiskColor(hazard.riskLevel)}`}>
                      {t(`risk.${hazard.riskLevel}`)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
