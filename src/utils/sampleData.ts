import { SampleMediaItem, DetectionResult, AnomalyPoint, FrameAnalysis, ExtractedFrame } from '../types/detection';
import { generateSyntheticFrameImages, buildExtractedFrames } from './frameExtractor';

// Procedural SVG face avatars for crisp reliable rendering
export function createFaceSvg(type: 'real_speaker' | 'fake_faceswap' | 'real_photo' | 'fake_lipsync'): string {
  if (type === 'real_speaker') {
    return `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" width="100%" height="100%">
        <defs>
          <radialGradient id="bg" cx="50%" cy="40%" r="80%">
            <stop offset="0%" stop-color="#1e293b"/>
            <stop offset="100%" stop-color="#0f172a"/>
          </radialGradient>
          <linearGradient id="skin" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#f5d0b5"/>
            <stop offset="100%" stop-color="#d9a07a"/>
          </linearGradient>
          <filter id="noise" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" result="noise"/>
            <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.04 0"/>
            <feComposite in2="SourceGraphic" in="gl" operator="over"/>
          </filter>
        </defs>
        <rect width="640" height="400" fill="url(#bg)"/>
        
        <!-- Authentic Studio Background Elements -->
        <circle cx="120" cy="80" r="160" fill="#3b82f6" opacity="0.08" filter="blur(40px)"/>
        <circle cx="540" cy="300" r="140" fill="#0ea5e9" opacity="0.06" filter="blur(50px)"/>
        
        <!-- Torso -->
        <path d="M 200 400 C 220 320, 260 280, 320 280 C 380 280, 420 320, 440 400 Z" fill="#1e2433"/>
        <path d="M 280 280 L 320 340 L 360 280 Z" fill="#0f141f"/>
        
        <!-- Neck -->
        <rect x="295" y="220" width="50" height="70" rx="6" fill="#d9a07a"/>
        
        <!-- Head -->
        <ellipse cx="320" cy="180" rx="62" ry="78" fill="url(#skin)"/>
        
        <!-- Hair -->
        <path d="M 252 170 C 248 110, 310 90, 385 110 C 395 150, 385 180, 385 180 C 375 125, 345 115, 275 130 Z" fill="#2d241e"/>
        
        <!-- Eyes with Natural Catchlight reflections -->
        <ellipse cx="295" cy="168" rx="10" ry="6" fill="#ffffff"/>
        <ellipse cx="345" cy="168" rx="10" ry="6" fill="#ffffff"/>
        <circle cx="295" cy="168" r="4.5" fill="#33221b"/>
        <circle cx="345" cy="168" r="4.5" fill="#33221b"/>
        <circle cx="297" cy="166" r="1.5" fill="#ffffff"/>
        <circle cx="347" cy="166" r="1.5" fill="#ffffff"/>
        
        <!-- Eyebrows -->
        <path d="M 282 154 Q 295 150 308 155" stroke="#2d241e" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <path d="M 332 155 Q 345 150 358 154" stroke="#2d241e" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        
        <!-- Nose -->
        <path d="M 320 168 L 317 195 L 324 195" stroke="#b87b56" stroke-width="1.8" fill="none" stroke-linecap="round"/>
        
        <!-- Mouth Natural Organic Curves -->
        <path d="M 305 218 Q 320 224 335 218" stroke="#a65953" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        
        <!-- Live Authentic Metadata stamp -->
        <text x="32" y="370" fill="#64748b" font-family="monospace" font-size="12">CAMERA 01 · 4K PRORES · SENSOR ISO 400 · NATURAL CORNEAL REFLECTIONS</text>
      </svg>
    `)}`;
  }

  if (type === 'fake_faceswap') {
    return `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" width="100%" height="100%">
        <defs>
          <radialGradient id="bg2" cx="50%" cy="40%" r="80%">
            <stop offset="0%" stop-color="#1e1b2e"/>
            <stop offset="100%" stop-color="#0b0914"/>
          </radialGradient>
          <linearGradient id="skinSynthetic" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#fce2cd"/>
            <stop offset="100%" stop-color="#ebb594"/>
          </linearGradient>
          <!-- Noticeable face swap boundary seam filter simulation -->
          <filter id="boundaryBlur" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="3"/>
          </filter>
        </defs>
        <rect width="640" height="400" fill="url(#bg2)"/>
        
        <!-- Background Lighting (Mismatched angle) -->
        <circle cx="500" cy="100" r="150" fill="#f43f5e" opacity="0.07" filter="blur(60px)"/>
        
        <!-- Torso -->
        <path d="M 200 400 C 220 320, 260 280, 320 280 C 380 280, 420 320, 440 400 Z" fill="#1b1c24"/>
        
        <!-- Original Neck -->
        <rect x="295" y="215" width="50" height="75" rx="6" fill="#c48a68"/>
        
        <!-- Blurry Face Swap Seam / Affine Boundary (Forensic Flaw) -->
        <ellipse cx="320" cy="180" rx="68" ry="84" fill="#ff0044" opacity="0.12" stroke="#f43f5e" stroke-width="1.5" stroke-dasharray="4 3"/>
        
        <!-- Swapped Face with Plastic/Smooth Artifacts -->
        <ellipse cx="320" cy="180" rx="62" ry="76" fill="url(#skinSynthetic)"/>
        
        <!-- Unnatural Hair Seam Boundary -->
        <path d="M 250 165 C 245 105, 310 88, 388 108 C 392 145, 386 175, 386 175 C 370 120, 340 112, 275 125 Z" fill="#1c1917"/>
        
        <!-- Synthetic Eyes: Identical Catchlights (AI Artifact) & Fixed Gaze -->
        <ellipse cx="295" cy="168" rx="10" ry="5.5" fill="#f8fafc"/>
        <ellipse cx="345" cy="168" rx="10" ry="5.5" fill="#f8fafc"/>
        <circle cx="295" cy="168" r="4.2" fill="#18181b"/>
        <circle cx="345" cy="168" r="4.2" fill="#18181b"/>
        <!-- Notice lack of specular difference in artificial eyes -->
        <circle cx="296" cy="167" r="1.8" fill="#ffffff"/>
        <circle cx="346" cy="167" r="1.8" fill="#ffffff"/>
        
        <!-- Eyebrows -->
        <path d="M 284 156 Q 295 152 306 156" stroke="#1c1917" stroke-width="2.2" fill="none" stroke-linecap="round"/>
        <path d="M 334 156 Q 345 152 356 156" stroke="#1c1917" stroke-width="2.2" fill="none" stroke-linecap="round"/>
        
        <!-- Nose -->
        <path d="M 320 168 L 318 194 L 323 194" stroke="#d49372" stroke-width="1.5" fill="none"/>
        
        <!-- Uncanny Lip-Sync Synthesis Artifact Area -->
        <ellipse cx="320" cy="222" rx="22" ry="12" fill="#f43f5e" opacity="0.18"/>
        <path d="M 306 220 Q 320 223 334 220" stroke="#b95757" stroke-width="3" fill="none" stroke-linecap="round"/>
        
        <!-- Visible Detection Clue -->
        <text x="32" y="370" fill="#f43f5e" font-family="monospace" font-size="12">⚠️ SYNTHETIC ARTIFACTS: AFFINE WARP SEAM DETECTED · LACK OF DERMAL PORES</text>
      </svg>
    `)}`;
  }

  if (type === 'fake_lipsync') {
    return `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" width="100%" height="100%">
        <rect width="640" height="400" fill="#0d1117"/>
        <circle cx="320" cy="160" r="100" fill="#1f2937" opacity="0.4"/>
        <ellipse cx="320" cy="175" rx="60" ry="75" fill="#e8c39e"/>
        <path d="M 260 150 C 260 100, 380 100, 380 150 Z" fill="#3f3f46"/>
        <ellipse cx="298" cy="165" rx="8" ry="5" fill="#fff"/>
        <ellipse cx="342" cy="165" rx="8" ry="5" fill="#fff"/>
        <circle cx="298" cy="165" r="3.5" fill="#18181b"/>
        <circle cx="342" cy="165" r="3.5" fill="#18181b"/>
        <!-- Lip sync deformation zone -->
        <ellipse cx="320" cy="216" rx="24" ry="14" fill="#fb7185" opacity="0.3"/>
        <path d="M 304 216 Q 320 228 336 216" stroke="#991b1b" stroke-width="4" fill="none"/>
        <text x="32" y="370" fill="#fb7185" font-family="monospace" font-size="12">AUDIO-VISUAL PHONEME ASYNCHRONY · WAV2LIP SYNTHETIC RESIDUALS</text>
      </svg>
    `)}`;
  }

  // real_photo
  return `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" width="100%" height="100%">
      <rect width="640" height="400" fill="#0b1320"/>
      <ellipse cx="320" cy="180" rx="62" ry="76" fill="#ecc6aa"/>
      <path d="M 255 160 C 255 100, 385 100, 385 160 Z" fill="#292524"/>
      <ellipse cx="296" cy="168" rx="9" ry="6" fill="#ffffff"/>
      <ellipse cx="344" cy="168" rx="9" ry="6" fill="#ffffff"/>
      <circle cx="296" cy="168" r="4" fill="#451a03"/>
      <circle cx="344" cy="168" r="4" fill="#451a03"/>
      <circle cx="298" cy="166" r="1.5" fill="#ffffff"/>
      <circle cx="346" cy="166" r="1.5" fill="#ffffff"/>
      <path d="M 306 218 Q 320 224 334 218" stroke="#be123c" stroke-width="2" fill="none"/>
      <text x="32" y="370" fill="#10b981" font-family="monospace" font-size="12">INTEGRITY VERIFIED · SENSOR PRNU PATTERN MATCHES SENSOR · 0.98 COHERENCE</text>
    </svg>
  `)}`;
}

