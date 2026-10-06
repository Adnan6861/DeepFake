import React, { useState } from 'react';
import { Eye, EyeOff, ArrowUpRight, CheckCircle2, AlertOctagon, HelpCircle } from 'lucide-react';
import { DUMMY_SAMPLES } from '../utils/sampleData';
import { SampleMediaItem } from '../types/detection';
import { HeatmapCanvas } from './HeatmapCanvas';

interface RealFakeComparisonProps {
  onSelectSampleForAnalysis: (sample: SampleMediaItem) => void;
}

export const RealFakeComparison: React.FC<RealFakeComparisonProps> = ({
  onSelectSampleForAnalysis
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'fake' | 'real'>('all');
  const [heatmapToggles, setHeatmapToggles] = useState<Record<string, boolean>>({
    'sample-fake-1': true,
    'sample-fake-2': true,
    'sample-real-1': false,
    'sample-real-2': false
  });

  const toggleHeatmap = (id: string) => {
    setHeatmapToggles(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filteredSamples = DUMMY_SAMPLES.filter(s => {
    if (activeTab === 'all') return true;
    return s.category === activeTab;
  });

  return (
    <section id="sample-library" className="py-12 border-t border-slate-800/80">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-2">
            <span>REFERENCE BENCHMARK DATASET</span>
            <span aria-hidden="true">·</span>
            <span>4 FORENSIC CASES</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
            Authentic vs. Manipulated Media Comparison
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Examine how the thermal heat map localizes spatial and frequency anomalies on synthetic deepfakes versus natural biological signals on authentic captures.
          </p>
        </div>

        {/* Filter Segmented Control (Interactive buttons per frontend-design rules) */}
        <div className="inline-flex items-center p-1 bg-slate-900 border border-slate-800 rounded-lg self-start">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'all'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Samples (4)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('fake')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'fake'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Synthetic / Fake (2)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('real')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'real'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Authentic / Real (2)
          </button>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredSamples.map((sample) => {
          const isFake = sample.category === 'fake';
          const isHeatmapActive = !!heatmapToggles[sample.id];

          return (
            <div
              key={sample.id}
              className={`flex flex-col bg-slate-900/60 border rounded-xl overflow-hidden transition-all duration-200 ${
                isFake
                  ? 'border-rose-950/80 hover:border-rose-800/80'
                  : 'border-emerald-950/80 hover:border-emerald-800/80'
              }`}
            >
              {/* Media Preview Box with Heatmap Overlay */}
              <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden">
                <img
                  src={sample.mediaUrl}
                  alt={sample.title}
                  className="w-full h-full object-cover"
                />

                {/* Heatmap Layer */}
                {sample.anomalies.length > 0 && (
                  <HeatmapCanvas
                    anomalies={sample.anomalies}
                    width={560}
                    height={315}
                    opacity={isHeatmapActive ? 0.85 : 0}
                    colorMode="thermal"
                  />
                )}

                {/* Status Indicator Tag */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-semibold rounded backdrop-blur-md ${
                      isFake
                        ? 'bg-rose-950/90 text-rose-300 border border-rose-500/40'
                        : 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {isFake ? (
                      <>
                        <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                        <span>SYNTHETIC ({sample.expectedScore}%)</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>AUTHENTIC ({sample.expectedScore}%)</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Live Heatmap Toggle Button on Card */}
                {sample.anomalies.length > 0 && (
                  <div className="absolute top-3 right-3">
                    <button
                      type="button"
                      onClick={() => toggleHeatmap(sample.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded font-medium backdrop-blur-md transition-colors ${
                        isHeatmapActive
                          ? 'bg-rose-500 text-white shadow-lg shadow-rose-900/40'
                          : 'bg-slate-950/80 text-slate-300 border border-slate-700 hover:text-white'
                      }`}
                    >
                      {isHeatmapActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span>{isHeatmapActive ? 'Heat Map ON' : 'Show Heat Map'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Information Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="uppercase font-mono text-[11px] text-slate-500">
                      {sample.type} FORMAT
                    </span>
                    <span className="font-mono text-slate-400">
                      Confidence Score: {sample.expectedScore}%
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-slate-100 mb-1.5">
                    {sample.title}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {sample.description}
                  </p>

                  {/* Forensic Observation Box */}
                  <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800 text-xs mb-4">
                    <div className="font-semibold text-slate-300 text-[11px] mb-1">
                      Forensic Signature & Verification:
                    </div>
                    <p className="text-slate-400 leading-normal">
                      {sample.keyObservation}
                    </p>
                  </div>
                </div>

                {/* Action CTA */}
                <div className="pt-2 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => onSelectSampleForAnalysis(sample)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <span>Load Into Main Forensic Scanner</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
