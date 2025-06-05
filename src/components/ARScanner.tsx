import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { useLanguage } from "../contexts/LanguageContext";

export function ARScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [detectedHazards, setDetectedHazards] = useState<any[]>([]);
  const [currentLocation, setCurrentLocation] = useState("Bengkel TKR");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sessionId, setSessionId] = useState<any>(null);
  const { t } = useLanguage();

  const startARSession = useMutation(api.ar.startARSession);
  const endARSession = useMutation(api.ar.endARSession);
  const hazards = useQuery(api.hazards.listHazards, { area: currentLocation });
  const searchHazards = useQuery(api.hazards.searchHazardsByKeywords, { keywords: [], area: currentLocation });

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
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
    if (!hazards || hazards.length === 0) return;

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
        }
      }
    }
  };

  useEffect(() => {
    if (isScanning) {
      // Start detection immediately, then every 1.5 seconds for faster detection
      simulateHazardDetection();
      const interval = setInterval(simulateHazardDetection, 1500);
      return () => clearInterval(interval);
    }
  }, [isScanning, hazards, currentLocation]);

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
                {/* Hazard marker with pulsing effect */}
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75 w-6 h-6"></div>
                  <div className="relative bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg">
                    ⚠️
                  </div>
                </div>

                {/* Hazard info popup */}
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white p-3 rounded-lg shadow-xl max-w-xs min-w-max">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">⚠️</span>
                    <div>
                      <div className="font-semibold text-sm">{hazard.name}</div>
                      <div className="text-xs opacity-90">{t(`category.${hazard.category}`)}</div>
                      <div className={`text-xs px-2 py-1 rounded mt-1 ${getRiskColor(hazard.riskLevel)}`}>
                        {t(`risk.${hazard.riskLevel}`).toUpperCase()}
                      </div>
                    </div>
                  </div>
                  {/* Arrow pointing to marker */}
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-black border-opacity-80"></div>
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
                  onClick={simulateHazardDetection}
                  className="btn-primary px-4 py-4 md:py-3 text-sm md:text-base"
                  style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}
                >
                  🔍 Test
                </button>
              </>
            )}
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