export const DUMMY_SAMPLES: SampleMediaItem[] = [
  {
    id: 'sample-real-1',
    title: 'Authentic Executive Address',
    type: 'video',
    category: 'real',
    description: '4K studio recorded keynote with organic facial blood-flow micro-pulsing and natural blinking cycles.',
    mediaUrl: createFaceSvg('real_speaker'),
    keyObservation: 'Natural corneal reflections, intact high-frequency skin pores, and 100% audio-visual phonetic alignment.',
    expectedScore: 4.2,
    expectedVerdict: 'authentic',
    anomalies: []
  },
  {
    id: 'sample-fake-1',
    title: 'Face-Swap Neural Synthesis',
    type: 'video',
    category: 'fake',
    description: 'High-profile speech with target identity swapped using an autoencoder neural pipeline.',
    mediaUrl: createFaceSvg('fake_faceswap'),
    keyObservation: 'Boundary warping artifacts along the jawline, irregular blink interval (38s pause), and blurred hairline boundary.',
    expectedScore: 92.4,
    expectedVerdict: 'deepfake',
    anomalies: [
      {
        id: 'anom-1',
        x: 50,
        y: 55,
        radius: 20,
        intensity: 0.95,
        region: 'mouth',
        title: 'Mouth Boundary Warping',
        description: 'Synthetic interpolation blurring during dental transition. Temporal phoneme jitter detected.',
        confidence: 96
      },
      {
        id: 'anom-2',
        x: 44,
        y: 42,
        radius: 12,
        intensity: 0.88,
        region: 'eyes',
        title: 'Corneal Specular Discrepancy',
        description: 'Pupil catchlight does not match environmental studio lighting vector (-42° offset).',
        confidence: 89
      },
      {
        id: 'anom-3',
        x: 51,
        y: 68,
        radius: 26,
        intensity: 0.82,
        region: 'jawline',
        title: 'Affine Blending Seam',
        description: 'Frequency discontinuity between pasted face region and host neck substrate.',
        confidence: 92
      }
    ]
  },
  {
    id: 'sample-fake-2',
    title: 'AI Audio-Driven Lip-Syncing',
    type: 'video',
    category: 'fake',
    description: 'Authentic video footage re-animated with cloned voice track using diffusion-based lip synchronizer.',
    mediaUrl: createFaceSvg('fake_lipsync'),
    keyObservation: 'Phoneme mismatch on plosive consonants (P, B, M) and artificial pixel smoothing around lower vermilion border.',
    expectedScore: 84.7,
    expectedVerdict: 'deepfake',
    anomalies: [
      {
        id: 'anom-4',
        x: 50,
        y: 54,
        radius: 22,
        intensity: 0.94,
        region: 'mouth',
        title: 'Audio-Visual Sync Anomaly',
        description: 'Audio plosive spike precedes facial lip closure by 140ms. Synthetic skin blurring on chin.',
        confidence: 94
      },
      {
        id: 'anom-5',
        x: 50,
        y: 45,
        radius: 14,
        intensity: 0.65,
        region: 'skin_texture',
        title: 'Frequency DCT Artifacts',
        description: 'Loss of natural high-frequency texture across lower half of face during speech bursts.',
        confidence: 78
      }
    ]
  },
  {
    id: 'sample-real-2',
    title: 'Studio Portrait Photography',
    type: 'image',
    category: 'real',
    description: 'High-resolution still portrait with continuous Bayer sensor noise and micro-expression fidelity.',
    mediaUrl: createFaceSvg('real_photo'),
    keyObservation: 'Uniform Photo-Response Non-Uniformity (PRNU) across frame. Consistent illumination gradient.',
    expectedScore: 5.8,
    expectedVerdict: 'authentic',
    anomalies: []
  }
];

