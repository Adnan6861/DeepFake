/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { UploadDropzone } from './components/UploadDropzone';
import { MultiFrameHeatmapGrid } from './components/MultiFrameHeatmapGrid';
import { ConfidenceResults } from './components/ConfidenceResults';
import { RealFakeComparison } from './components/RealFakeComparison';
import { MethodologySection } from './components/MethodologySection';
import { AuthModal } from './components/AuthModal';
import { ModelIntegrationModal } from './components/ModelIntegrationModal';
import { MediaType, DetectionResult, SampleMediaItem, AnomalyPoint, ExtractedFrame } from './types/detection';
import { DUMMY_SAMPLES, generateDetectionResult } from './utils/sampleData';
import { extractFramesFromVideoUrl, buildExtractedFrames, generateSyntheticFrameImages } from './utils/frameExtractor';
import { Sparkles, RefreshCw, Server, Shield, Layers, Image as ImageIcon } from 'lucide-react';

export default function App() {
  // Authentication state
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  // Model integration state
  const [modelModalOpen, setModelModalOpen] = useState(false);
  const [apiEndpoint, setApiEndpoint] = useState('https://api.veritas-forensics.io/v1/detect');

  // Media & Detection state
  const [currentMediaType, setCurrentMediaType] = useState<MediaType>('video');
  const [mediaName, setMediaName] = useState<string>('sample_faceswap_speech.mp4');
  const [mediaUrl, setMediaUrl] = useState<string>(DUMMY_SAMPLES[1].mediaUrl);
  const [fileSizeFormatted, setFileSizeFormatted] = useState<string>('18.4 MB');

  // Extracted still image frames from video or media
  const [currentExtractedFrames, setCurrentExtractedFrames] = useState<ExtractedFrame[]>([]);

  // Analysis process state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const [activeAnomalyId, setActiveAnomalyId] = useState<string | null>(null);

  // Initialize with initial sample analyzed so the user lands on a complete, visually rich interface
  useEffect(() => {
    const initialResult = generateDetectionResult(mediaName, currentMediaType, true);
    setDetectionResult(initialResult);
    setCurrentExtractedFrames(initialResult.extractedFrames);
  }, []);

  const handleMediaLoaded = async (file: { name: string; type: MediaType; url: string; sizeFormatted: string }) => {
    setMediaName(file.name);
    setCurrentMediaType(file.type);
    setMediaUrl(file.url);
    setFileSizeFormatted(file.sizeFormatted);
    setDetectionResult(null);
    setActiveAnomalyId(null);

    // Pre-extract still image frames from the uploaded video or image
    if (file.type === 'video') {
      try {
        const extractedImgUrls = await extractFramesFromVideoUrl(file.url, 6);
        const frames = buildExtractedFrames(extractedImgUrls, true);
        setCurrentExtractedFrames(frames);
      } catch {
        const synthetic = generateSyntheticFrameImages(6, true);
        setCurrentExtractedFrames(buildExtractedFrames(synthetic, true));
      }
    } else {
      const singleFrame: ExtractedFrame[] = [
        {
          id: 'frame-uploaded-img',
          frameIndex: 1,
          timestamp: 0,
          timestampFormatted: '00:00.00',
          imageUrl: file.url,
          frameScore: 88,
          label: 'Still Image Inspection Lens',
          status: 'anomaly',
          anomalies: [],
          triggerNote: 'Image loaded for multi-frequency spatial and noise floor inspection.'
        }
      ];
      setCurrentExtractedFrames(singleFrame);
    }
  };

  const handleSelectSample = (sample: SampleMediaItem) => {
    const newName = `${sample.title.toLowerCase().replace(/\s+/g, '_')}.${sample.type === 'video' ? 'mp4' : 'png'}`;
    setMediaName(newName);
    setCurrentMediaType(sample.type);
    setMediaUrl(sample.mediaUrl);
    setFileSizeFormatted(sample.type === 'video' ? '18.4 MB' : '3.8 MB');
    setDetectionResult(null);
    setActiveAnomalyId(null);

    // Scroll to detector
    const el = document.getElementById('detector');
    if (el) el.scrollIntoView({ behavior: 'smooth' });

    // Trigger analysis with extracted frames
    triggerAnalysis(sample.category === 'fake');
  };

  const triggerAnalysis = (forceFakeVerdict?: boolean) => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    setScanProgress(0);

    const isFake = forceFakeVerdict ?? (
      mediaName.toLowerCase().includes('fake') ||
      mediaName.toLowerCase().includes('swap') ||
      mediaName.toLowerCase().includes('sync')
    );

    // Simulated frame-by-frame inspection pipeline
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + Math.floor(Math.random() * 15 + 10);
      });
    }, 180);

    setTimeout(() => {
      clearInterval(interval);
      setScanProgress(100);
      setIsAnalyzing(false);

      // Extract / assemble frames as still images
      const baseImages = currentExtractedFrames.length > 0
        ? currentExtractedFrames.map(f => f.imageUrl)
        : generateSyntheticFrameImages(6, isFake);

      const framesWithAnomalies = buildExtractedFrames(baseImages, isFake);
      setCurrentExtractedFrames(framesWithAnomalies);

      const result = generateDetectionResult(
        mediaName,
        currentMediaType,
        isFake,
        framesWithAnomalies
      );
      setDetectionResult(result);
    }, 1400);
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col font-sans selection:bg-rose-500/30 selection:text-rose-200">
      {/* Top Bar Contract (Wordmark, Links, Auth Actions) */}
      <Navbar
        currentUser={currentUser}
        onOpenAuth={(mode) => {
          setAuthModalMode(mode);
          setAuthModalOpen(true);
        }}
        onSignOut={() => setCurrentUser(null)}
        onOpenModelDocs={() => setModelModalOpen(true)}
      />

      {/* Main Workspace Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Hero & Context Header */}
        <div className="text-center max-w-3xl mx-auto pt-4 pb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-xs text-slate-400 mb-4">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="font-mono text-slate-300">Biometric & Spatial Forensic Pipeline</span>
            <span aria-hidden="true">·</span>
            <span>v2.4 Active</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            Deepfake Detection System
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Upload video or image footage to detect synthetic manipulation. Visualize frame-level thermal heat maps highlighting spatial artifacts, lip-sync anomalies, and affine boundary seams.
          </p>
        </div>

        {/* Center of Page Upload & Dropzone Section */}
        <section id="detector" className="scroll-mt-20">
          <UploadDropzone
            currentMediaType={currentMediaType}
            onChangeMediaType={setCurrentMediaType}
            onMediaLoaded={handleMediaLoaded}
            onSelectSample={handleSelectSample}
            isAnalyzing={isAnalyzing}
            hasLoadedMedia={Boolean(mediaUrl)}
            onTriggerAnalysis={() => triggerAnalysis()}
          />
        </section>

        {/* Media Player with Heat Map Visualizer */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
                <span>STILL IMAGE FRAME EXTRACTION</span>
                <span aria-hidden="true">·</span>
                <span>MULTI-FRAME HEAT MAPS ACTIVE</span>
              </div>
              <h2 className="text-xl font-bold text-slate-100 tracking-tight">
                Extracted Frame Analysis & Heat Map Grid
              </h2>
            </div>

            {/* Quick Action Bar */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => triggerAnalysis()}
                disabled={isAnalyzing}
                className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-md shadow-rose-950/40 transition-colors cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Extracting & Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Re-Analyze Frames</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setModelModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
                title="Configure Backend Inference Model"
              >
                <Server className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Model API</span>
              </button>
            </div>
          </div>

          {/* Multi-Frame Image Heat Map Grid (Extracted Images on Screen, Not Video Player) */}
          <MultiFrameHeatmapGrid
            frames={currentExtractedFrames}
            isAnalyzing={isAnalyzing}
            scanProgress={scanProgress}
            detectionResult={detectionResult}
            activeAnomalyId={activeAnomalyId}
            onSelectAnomaly={(anom) => setActiveAnomalyId(anom ? anom.id : null)}
          />
        </section>

        {/* Clear Confidence Score & Detection Results */}
        {detectionResult && (
          <section className="animate-in fade-in duration-300">
            <ConfidenceResults
              result={detectionResult}
              activeAnomalyId={activeAnomalyId}
              onFocusAnomaly={(id) => setActiveAnomalyId(id)}
              onOpenModelDocs={() => setModelModalOpen(true)}
            />
          </section>
        )}

        {/* Real vs Fake Dummy Section */}
        <RealFakeComparison
          onSelectSampleForAnalysis={handleSelectSample}
        />

        {/* Forensic Methodology & Heat Map Principles */}
        <MethodologySection />
      </main>

      {/* Minimalist Dark Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300 font-mono">Veritas Deepfake Inspector</span>
            <span>·</span>
            <span>Thermal Anomaly & Spatial Frequency Analysis</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setModelModalOpen(true)}
              className="hover:text-slate-300 transition-colors"
            >
              Model Backend Schema
            </button>
            <span>·</span>
            <span>Designed for seamless real-time inference</span>
          </div>
        </div>
      </footer>

      {/* Auth Modal (Login / Sign Up) */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(user) => setCurrentUser(user)}
      />

      {/* Model Integration & Endpoint Modal */}
      <ModelIntegrationModal
        isOpen={modelModalOpen}
        onClose={() => setModelModalOpen(false)}
        apiEndpoint={apiEndpoint}
        onSaveEndpoint={(ep) => setApiEndpoint(ep)}
      />
    </div>
  );
}
