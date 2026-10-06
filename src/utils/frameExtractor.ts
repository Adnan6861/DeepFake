import { ExtractedFrame, AnomalyPoint } from '../types/detection';
import { createFaceSvg } from './sampleData';

/**
 * Extracts multiple still image frames from an HTML5 video source URL
 */
export async function extractFramesFromVideoUrl(
  videoUrl: string,
  frameCount: number = 6
): Promise<string[]> {
  return new Promise((resolve) => {
    // Check if the URL is a real playable video blob or format
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.src = videoUrl;
    video.muted = true;
    video.playsInline = true;

    const timeout = setTimeout(() => {
      // Fallback if video takes too long or isn't a browser-decodable video file
      resolve(generateSyntheticFrameImages(frameCount, false));
    }, 4000);

    video.onloadedmetadata = async () => {
      const duration = video.duration || 4.0;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const extractedImages: string[] = [];

      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 360;

      // Sample timestamps evenly across duration
      const times: number[] = [];
      const step = duration / (frameCount + 1);
      for (let i = 1; i <= frameCount; i++) {
        times.push(Math.min(duration - 0.1, step * i));
      }

      try {
        for (const t of times) {
          await new Promise<void>((res) => {
            const onSeeked = () => {
              video.removeEventListener('seeked', onSeeked);
              if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                extractedImages.push(canvas.toDataURL('image/jpeg', 0.85));
              }
              res();
            };
            video.addEventListener('seeked', onSeeked);
            video.currentTime = t;
          });
        }
        clearTimeout(timeout);
        resolve(extractedImages);
      } catch (err) {
        clearTimeout(timeout);
        resolve(generateSyntheticFrameImages(frameCount, false));
      }
    };

    video.onerror = () => {
      clearTimeout(timeout);
      resolve(generateSyntheticFrameImages(frameCount, false));
    };
  });
}

/**
 * Generates synthetic frame variations (mouth phonemes, blinks, angle)
 */