export function generateDetectionResult(
  mediaName: string,
  mediaType: 'video' | 'image',
  isSyntheticOverride?: boolean,
  providedExtractedFrames?: ExtractedFrame[]
): DetectionResult {
  const isFake = isSyntheticOverride ?? (
    mediaName.toLowerCase().includes('fake') ||
    mediaName.toLowerCase().includes('swap') ||
    mediaName.toLowerCase().includes('sync') ||
    mediaName.toLowerCase().includes('ai')
  );

  const confidenceScore = isFake
    ? Math.floor(82 + Math.random() * 15) // 82 - 97%
    : Math.floor(3 + Math.random() * 8); // 3 - 11%

  const verdict = confidenceScore >= 70 ? 'deepfake' : confidenceScore >= 35 ? 'suspicious' : 'authentic';

  const framesCount = mediaType === 'video' ? 120 : 1;

  const anomalies: AnomalyPoint[] = isFake
    ? [
        {
          id: 'anom-mouth',
          x: 50 + (Math.random() * 4 - 2),
          y: 55 + (Math.random() * 3 - 1.5),
          radius: 20,
          intensity: 0.92,
          region: 'mouth',
          title: 'Perioral Boundary Discontinuity',
          description: 'Synthetic blending seam detected around lips and chin during speech articulation.',
          confidence: 94
        },
        {
          id: 'anom-eyes',
          x: 44 + (Math.random() * 4 - 2),
          y: 42 + (Math.random() * 3 - 1.5),
          radius: 14,
          intensity: 0.85,
          region: 'eyes',
          title: 'Ocular Lighting Vector Asymmetry',
          description: 'Catchlight reflection in left pupil does not match right pupil specular gradient.',
          confidence: 88
        },
        {
          id: 'anom-jaw',
          x: 52,
          y: 67,
          radius: 24,
          intensity: 0.79,
          region: 'jawline',
          title: 'Affine Blending Artifacts',
          description: 'Spatial boundary cut detected between host neck and warped facial mask.',
          confidence: 86
        },
        {
          id: 'anom-texture',
          x: 50,
          y: 34,
          radius: 16,
          intensity: 0.71,
          region: 'forehead',
          title: 'Spectral Smoothing (DCT Loss)',
          description: 'Absence of natural micro-pores and dermal sensor noise in neural-rendered region.',
          confidence: 82
        }
      ]
    : [];

  const frames: FrameAnalysis[] = [];
  const durationSeconds = mediaType === 'video' ? 4.0 : undefined;
  
  if (mediaType === 'video') {
    const numFrames = 24; // sampling 24 keyframes
    for (let i = 0; i < numFrames; i++) {
      const timestamp = (i / numFrames) * 4.0;
      const frameScore = isFake
        ? Math.min(99, Math.max(70, confidenceScore + Math.sin(i * 0.8) * 8))
        : Math.max(1, confidenceScore + Math.sin(i * 0.5) * 2);

      frames.push({
        frameIndex: i,
        timestamp,
        frameScore: Math.round(frameScore),
        anomalies: isFake
          ? anomalies.map(a => ({
              ...a,
              x: a.x + Math.sin(i * 0.3 + a.x) * 1.5,
              y: a.y + Math.cos(i * 0.3 + a.y) * 1.5,
              intensity: Math.min(1.0, Math.max(0.4, a.intensity + Math.sin(i * 0.5) * 0.15))
            }))
          : []
      });
    }
  } else {
    frames.push({
      frameIndex: 0,
      timestamp: 0,
      frameScore: confidenceScore,
      anomalies
    });
  }

  // Generate extracted frames if not explicitly provided
  const extractedFrames: ExtractedFrame[] = providedExtractedFrames && providedExtractedFrames.length > 0
    ? providedExtractedFrames
    : mediaType === 'video'
      ? buildExtractedFrames(generateSyntheticFrameImages(6, isFake), isFake)
      : [
          {
            id: 'frame-img-0',
            frameIndex: 1,
            timestamp: 0,
            timestampFormatted: '00:00.00',
            imageUrl: createFaceSvg(isFake ? 'fake_faceswap' : 'real_photo'),
            frameScore: confidenceScore,
            label: 'High-Resolution Still Image Inspection',
            status: isFake ? 'anomaly' : 'passed',
            anomalies: isFake ? anomalies : [],
            triggerNote: isFake
              ? 'Multi-scale spatial analysis flagged synthetic affine seams around perioral and ocular coordinates.'
              : 'Full sensor Bayer pattern coherent across entire pixel matrix.'
          }
        ];

  return {
    id: `det-${Date.now()}`,
    mediaName,
    mediaType,
    fileSizeFormatted: mediaType === 'video' ? '18.4 MB' : '3.8 MB',
    analyzedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    durationSeconds,
    resolution: '1920 × 1080 (1080p)',
    confidenceScore,
    verdict,
    analyzedFramesCount: framesCount,
    inferenceTimeMs: Math.floor(480 + Math.random() * 320),
    metrics: {
      facialBoundaryArtifacts: isFake ? Math.floor(88 + Math.random() * 10) : Math.floor(4 + Math.random() * 6),
      lipSyncDiscrepancy: isFake ? Math.floor(82 + Math.random() * 14) : Math.floor(2 + Math.random() * 5),
      ocularConsistency: isFake ? Math.floor(18 + Math.random() * 15) : Math.floor(92 + Math.random() * 7),
      frequencyArtifactScore: isFake ? Math.floor(86 + Math.random() * 11) : Math.floor(6 + Math.random() * 6),
      biologicalPulseSignal: isFake ? Math.floor(12 + Math.random() * 12) : Math.floor(89 + Math.random() * 9)
    },
    keyTriggerAreas: isFake
      ? [
          'Perioral Lip Boundary Warping (Frame 12–24)',
          'Asymmetrical Corneal Specular Reflection',
          'Affine Jawline Blending Discontinuity',
          'High-Frequency DCT Texture Attenuation'
        ]
      : [
          'Organic Blood-Volume Pulse Synchronicity Verified',
          'Intact PRNU Sensor Noise Across All Channels',
          'Natural Micro-Expression Temporal Cadence'
        ],
    summary: isFake
      ? `High-confidence synthetic facial synthesis detected (${confidenceScore}% score). Spatial frequency analysis confirms post-processing blending seams around perioral boundaries and abnormal ocular reflection vectors.`
      : `Media passed biometric and forensic integrity verification (${confidenceScore}% anomaly score). Natural dermal micro-texture and consistent optical physics observed throughout.`,
    frames,
    extractedFrames,
    modelDetails: {
      name: 'Veritas Neural Forensic Ensemble',
      version: 'v2.4-Transformer+DCT',
      backendType: 'simulated'
    }
  };
}
