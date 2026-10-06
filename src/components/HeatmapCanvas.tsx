import React, { useEffect, useRef, useState } from 'react';
import { AnomalyPoint } from '../types/detection';

interface HeatmapCanvasProps {
  anomalies: AnomalyPoint[];
  width: number;
  height: number;
  opacity: number; // 0 to 1
  colorMode: 'thermal' | 'inferno' | 'crimson';
  showBoundingBoxes: boolean;
  showLandmarkMesh: boolean;
  activeAnomalyId: string | null;
  onSelectAnomaly?: (anomaly: AnomalyPoint | null) => void;
}

export const HeatmapCanvas: React.FC<HeatmapCanvasProps> = ({
  anomalies,
  width,
  height,
  opacity,
  colorMode,
  showBoundingBoxes,
  showLandmarkMesh,
  activeAnomalyId,
  onSelectAnomaly
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoveredAnomaly, setHoveredAnomaly] = useState<AnomalyPoint | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width === 0 || height === 0) return;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    if (opacity <= 0.01 && !showBoundingBoxes && !showLandmarkMesh) return;

    // 1. Draw Facial Landmark Mesh if enabled
    if (showLandmarkMesh) {
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.28)';
      ctx.lineWidth = 1;

      // Canonical normalized face landmark points (simulated 3D CV mesh)
      const landmarks = [
        { x: 0.50, y: 0.32 }, // Forehead top
        { x: 0.44, y: 0.37 }, { x: 0.56, y: 0.37 }, // Temple
        { x: 0.40, y: 0.42 }, { x: 0.48, y: 0.42 }, // Left eye
        { x: 0.52, y: 0.42 }, { x: 0.60, y: 0.42 }, // Right eye
        { x: 0.50, y: 0.48 }, // Nose tip
        { x: 0.46, y: 0.55 }, { x: 0.54, y: 0.55 }, // Lip corners
        { x: 0.50, y: 0.57 }, // Chin
        { x: 0.38, y: 0.50 }, { x: 0.62, y: 0.50 }, // Cheeks
        { x: 0.42, y: 0.64 }, { x: 0.58, y: 0.64 }, // Jaw angle
      ];

      // Draw nodes
      landmarks.forEach((pt) => {
        const px = pt.x * width;
        const py = pt.y * height;
        ctx.fillStyle = 'rgba(56, 189, 248, 0.7)';
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw subtle connective triangulation lines
      const connections: [number, number][] = [
        [0, 1], [0, 2], [1, 3], [2, 6], [3, 4], [5, 6],
        [4, 7], [5, 7], [7, 8], [7, 9], [8, 10], [9, 10],
        [3, 11], [6, 12], [11, 13], [12, 14], [13, 10], [14, 10]
      ];

      connections.forEach(([i, j]) => {
        const p1 = landmarks[i];
        const p2 = landmarks[j];
        if (p1 && p2) {
          ctx.beginPath();
          ctx.moveTo(p1.x * width, p1.y * height);
          ctx.lineTo(p2.x * width, p2.y * height);
          ctx.stroke();
        }
      });
      ctx.restore();
    }

    // 2. Draw Thermal Heat Map Field
    if (opacity > 0.01 && anomalies.length > 0) {
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.globalCompositeOperation = 'screen';

      anomalies.forEach((point) => {
        const cx = (point.x / 100) * width;
        const cy = (point.y / 100) * height;
        const radius = (point.radius / 100) * Math.min(width, height) * 1.5;

        const radGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);

        if (colorMode === 'thermal') {
          // Classic Jet thermal ramp: Red center -> Orange -> Yellow -> Green -> Cyan -> Transparent
          radGrad.addColorStop(0.0, `rgba(239, 68, 68, ${point.intensity * 0.95})`);
          radGrad.addColorStop(0.25, `rgba(249, 115, 22, ${point.intensity * 0.85})`);
          radGrad.addColorStop(0.55, `rgba(234, 179, 8, ${point.intensity * 0.65})`);
          radGrad.addColorStop(0.75, `rgba(34, 197, 94, ${point.intensity * 0.4})`);
          radGrad.addColorStop(0.9, `rgba(6, 182, 212, ${point.intensity * 0.2})`);
          radGrad.addColorStop(1.0, 'rgba(6, 182, 212, 0)');
        } else if (colorMode === 'inferno') {
          // Inferno: bright yellow core -> bright magenta -> purple -> deep black
          radGrad.addColorStop(0.0, `rgba(254, 240, 138, ${point.intensity * 0.95})`);
          radGrad.addColorStop(0.3, `rgba(244, 63, 94, ${point.intensity * 0.85})`);
          radGrad.addColorStop(0.65, `rgba(168, 85, 247, ${point.intensity * 0.55})`);
          radGrad.addColorStop(1.0, 'rgba(59, 7, 100, 0)');
        } else {
          // Crimson forensic warning
          radGrad.addColorStop(0.0, `rgba(225, 29, 72, ${point.intensity * 0.95})`);
          radGrad.addColorStop(0.4, `rgba(244, 63, 94, ${point.intensity * 0.7})`);
          radGrad.addColorStop(0.8, `rgba(251, 113, 133, ${point.intensity * 0.3})`);
          radGrad.addColorStop(1.0, 'rgba(225, 29, 72, 0)');
        }

        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
    }

    // 3. Draw Bounding Boxes and Target Indicators
    if (showBoundingBoxes && anomalies.length > 0) {
      ctx.save();
      anomalies.forEach((point) => {
        const cx = (point.x / 100) * width;
        const cy = (point.y / 100) * height;
        const boxW = (point.radius / 100) * width * 1.3;
        const boxH = (point.radius / 100) * height * 1.2;
        const bx = cx - boxW / 2;
        const by = cy - boxH / 2;

        const isHovered = hoveredAnomaly?.id === point.id;
        const isActive = activeAnomalyId === point.id;

        ctx.strokeStyle = isActive || isHovered ? '#f43f5e' : 'rgba(244, 63, 94, 0.7)';
        ctx.lineWidth = isActive || isHovered ? 2 : 1.2;
        ctx.setLineDash([4, 4]);

        // Box border
        ctx.strokeRect(bx, by, boxW, boxH);

        // Corner ticks
        ctx.setLineDash([]);
        const tick = 6;
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 2;

        // Top-left corner
        ctx.beginPath();
        ctx.moveTo(bx, by + tick);
        ctx.lineTo(bx, by);
        ctx.lineTo(bx + tick, by);
        ctx.stroke();

        // Bottom-right corner
        ctx.beginPath();
        ctx.moveTo(bx + boxW - tick, by + boxH);
        ctx.lineTo(bx + boxW, by + boxH);
        ctx.lineTo(bx + boxW, by + boxH - tick);
        ctx.stroke();

        // Forensic Label Tag
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        const tagText = `${point.region.toUpperCase()}: ${point.confidence}%`;
        ctx.font = '10px "JetBrains Mono", monospace';
        const textMetrics = ctx.measureText(tagText);
        const tagW = textMetrics.width + 12;
        const tagH = 18;

        ctx.fillRect(bx, Math.max(0, by - tagH - 2), tagW, tagH);
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, Math.max(0, by - tagH - 2), tagW, tagH);

        ctx.fillStyle = '#fda4af';
        ctx.fillText(tagText, bx + 6, Math.max(12, by - 6));
      });
      ctx.restore();
    }
  }, [anomalies, width, height, opacity, colorMode, showBoundingBoxes, showLandmarkMesh, activeAnomalyId, hoveredAnomaly]);

  // Handle canvas mouse move to detect hovered anomaly
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || anomalies.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    let found: AnomalyPoint | null = null;
    for (const point of anomalies) {
      const cx = (point.x / 100) * width;
      const cy = (point.y / 100) * height;
      const radius = (point.radius / 100) * Math.min(width, height) * 0.8;
      const dist = Math.hypot(mx - cx, my - cy);
      if (dist <= radius) {
        found = point;
        break;
      }
    }
    setHoveredAnomaly(found);
  };

  const handleClick = () => {
    if (onSelectAnomaly) {
      onSelectAnomaly(hoveredAnomaly);
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredAnomaly(null)}
        onClick={handleClick}
        className={`w-full h-full pointer-events-auto ${hoveredAnomaly ? 'cursor-pointer' : ''}`}
      />

      {/* Tooltip on Hover */}
      {hoveredAnomaly && (
        <div
          className="absolute z-30 pointer-events-none -translate-x-1/2 -translate-y-full mb-3 px-3 py-2 bg-slate-950/95 border border-rose-500/40 rounded shadow-xl backdrop-blur-md max-w-xs transition-opacity"
          style={{
            left: `${hoveredAnomaly.x}%`,
            top: `${Math.max(10, hoveredAnomaly.y - 12)}%`
          }}
        >
          <div className="flex items-center justify-between gap-3 text-xs mb-1">
            <span className="font-semibold text-rose-400 font-mono tracking-tight">
              {hoveredAnomaly.title}
            </span>
            <span className="font-mono text-xs text-rose-300 tabular-nums">
              {hoveredAnomaly.confidence}% Prob
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-tight">
            {hoveredAnomaly.description}
          </p>
        </div>
      )}
    </div>
  );
};