export function generateSyntheticFrameImages(
  count: number = 6,
  isFake: boolean = true
): string[] {
  const images: string[] = [];
  const phonemes = ['A', 'O', 'M', 'E', 'Closed', 'P'];

  for (let i = 0; i < count; i++) {
    const phoneme = phonemes[i % phonemes.length];
    const isBlinking = i === 2; // Frame 3 simulates blink anomaly
    const mouthHeight = phoneme === 'O' ? 14 : phoneme === 'A' ? 18 : phoneme === 'M' ? 3 : 8;

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" width="100%" height="100%">
        <defs>
          <radialGradient id="bg_${i}" cx="50%" cy="40%" r="80%">
            <stop offset="0%" stop-color="${isFake ? '#1a1829' : '#1e293b'}"/>
            <stop offset="100%" stop-color="${isFake ? '#0b0914' : '#0f172a'}"/>
          </radialGradient>
          <linearGradient id="skin_${i}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="${isFake ? '#fce2cd' : '#f5d0b5'}"/>
            <stop offset="100%" stop-color="${isFake ? '#ebb594' : '#d9a07a'}"/>
          </linearGradient>
        </defs>
        <rect width="640" height="400" fill="url(#bg_${i})"/>
        
        <!-- Torso -->
        <path d="M 190 400 C 210 320, 260 280, 320 280 C 380 280, 430 320, 450 400 Z" fill="#1b1d28"/>
        
        <!-- Neck -->
        <rect x="295" y="215" width="50" height="75" rx="6" fill="${isFake ? '#c48a68' : '#d9a07a'}"/>
        
        ${isFake ? `
        <!-- Affine Face-Swap Boundary Line (Trigger Zone) -->
        <ellipse cx="320" cy="180" rx="68" ry="84" fill="#ff0055" opacity="0.08" stroke="#f43f5e" stroke-width="1.2" stroke-dasharray="3 3"/>
        ` : ''}

        <!-- Face Mask -->
        <ellipse cx="320" cy="180" rx="62" ry="76" fill="url(#skin_${i})"/>

        <!-- Hair -->
        <path d="M 250 165 C 245 105, 310 88, 388 108 C 392 145, 386 175, 386 175 C 370 120, 340 112, 275 125 Z" fill="#1f1c19"/>

        <!-- Eyes: Blinking vs Open -->
        ${isBlinking ? `
          <!-- Blink Frame -->
          <path d="M 285 168 Q 295 174 305 168" stroke="#221815" stroke-width="2.5" fill="none" stroke-linecap="round"/>
          <path d="M 335 168 Q 345 174 355 168" stroke="#221815" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        ` : `
          <!-- Open Eyes -->
          <ellipse cx="295" cy="168" rx="10" ry="5.5" fill="#f8fafc"/>
          <ellipse cx="345" cy="168" rx="10" ry="5.5" fill="#f8fafc"/>
          <circle cx="295" cy="168" r="4.2" fill="#1c1917"/>
          <circle cx="345" cy="168" r="4.2" fill="#1c1917"/>
          <circle cx="${isFake ? 296 : 297}" cy="166" r="1.5" fill="#ffffff"/>
          <circle cx="${isFake ? 346 : 347}" cy="166" r="1.5" fill="#ffffff"/>
        `}

        <!-- Eyebrows -->
        <path d="M 284 156 Q 295 152 306 156" stroke="#1c1917" stroke-width="2.2" fill="none" stroke-linecap="round"/>
        <path d="M 334 156 Q 345 152 356 156" stroke="#1c1917" stroke-width="2.2" fill="none" stroke-linecap="round"/>

        <!-- Nose -->
        <path d="M 320 168 L 318 194 L 323 194" stroke="#d49372" stroke-width="1.5" fill="none"/>

        <!-- Dynamic Mouth Shape per frame -->
        <ellipse cx="320" cy="220" rx="16" ry="${mouthHeight}" fill="${isFake ? '#881337' : '#9f1239'}" stroke="#b95757" stroke-width="1.5"/>

        <!-- Frame Code Stamp -->
        <text x="32" y="370" fill="${isFake ? '#fda4af' : '#94a3b8'}" font-family="monospace" font-size="12">
          FRAME #${String((i + 1) * 8).padStart(2, '0')} · TIMECODE 00:0${i}.${(i * 32) % 60}s · PHONEME [${phoneme}]
        </text>
      </svg>
    `;

    images.push(`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`);
  }

  return images;
}

/**
 * Builds ExtractedFrame list from image array with simulated or model anomalies
 */
export function buildExtractedFrames(
  images: string[],
  isFake: boolean = true
): ExtractedFrame[] {
  const frameLabels = [
    'Keyframe #08 · Baseline Facial Geometry',
    'Keyframe #16 · Vowel Phoneme Articulation',
    'Keyframe #24 · Blink Cycle & Pupil Reflection',
    'Keyframe #32 · Plosive Consonant Transition',
    'Keyframe #40 · Rapid Jaw Angle Shift',
    'Keyframe #48 · Final Phoneme Recovery'
  ];

  return images.map((imgUrl, idx) => {
    const frameIndex = (idx + 1) * 8;
    const timestamp = idx * 0.65;
    const minutes = Math.floor(timestamp / 60);
    const seconds = (timestamp % 60).toFixed(2);
    const timestampFormatted = `00:${seconds.padStart(5, '0')}`;

    // Generate anomalies for this specific frame
    const anomalies: AnomalyPoint[] = [];
    let frameScore = 4;
    let status: 'passed' | 'warning' | 'anomaly' = 'passed';
    let triggerNote = 'Biometric features consistent with natural human physiology.';

    if (isFake) {
      if (idx === 1 || idx === 3) {
        // High mouth anomaly on speech frames
        frameScore = 94;
        status = 'anomaly';
        triggerNote = 'Severe perioral boundary warping and dental texture smoothing detected.';
        anomalies.push({
          id: `frame-${idx}-anom-mouth`,
          x: 50,
          y: 55,
          radius: 22,
          intensity: 0.96,
          region: 'mouth',
          title: 'Perioral Boundary Warp',
          description: 'Synthetic blending seam around lips during phoneme articulation.',
          confidence: 96
        });
        anomalies.push({
          id: `frame-${idx}-anom-jaw`,
          x: 52,
          y: 68,
          radius: 24,
          intensity: 0.84,
          region: 'jawline',
          title: 'Affine Boundary Seam',
          description: 'Cut-and-paste mask seam between chin and host neck.',
          confidence: 88
        });
      } else if (idx === 2) {
        // Eye blink anomaly frame
        frameScore = 89;
        status = 'anomaly';
        triggerNote = 'Corneal reflection vector asymmetry and unnatural eyelid crease curvature.';
        anomalies.push({
          id: `frame-${idx}-anom-eye`,
          x: 44,
          y: 42,
          radius: 16,
          intensity: 0.91,
          region: 'eyes',
          title: 'Specular Catchlight Discrepancy',
          description: 'Specular vector does not align with key studio light source.',
          confidence: 91
        });
      } else if (idx === 4) {
        // Texture smoothing
        frameScore = 82;
        status = 'warning';
        triggerNote = 'Loss of high-frequency DCT dermal pores across forehead and cheeks.';
        anomalies.push({
          id: `frame-${idx}-anom-texture`,
          x: 50,
          y: 34,
          radius: 18,
          intensity: 0.78,
          region: 'forehead',
          title: 'Frequency DCT Attenuation',
          description: 'Absence of natural micro-pores and sensor noise floor.',
          confidence: 82
        });
      } else {
        frameScore = 76;
        status = 'warning';
        triggerNote = 'Subtle edge blur detected along hair-boundary seam.';
        anomalies.push({
          id: `frame-${idx}-anom-hair`,
          x: 52,
          y: 30,
          radius: 18,
          intensity: 0.72,
          region: 'jawline',
          title: 'Affine Mask Transition',
          description: 'Neural mask edge softening artifact.',
          confidence: 76
        });
      }
    }

    return {
      id: `frame-${idx}`,
      frameIndex,
      timestamp,
      timestampFormatted,
      imageUrl: imgUrl,
      frameScore,
      label: frameLabels[idx] || `Keyframe #${frameIndex}`,
      status,
      anomalies,
      triggerNote
    };
  });
}
