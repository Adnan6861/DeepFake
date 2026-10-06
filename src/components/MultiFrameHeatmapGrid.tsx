import React, { useState } from 'react';
import { Eye, EyeOff, LayoutGrid, Maximize2, AlertTriangle, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { ExtractedFrame, AnomalyPoint, DetectionResult } from '../types/detection';
import { HeatmapCanvas } from './HeatmapCanvas';

interface MultiFrameHeatmapGridProps {
  frames: ExtractedFrame[];
  isAnalyzing: boolean;
  scanProgress: number;
  detectionResult: DetectionResult | null;
  activeAnomalyId: string | null;
  onSelectAnomaly: (anomaly: AnomalyPoint | null) => void;
}

export const MultiFrameHeatmapGrid: React.FC<MultiFrameHeatmapGridProps> = ({
  frames,
  isAnalyzing,
  scanProgress,
  detectionResult,
}) => {
  // View mode: 'grid' (multiple faces on screen) vs 'focus' (single large face)
  const [viewMode, setViewMode] = useState<'grid' | 'focus'>('grid');
  const [focusedFrameIndex, setFocusedFrameIndex] = useState<number>(0);

  // Pure clean heat map settings
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [heatmapOpacity, setHeatmapOpacity] = useState(0.85);

  const focusedFrame = frames[focusedFrameIndex] || frames[0];

  return (
    <div className="flex flex-col bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-2xl backdrop-blur-sm">
      {/* Minimal Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-950/80 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="font-semibold text-slate-200">
              Person Face Frame Extraction ({frames.length} Keyframes)
            </span>
          </div>

          <span className="text-slate-600">·</span>

          {/* View Mode Toggle */}
          <div className="inline-flex items-center p-0.5 bg-slate-900 border border-slate-800 rounded-lg">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Multi-Frame View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('focus')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                viewMode === 'focus'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Single Face Focus</span>
            </button>
          </div>
        </div>

        {/* Clean Heat Map Controls */}
        <div className="flex items-center gap-3">
          {/* Opacity slider */}
          <div className="flex items-center gap-2 text-slate-400">
            <span className="text-[11px]">Heatmap</span>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={heatmapOpacity}
              onChange={(e) => setHeatmapOpacity(parseFloat(e.target.value))}
              className="w-20 accent-rose-500 h-1 bg-slate-800 rounded cursor-pointer"
              title="Heatmap Opacity"
            />
          </div>

          {/* Toggle Heat Map */}
          <button
            type="button"
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
              showHeatmap
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
            }`}
          >
            {showHeatmap ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{showHeatmap ? 'Heatmap ON' : 'Heatmap OFF'}</span>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      <div className="p-4 sm:p-6 bg-slate-950/60 min-h-[400px]">
        {/* Loading / Scanning Progress */}
        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="relative w-16 h-16 mb-4">
              <div className="absolute inset-0 rounded-full border-2 border-slate-800 border-t-rose-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center font-mono text-xs text-rose-400 font-bold">
                {scanProgress}%
              </div>
            </div>
            <h3 className="text-base font-semibold text-slate-100 mb-1">
              Extracting Person Face Frames & Computing Heat Maps
            </h3>
            <p className="text-xs text-slate-400 max-w-sm">
              Localizing face region across frames and rendering thermal heat map overlays...
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          /* Multi-Frame Screen Grid: Render multiple person faces on screen with pure heat maps */
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-mono text-slate-300">
                Person Face Keyframes · Thermal Heat Map Inspection
              </span>
              <span className="text-[11px] text-slate-500">
                Click any face to enlarge
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {frames.map((frame, idx) => {
                const isFake = frame.frameScore >= 60;

                return (
                  <div
                    key={frame.id}
                    onClick={() => {
                      setFocusedFrameIndex(idx);
                      setViewMode('focus');
                    }}
                    className={`group relative flex flex-col bg-slate-900/90 border rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-xl ${
                      isFake
                        ? 'border-rose-900/60 hover:border-rose-600/80'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Face Image with Pure Heat Map */}
                    <div className="relative aspect-video bg-slate-950 overflow-hidden">
                      <img
                        src={frame.imageUrl}
                        alt={`Face Frame #${idx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      />

                      {/* Pure Thermal Heat Map Overlay (No boxes, no eyes/mouth text tags) */}
                      <HeatmapCanvas
                        anomalies={frame.anomalies}
                        width={480}
                        height={270}
                        opacity={showHeatmap ? heatmapOpacity : 0}
                        colorMode="thermal"
                      />

                      {/* Timecode Badge */}
                      <div className="absolute top-2 left-2 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-slate-950/85 border border-slate-800 font-mono text-[10px] text-slate-200 backdrop-blur-sm">
                          Face #{idx + 1} · {frame.timestampFormatted}
                        </span>
                      </div>

                      {/* Clean Confidence Score Badge */}
                      <div className="absolute top-2 right-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[10px] font-bold backdrop-blur-sm ${
                            isFake
                              ? 'bg-rose-950/90 text-rose-300 border border-rose-500/50'
                              : 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/50'
                          }`}
                        >
                          {isFake ? <AlertTriangle className="w-3 h-3 text-rose-400" /> : <CheckCircle className="w-3 h-3 text-emerald-400" />}
                          <span>{frame.frameScore}% {isFake ? 'Fake' : 'Real'}</span>
                        </span>
                      </div>
                    </div>

                    {/* Simple Bottom Bar (No clutter) */}
                    <div className="px-3 py-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">
                        Face Frame #{idx + 1}
                      </span>
                      <span className="font-mono text-[11px] text-slate-400">
                        {isFake ? 'Deepfake Warning' : 'Natural Face'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Single Frame Focus View: Clean large person face with pure heat map */
          <div className="space-y-4">
            {/* Focus Navigator */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium transition-colors"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Return to Multi-Face View</span>
              </button>

              {/* Prev / Next Controls */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">
                  Face {focusedFrameIndex + 1} of {frames.length}
                </span>
                <button
                  type="button"
                  disabled={focusedFrameIndex === 0}
                  onClick={() => setFocusedFrameIndex((prev) => Math.max(0, prev - 1))}
                  className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 hover:text-white"
                  title="Previous Face"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={focusedFrameIndex === frames.length - 1}
                  onClick={() => setFocusedFrameIndex((prev) => Math.min(frames.length - 1, prev + 1))}
                  className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 hover:text-white"
                  title="Next Face"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Focused Face Canvas Display */}
            <div className="relative w-full aspect-video max-h-[500px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
              <img
                src={focusedFrame.imageUrl}
                alt={focusedFrame.label}
                className="w-full h-full object-contain"
              />

              {/* Pure Heat Map Overlay */}
              <HeatmapCanvas
                anomalies={focusedFrame.anomalies}
                width={800}
                height={450}
                opacity={showHeatmap ? heatmapOpacity : 0}
                colorMode="thermal"
              />

              {/* Top Watermark */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-slate-950/90 border border-slate-800 font-mono text-xs text-slate-200 backdrop-blur-md">
                  Face #{focusedFrameIndex + 1} · {focusedFrame.timestampFormatted}
                </span>
                <span
                  className={`px-2.5 py-1 rounded font-mono text-xs font-bold backdrop-blur-md ${
                    focusedFrame.frameScore >= 60
                      ? 'bg-rose-950/90 text-rose-300 border border-rose-500/40'
                      : 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {focusedFrame.frameScore}% Synthetic Score
                </span>
              </div>
            </div>

            {/* Thumbnail Strip */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {frames.map((f, i) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFocusedFrameIndex(i)}
                  className={`relative w-16 h-10 rounded overflow-hidden border shrink-0 transition-all ${
                    i === focusedFrameIndex
                      ? 'border-rose-500 ring-2 ring-rose-500/40'
                      : 'border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={f.imageUrl} alt={`Face #${i + 1}`} className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 inset-x-0 bg-black/80 font-mono text-[8px] text-center text-slate-300">
                    #{i + 1}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
