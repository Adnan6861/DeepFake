import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Eye, EyeOff, Layers, Grid, Sliders, Maximize2, ShieldAlert, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { AnomalyPoint, DetectionResult, FrameAnalysis } from '../types/detection';
import { HeatmapCanvas } from './HeatmapCanvas';

interface MediaViewerProps {
  mediaUrl: string;
  mediaType: 'video' | 'image';
  mediaName: string;
  isAnalyzing: boolean;
  scanProgress: number; // 0 to 100
  detectionResult: DetectionResult | null;
  activeAnomalyId: string | null;
  onSelectAnomaly: (anomaly: AnomalyPoint | null) => void;
}

export const MediaViewer: React.FC<MediaViewerProps> = ({
  mediaUrl,
  mediaType,
  mediaName,
  isAnalyzing,
  scanProgress,
  detectionResult,
  activeAnomalyId,
  onSelectAnomaly
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(4.0); // Default simulated 4s
  const [dimensions, setDimensions] = useState({ width: 640, height: 400 });

  // Heatmap configuration
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [heatmapOpacity, setHeatmapOpacity] = useState(0.85);
  const [colorMode, setColorMode] = useState<'thermal' | 'inferno' | 'crimson'>('thermal');
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [showLandmarkMesh, setShowLandmarkMesh] = useState(true);
  const [showControlsDrawer, setShowControlsDrawer] = useState(false);

  // Resize observer to keep canvas perfectly aligned
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: Math.floor(entry.contentRect.width),
          height: Math.floor(entry.contentRect.height)
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Update current frame anomalies based on playback time
  const currentFrameData: FrameAnalysis | null = React.useMemo(() => {
    if (!detectionResult || detectionResult.frames.length === 0) return null;
    if (mediaType === 'image') return detectionResult.frames[0] || null;

    // For video, match closest frame timestamp
    const frames = detectionResult.frames;
    let closest = frames[0];
    let minDiff = 999;
    for (const f of frames) {
      const diff = Math.abs(f.timestamp - currentTime);
      if (diff < minDiff) {
        minDiff = diff;
        closest = f;
      }
    }
    return closest;
  }, [detectionResult, currentTime, mediaType]);

  // Video playback loop (handles both real HTML5 video element and simulated SVG video)
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      if (isPlaying) {
        setCurrentTime((prev) => {
          const next = prev + dt;
          if (next >= duration) {
            return 0; // loop
          }
          return next;
        });
      }
      animId = requestAnimationFrame(loop);
    };

    if (isPlaying && mediaType === 'video') {
      animId = requestAnimationFrame(loop);
    }

    return () => cancelAnimationFrame(animId);
  }, [isPlaying, duration, mediaType]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
    }
  };

  const stepFrame = (forward: boolean) => {
    const step = 0.15; // roughly 1 keyframe
    setCurrentTime((prev) => {
      const next = forward ? Math.min(duration, prev + step) : Math.max(0, prev - step);
      if (videoRef.current) videoRef.current.currentTime = next;
      return next;
    });
  };

  const currentAnomalies = currentFrameData?.anomalies || [];
  const isVideoFile = mediaUrl.startsWith('blob:') && mediaType === 'video';

  return (
    <div className="flex flex-col bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-2xl backdrop-blur-sm">
      {/* Top Media Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/70 border-b border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-2 truncate">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-slate-200 truncate">{mediaName}</span>
          <span>·</span>
          <span className="uppercase text-[11px] font-mono text-slate-500">{mediaType}</span>
        </div>

        {/* Quick Overlay Toggles */}
        <div className="flex items-center gap-2">
          {detectionResult && (
            <>
              <button
                type="button"
                onClick={() => setShowHeatmap(!showHeatmap)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded transition-colors ${
                  showHeatmap
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
                title="Toggle Heat Map Overlay"
              >
                {showHeatmap ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>Heat Map</span>
              </button>

              <button
                type="button"
                onClick={() => setShowControlsDrawer(!showControlsDrawer)}
                className={`p-1.5 rounded transition-colors ${
                  showControlsDrawer ? 'bg-slate-800 text-slate-100' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Heatmap Settings"
              >
                <Sliders className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Viewport Container */}
      <div
        ref={containerRef}
        className="relative w-full aspect-video min-h-[360px] max-h-[540px] bg-slate-950 flex items-center justify-center overflow-hidden select-none"
      >
        {/* Real Video Element if blob video URL */}
        {isVideoFile ? (
          <video
            ref={videoRef}
            src={mediaUrl}
            playsInline
            muted
            loop
            onLoadedMetadata={(e) => {
              if (e.currentTarget.duration) {
                setDuration(e.currentTarget.duration);
              }
            }}
            className="w-full h-full object-contain pointer-events-none"
          />
        ) : (
          <img
            src={mediaUrl}
            alt={mediaName}
            className="w-full h-full object-contain pointer-events-none"
          />
        )}

        {/* Real Heat Map Canvas Overlay */}
        {detectionResult && (
          <HeatmapCanvas
            anomalies={currentAnomalies}
            width={dimensions.width}
            height={dimensions.height}
            opacity={showHeatmap ? heatmapOpacity : 0}
            colorMode={colorMode}
            showBoundingBoxes={showBoundingBoxes}
            showLandmarkMesh={showLandmarkMesh}
            activeAnomalyId={activeAnomalyId}
            onSelectAnomaly={onSelectAnomaly}
          />
        )}

        {/* Live Forensic Scanning Bar Effect during Analysis */}
        {isAnalyzing && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Scan Beam */}
            <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_15px_#f43f5e] animate-scanline" />
            <div className="absolute inset-0 bg-gradient-to-b from-rose-500/5 via-transparent to-rose-500/5 pointer-events-none" />

            {/* Scanning Heads-Up Display */}
            <div className="absolute top-4 left-4 font-mono text-xs bg-slate-950/85 border border-rose-500/40 px-3 py-2 rounded text-slate-200 backdrop-blur-md">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span className="text-rose-400 font-semibold tracking-wider">NEURAL SCAN IN PROGRESS</span>
              </div>
              <div className="text-[11px] text-slate-400">
                FRAME ANALYSIS: {scanProgress}% · FFT SPECTRUM ACTIVE
              </div>
            </div>
          </div>
        )}

        {/* Visual Watermark / Coordinates */}
        <div className="absolute bottom-2 right-2 pointer-events-none font-mono text-[10px] text-slate-500/60 bg-slate-950/60 px-2 py-0.5 rounded">
          {dimensions.width} × {dimensions.height} · RGB24
        </div>
      </div>

      {/* Heatmap Customization Drawer */}
      {showControlsDrawer && detectionResult && (
        <div className="px-4 py-3 bg-slate-950/90 border-t border-slate-800 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            {/* Heatmap Opacity */}
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Heatmap Opacity</span>
                <span className="font-mono text-slate-300 tabular-nums">
                  {Math.round(heatmapOpacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={heatmapOpacity}
                onChange={(e) => setHeatmapOpacity(parseFloat(e.target.value))}
                className="w-full accent-rose-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Palette Mode */}
            <div>
              <span className="text-slate-400 block mb-1">Thermal Palette</span>
              <div className="flex items-center gap-1">
                {(['thermal', 'inferno', 'crimson'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setColorMode(mode)}
                    className={`px-2 py-1 capitalize rounded text-[11px] font-mono transition-colors ${
                      colorMode === mode
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Overlays */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={showBoundingBoxes}
                  onChange={(e) => setShowBoundingBoxes(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-rose-600 focus:ring-rose-500"
                />
                <span>Bounding Boxes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={showLandmarkMesh}
                  onChange={(e) => setShowLandmarkMesh(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-cyan-600 focus:ring-cyan-500"
                />
                <span>Facial Mesh</span>
              </label>
            </div>

            {/* Status note */}
            <div className="text-right text-[11px] text-slate-500 font-mono">
              {currentAnomalies.length} anomaly zones flagged on this frame
            </div>
          </div>
        </div>
      )}

      {/* Video Playback Bar (Shown for video types) */}
      {mediaType === 'video' && (
        <div className="px-4 py-3 bg-slate-950/80 border-t border-slate-800/80">
          <div className="flex items-center gap-3">
            {/* Play/Pause */}
            <button
              type="button"
              onClick={togglePlay}
              className="p-2 text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              title={isPlaying ? 'Pause' : 'Play Video'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>

            {/* Frame Steppers */}
            <button
              type="button"
              onClick={() => stepFrame(false)}
              className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-900 rounded"
              title="Previous Frame"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => stepFrame(true)}
              className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-900 rounded"
              title="Next Frame"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* Time Slider */}
            <div className="flex-1 flex items-center gap-2">
              <input
                type="range"
                min="0"
                max={duration}
                step="0.05"
                value={currentTime}
                onChange={handleSeek}
                className="w-full accent-rose-500 h-1.5 bg-slate-800 rounded cursor-pointer"
              />
            </div>

            {/* Timecode */}
            <div className="font-mono text-xs text-slate-400 tabular-nums shrink-0">
              {currentTime.toFixed(2)}s / {duration.toFixed(2)}s
            </div>

            {/* Reset */}
            <button
              type="button"
              onClick={() => {
                setCurrentTime(0);
                if (videoRef.current) videoRef.current.currentTime = 0;
              }}
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded"
              title="Reset Timeline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
