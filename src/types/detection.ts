export type MediaType = 'video' | 'image';

export interface AnomalyPoint {
  id: string;
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  radius: number; // percentage
  intensity: number; // 0.0 to 1.0
  region: 'mouth' | 'eyes' | 'jawline' | 'skin_texture' | 'forehead' | 'ears';
  title: string;
  description: string;
  confidence: number; // 0 - 100
}

export interface ExtractedFrame {
  id: string;
  frameIndex: number;
  timestamp: number; // seconds
  timestampFormatted: string;
  imageUrl: string;
  frameScore: number; // 0 - 100 synthetic probability
  label: string;
  status: 'passed' | 'warning' | 'anomaly';
  anomalies: AnomalyPoint[];
  triggerNote?: string;
}

export interface FrameAnalysis {
  frameIndex: number;
  timestamp: number; // seconds
  anomalies: AnomalyPoint[];
  frameScore: number; // 0 - 100 synthetic probability
}

export interface DetectionResult {
  id: string;
  mediaName: string;
  mediaType: MediaType;
  fileSizeFormatted: string;
  analyzedAt: string;
  durationSeconds?: number;
  resolution: string;
  confidenceScore: number; // 0 to 100 (% probability of synthetic manipulation)
  verdict: 'deepfake' | 'suspicious' | 'authentic';
  summary: string;
  analyzedFramesCount: number;
  inferenceTimeMs: number;
  metrics: {
    facialBoundaryArtifacts: number; // 0-100
    lipSyncDiscrepancy: number; // 0-100
    ocularConsistency: number; // 0-100 (lower means more anomalous)
    frequencyArtifactScore: number; // 0-100
    biologicalPulseSignal: number; // 0-100 (lower means artificial)
  };
  keyTriggerAreas: string[];
  frames: FrameAnalysis[];
  extractedFrames: ExtractedFrame[]; // Multiple still image frames extracted from video/media
  modelDetails: {
    name: string;
    version: string;
    backendType: 'simulated' | 'custom_api';
  };
}

export interface SampleMediaItem {
  id: string;
  title: string;
  type: MediaType;
  category: 'real' | 'fake';
  description: string;
  thumbnailUrl?: string;
  mediaUrl: string;
  keyObservation: string;
  expectedScore: number;
  expectedVerdict: 'deepfake' | 'authentic';
  anomalies: AnomalyPoint[];
  extractedFrames?: ExtractedFrame[];
}
