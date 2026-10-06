import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, Download, Copy, Check, FileCode, ArrowRight, CornerDownRight } from 'lucide-react';
import { DetectionResult, AnomalyPoint } from '../types/detection';

interface ConfidenceResultsProps {
  result: DetectionResult;
  onFocusAnomaly: (anomalyId: string) => void;
  activeAnomalyId: string | null;
  onOpenModelDocs: () => void;
}

export const ConfidenceResults: React.FC<ConfidenceResultsProps> = ({
  result,
  onFocusAnomaly,
  activeAnomalyId,
  onOpenModelDocs
}) => {
  const [copiedJson, setCopiedJson] = React.useState(false);

  const isFake = result.verdict === 'deepfake';
  const isSuspicious = result.verdict === 'suspicious';

  const strokeColor = isFake ? '#f43f5e' : isSuspicious ? '#f59e0b' : '#10b981';
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (result.confidenceScore / 100) * circumference;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleDownloadReport = () => {
    const reportData = {
      title: 'Veritas Forensic Media Verification Report',
      timestamp: new Date().toISOString(),
      applet: 'Veritas Deepfake Inspector',
      mediaName: result.mediaName,
      verdict: result.verdict,
      syntheticConfidenceScore: `${result.confidenceScore}%`,
      metrics: result.metrics,
      triggers: result.keyTriggerAreas,
      summary: result.summary,
      modelDetails: result.modelDetails
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `forensic-report-${result.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-2xl backdrop-blur-sm">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Inference complete</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{result.inferenceTimeMs}ms latency</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{result.analyzedFramesCount} frames inspected</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">
            Forensic Detection Assessment
          </h2>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyJson}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            title="Copy Raw Model Inference Output JSON"
          >
            {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedJson ? 'Copied' : 'JSON Payload'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadReport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-rose-400" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Main Score & Verdict Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 py-6 border-b border-slate-800 items-center">
        {/* Radial Confidence Gauge (Left 4 cols) */}
        <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-950/60 rounded-xl border border-slate-800/80">
          <div className="relative w-36 h-36 flex items-center justify-center mb-3">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 130 130">
              {/* Background circle */}
              <circle
                cx="65"
                cy="65"
                r={radius}
                stroke="#1e293b"
                strokeWidth="10"
                fill="none"
              />
              {/* Progress arc */}
              <circle
                cx="65"
                cy="65"
                r={radius}
                stroke={strokeColor}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Center numerical display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-mono text-3xl font-extrabold text-slate-100 tabular-nums">
                {result.confidenceScore}%
              </span>
              <span className="text-[10px] font-mono uppercase text-slate-400">
                Synthetic Risk
              </span>
            </div>
          </div>

          <div className="text-center">
            <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-0.5">
              Confidence Score
            </div>
            <div className="text-[11px] text-slate-500">
              Probability of neural manipulation
            </div>
          </div>
        </div>

        {/* Verdict Details (Right 8 cols) */}
        <div className="md:col-span-8 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            {isFake ? (
              <div className="flex items-center gap-2 text-rose-400">
                <ShieldAlert className="w-5 h-5 text-rose-500" />
                <span className="text-sm font-bold uppercase tracking-wider">
                  Deepfake Warning: High Synthetic Probability
                </span>
              </div>
            ) : isSuspicious ? (
              <div className="flex items-center gap-2 text-amber-400">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-bold uppercase tracking-wider">
                  Inconclusive: Subtle Anomalies Detected
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-emerald-400">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-bold uppercase tracking-wider">
                  Likely Authentic: Biometric Integrity Passed
                </span>
              </div>
            )}
          </div>

          <p className="text-sm text-slate-300 leading-relaxed mb-4">
            {result.summary}
          </p>

          {/* Key Trigger Areas */}
          <div>
            <div className="text-xs font-semibold text-slate-300 mb-2">
              Key Trigger Indicators Flagged in Heat Map:
            </div>
            <div className="space-y-1.5">
              {result.keyTriggerAreas.map((area, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 text-xs text-slate-300 bg-slate-950/40 px-3 py-1.5 rounded border border-slate-800/60"
                >
                  <span className="text-rose-400 font-mono">0{idx + 1}.</span>
                  <span className="flex-1">{area}</span>
                  <span className="text-[11px] font-mono text-slate-500">
                    Highlighted on frame
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Indicator Breakdown Grid */}
      <div className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Forensic Vector Breakdown
          </h3>
          <button
            type="button"
            onClick={onOpenModelDocs}
            className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Model API & Architecture</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Metric 1: Boundary Blending */}
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
            <div className="text-[11px] text-slate-400 mb-1">Boundary Seams</div>
            <div className="font-mono text-lg font-bold text-slate-100 tabular-nums">
              {result.metrics.facialBoundaryArtifacts}%
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              {result.metrics.facialBoundaryArtifacts > 50 ? 'Discontinuity' : 'Continuous'}
            </div>
          </div>

          {/* Metric 2: Lip Sync */}
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
            <div className="text-[11px] text-slate-400 mb-1">Lip-Sync Drift</div>
            <div className="font-mono text-lg font-bold text-slate-100 tabular-nums">
              {result.metrics.lipSyncDiscrepancy}%
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              {result.metrics.lipSyncDiscrepancy > 50 ? 'Phoneme Lag' : 'Synchronous'}
            </div>
          </div>

          {/* Metric 3: Ocular Specular */}
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
            <div className="text-[11px] text-slate-400 mb-1">Eye Consistency</div>
            <div className="font-mono text-lg font-bold text-slate-100 tabular-nums">
              {result.metrics.ocularConsistency}%
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              {result.metrics.ocularConsistency < 40 ? 'Specular Mismatch' : 'Harmonious'}
            </div>
          </div>

          {/* Metric 4: Frequency Artifacts */}
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
            <div className="text-[11px] text-slate-400 mb-1">DCT Frequency Cut</div>
            <div className="font-mono text-lg font-bold text-slate-100 tabular-nums">
              {result.metrics.frequencyArtifactScore}%
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              {result.metrics.frequencyArtifactScore > 50 ? 'Synthetic Loss' : 'Natural Noise'}
            </div>
          </div>

          {/* Metric 5: Biological Pulse */}
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
            <div className="text-[11px] text-slate-400 mb-1">Biological rPPG</div>
            <div className="font-mono text-lg font-bold text-slate-100 tabular-nums">
              {result.metrics.biologicalPulseSignal}%
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              {result.metrics.biologicalPulseSignal < 30 ? 'Pulse Absent' : 'Pulse Detected'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
