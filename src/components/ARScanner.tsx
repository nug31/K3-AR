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

  // Simulate hazard detection based on mock object recognition
  const simulateHazardDetection = () => {
    if (!hazards || hazards.length === 0) return;

    // Simulate detecting hazards based on keywords
    const mockDetectedObjects = ["wire", "chemical", "ladder", "machinery"];
    const randomObject = mockDetectedObjects[Math.floor(Math.random() * mockDetectedObjects.length)];
    
    const matchingHazards = hazards.filter(hazard =>
      hazard.detectionKeywords.some(keyword =>
        keyword.toLowerCase().includes(randomObject.toLowerCase())
      )
    );

    if (matchingHazards.length > 0 && !detectedHazards.find(h => h._id === matchingHazards[0]._id)) {
      setDetectedHazards(prev => [...prev, matchingHazards[0]]);
      toast.warning(`Hazard detected: ${matchingHazards[0].name}`);
    }
  };

  useEffect(() => {
    if (isScanning) {
      const interval = setInterval(simulateHazardDetection, 3000);
      return () => clearInterval(interval);
    }
  }, [isScanning, hazards]);

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
        
        {/* AR Overlay */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Scanning indicator */}
            <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-green-500 text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium">
              🔍 {t('ar.start_scanning')}...
            </div>

            {/* Location indicator */}
            <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-blue-500 text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm">
              📍 {currentLocation}
            </div>

            {/* Detected hazards overlay */}
            {detectedHazards.map((hazard, index) => (
              <div
                key={hazard._id}
                className="absolute bg-red-500 text-white p-2 rounded-lg shadow-lg max-w-xs"
                style={{
                  top: `${20 + index * 80}px`,
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">⚠️</span>
                  <div>
                    <div className="font-semibold text-sm">{hazard.name}</div>
                    <div className="text-xs opacity-90">{t(`category.${hazard.category}`)}</div>
                    <div className={`text-xs px-2 py-1 rounded mt-1 ${getRiskColor(hazard.riskLevel)}`}>
                      {t(`risk.${hazard.riskLevel}`).toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
              <button
                onClick={stopCamera}
                className="btn-secondary flex-1 py-4 md:py-3 text-sm md:text-base"
                style={{background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'}}
              >
                ⏹️ {t('ar.stop_scanning')}
              </button>
            )}
          </div>

          {/* Detection summary */}
          {detectedHazards.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <h3 className="font-medium text-yellow-800 mb-2">
                {t('ar.detected_hazards')} ({detectedHazards.length})
              </h3>
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
