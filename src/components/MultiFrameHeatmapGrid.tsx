import React, { useState } from 'react';
import { Eye, EyeOff, LayoutGrid, Maximize2, Sliders, AlertTriangle, CheckCircle, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
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
  activeAnomalyId,
  onSelectAnomaly
}) => {
  // View mode: 'grid' (multiple on screen) vs 'focus' (single large frame)
  const [viewMode, setViewMode] = useState<'grid' | 'focus'>('grid');
  const [focusedFrameIndex, setFocusedFrameIndex] = useState<number>(0);
  const [filterMode, setFilterMode] = useState<'all' | 'anomalies_only'>('all');

  // Heat map display settings
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [heatmapOpacity, setHeatmapOpacity] = useState(0.85);
  const [colorMode, setColorMode] = useState<'thermal' | 'inferno' | 'crimson'>('thermal');
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [showLandmarkMesh, setShowLandmarkMesh] = useState(true);
  const [showControlsDrawer, setShowControlsDrawer] = useState(false);

  const displayedFrames = frames.filter((f) => {
    if (filterMode === 'anomalies_only') {
      return f.anomalies.length > 0 || f.frameScore >= 50;
    }
    return true;
  });

  const focusedFrame = frames[focusedFrameIndex] || frames[0];

  return (
    <div className="flex flex-col bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-2xl backdrop-blur-sm">
      {/* Control Toolbar Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-950/80 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="font-semibold text-slate-200">
              Extracted Video Frames Analysis
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
              <span>Multi-Frame Grid ({frames.length})</span>
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
              <span>Single Frame Focus</span>
            </button>
          </div>
        </div>

        {/* Heat Map Controls */}
        <div className="flex items-center gap-2">
          {/* Filter */}
          <div className="hidden sm:inline-flex items-center p-0.5 bg-slate-900 border border-slate-800 rounded-lg text-[11px]">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-2 py-1 rounded transition-colors ${
                filterMode === 'all'
                  ? 'bg-slate-800 text-slate-100 font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Frames
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('anomalies_only')}
              className={`px-2 py-1 rounded transition-colors ${
                filterMode === 'anomalies_only'
                  ? 'bg-rose-950/60 text-rose-300 font-medium border border-rose-800/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Trigger Frames Only
            </button>
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
            <span>Heat Maps</span>
          </button>

          {/* Settings Drawer Toggle */}
          <button
            type="button"
            onClick={() => setShowControlsDrawer(!showControlsDrawer)}
            className={`p-1.5 rounded transition-colors ${
              showControlsDrawer
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
            }`}
            title="Heatmap Settings"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Heatmap Settings Drawer */}
      {showControlsDrawer && (
        <div className="px-4 py-3 bg-slate-950/90 border-b border-slate-800 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            {/* Opacity */}
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

            {/* Thermal Palette */}
            <div>
              <span className="text-slate-400 block mb-1">Color Palette</span>
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

            {/* Hint */}
            <div className="text-right text-[11px] text-slate-500 font-mono">
              Heat maps applied to all still image frames
            </div>
          </div>
        </div>
      )}

      {/* Main View Area */}
      <div className="p-4 sm:p-6 bg-slate-950/60 min-h-[420px]">
        {/* Loading / Scanning Progress */}
        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="relative w-20 h-20 mb-6">
              <div className="absolute inset-0 rounded-full border-2 border-slate-800 border-t-rose-500 animate-spin" />
              <div className="absolute inset-2 rounded-full border-2 border-slate-800 border-b-cyan-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
              <div className="absolute inset-0 flex items-center justify-center font-mono text-xs text-rose-400 font-bold">
                {scanProgress}%
              </div>
            </div>
            <h3 className="text-base font-semibold text-slate-100 mb-1">
              Extracting Video Frames & Generating Heat Maps
            </h3>
            <p className="text-xs text-slate-400 max-w-md">
              Decoding video track, extracting keyframes as still images, and computing localized thermal anomaly tensors...
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          /* Multi-Frame Screen Grid: Render multiple frames on screen with heat maps */
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-mono text-slate-300">
                Showing {displayedFrames.length} Extracted Image Frames with Thermal Heat Maps
              </span>
              <span className="text-[11px] text-slate-500">
                Click any frame to inspect in enlarged detail
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayedFrames.map((frame, idx) => {
                const isAnomaly = frame.frameScore >= 60;
                const isSelected = activeAnomalyId && frame.anomalies.some((a) => a.id === activeAnomalyId);

                return (
                  <div
                    key={frame.id}
                    onClick={() => {
                      setFocusedFrameIndex(frames.findIndex((f) => f.id === frame.id));
                      setViewMode('focus');
                    }}
                    className={`group relative flex flex-col bg-slate-900/90 border rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-xl ${
                      isSelected
                        ? 'border-rose-500 ring-2 ring-rose-500/30'
                        : isAnomaly
                        ? 'border-rose-900/60 hover:border-rose-700/80'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Frame Image with Heat Map Overlay */}
                    <div className="relative aspect-video bg-slate-950 overflow-hidden">
                      <img
                        src={frame.imageUrl}
                        alt={frame.label}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      />

                      {/* Frame Specific Thermal Heat Map Canvas */}
                      <HeatmapCanvas
                        anomalies={frame.anomalies}
                        width={480}
                        height={270}
                        opacity={showHeatmap ? heatmapOpacity : 0}
                        colorMode={colorMode}
                        showBoundingBoxes={showBoundingBoxes}
                        showLandmarkMesh={showLandmarkMesh}
                        activeAnomalyId={activeAnomalyId}
                        onSelectAnomaly={onSelectAnomaly}
                      />

                      {/* Frame Index & Timecode Badge */}
                      <div className="absolute top-2 left-2 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-slate-950/85 border border-slate-800 font-mono text-[10px] text-slate-200 backdrop-blur-sm">
                          {frame.timestampFormatted}
                        </span>
                      </div>

                      {/* Score Badge */}
                      <div className="absolute top-2 right-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[10px] font-bold backdrop-blur-sm ${
                            isAnomaly
                              ? 'bg-rose-950/90 text-rose-300 border border-rose-500/50'
                              : 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/50'
                          }`}
                        >
                          {isAnomaly ? <AlertTriangle className="w-3 h-3 text-rose-400" /> : <CheckCircle className="w-3 h-3 text-emerald-400" />}
                          <span>{frame.frameScore}%</span>
                        </span>
                      </div>

                      {/* Expand Overlay on Hover */}
                      <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                        <span className="px-3 py-1.5 bg-slate-900/90 border border-slate-700 rounded-lg text-xs font-semibold text-slate-100 flex items-center gap-1.5 shadow-lg">
                          <ZoomIn className="w-3.5 h-3.5 text-rose-400" />
                          <span>Inspect Frame</span>
                        </span>
                      </div>
                    </div>

                    {/* Frame Footer Details */}
                    <div className="p-3 border-t border-slate-800/80 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="text-xs font-semibold text-slate-200 mb-1 truncate">
                          {frame.label}
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {frame.triggerNote}
                        </p>
                      </div>

                      {/* Flagged Regions List */}
                      {frame.anomalies.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex flex-wrap gap-1">
                          {frame.anomalies.map((anom) => (
                            <span
                              key={anom.id}
                              className="text-[10px] font-mono text-rose-300 bg-rose-950/40 border border-rose-800/40 px-1.5 py-0.5 rounded truncate max-w-full"
                            >
                              ⚠️ {anom.region}: {anom.confidence}%
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Single Frame Focus View: Deep inspection of selected extracted image frame */
          <div className="space-y-4">
            {/* Focus Navigator */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium transition-colors"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Return to Multi-Frame Grid</span>
              </button>

              {/* Prev / Next Frame Controls */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">
                  Frame {focusedFrameIndex + 1} of {frames.length}
                </span>
                <button
                  type="button"
                  disabled={focusedFrameIndex === 0}
                  onClick={() => setFocusedFrameIndex((prev) => Math.max(0, prev - 1))}
                  className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 hover:text-white"
                  title="Previous Frame"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={focusedFrameIndex === frames.length - 1}
                  onClick={() => setFocusedFrameIndex((prev) => Math.min(frames.length - 1, prev + 1))}
                  className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 hover:text-white"
                  title="Next Frame"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Focused Frame Canvas Display */}
            <div className="relative w-full aspect-video max-h-[520px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
              <img
                src={focusedFrame.imageUrl}
                alt={focusedFrame.label}
                className="w-full h-full object-contain"
              />

              {/* Heat Map Overlay on Extracted Image */}
              <HeatmapCanvas
                anomalies={focusedFrame.anomalies}
                width={800}
                height={450}
                opacity={showHeatmap ? heatmapOpacity : 0}
                colorMode={colorMode}
                showBoundingBoxes={showBoundingBoxes}
                showLandmarkMesh={showLandmarkMesh}
                activeAnomalyId={activeAnomalyId}
                onSelectAnomaly={onSelectAnomaly}
              />

              {/* Top Watermark */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-slate-950/90 border border-slate-800 font-mono text-xs text-slate-200 backdrop-blur-md">
                  {focusedFrame.label} · {focusedFrame.timestampFormatted}
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

            {/* Frame Diagnostic Summary */}
            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="text-slate-200 font-semibold mb-1">
                  Forensic Observation on {focusedFrame.label}
                </div>
                <p className="text-slate-400 leading-relaxed max-w-2xl">
                  {focusedFrame.triggerNote}
                </p>
              </div>

              {/* Frame thumbnail strip to quickly hop between frames */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                {frames.map((f, i) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFocusedFrameIndex(i)}
                    className={`relative w-14 h-9 rounded overflow-hidden border shrink-0 transition-all ${
                      i === focusedFrameIndex
                        ? 'border-rose-500 ring-2 ring-rose-500/40'
                        : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={f.imageUrl} alt={f.label} className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 inset-x-0 bg-black/80 font-mono text-[8px] text-center text-slate-300">
                      #{f.frameIndex}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
