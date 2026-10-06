import React, { useEffect, useRef } from 'react';
import { AnomalyPoint } from '../types/detection';

interface HeatmapCanvasProps {
  anomalies: AnomalyPoint[];
  width: number;
  height: number;
  opacity: number; // 0 to 1
  colorMode?: 'thermal' | 'inferno' | 'crimson';
}

export const HeatmapCanvas: React.FC<HeatmapCanvasProps> = ({
  anomalies,
  width,
  height,
  opacity,
  colorMode = 'thermal'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width === 0 || height === 0) return;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    if (opacity <= 0.01 || anomalies.length === 0) return;

    // Render pure clean thermal heat map on face (no complex tags, boxes, or mesh)
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.globalCompositeOperation = 'screen';

    anomalies.forEach((point) => {
      const cx = (point.x / 100) * width;
      const cy = (point.y / 100) * height;
      const radius = (point.radius / 100) * Math.min(width, height) * 1.5;

      const radGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);

      if (colorMode === 'inferno') {
        // Inferno: bright yellow core -> bright magenta -> purple -> transparent
        radGrad.addColorStop(0.0, `rgba(254, 240, 138, ${point.intensity * 0.95})`);
        radGrad.addColorStop(0.3, `rgba(244, 63, 94, ${point.intensity * 0.85})`);
        radGrad.addColorStop(0.65, `rgba(168, 85, 247, ${point.intensity * 0.55})`);
        radGrad.addColorStop(1.0, 'rgba(59, 7, 100, 0)');
      } else if (colorMode === 'crimson') {
        // Pure crimson alert
        radGrad.addColorStop(0.0, `rgba(225, 29, 72, ${point.intensity * 0.95})`);
        radGrad.addColorStop(0.4, `rgba(244, 63, 94, ${point.intensity * 0.7})`);
        radGrad.addColorStop(0.8, `rgba(251, 113, 133, ${point.intensity * 0.3})`);
        radGrad.addColorStop(1.0, 'rgba(225, 29, 72, 0)');
      } else {
        // Standard Thermal Jet: Intense Red -> Orange -> Yellow -> Green -> Cyan -> Transparent
        radGrad.addColorStop(0.0, `rgba(239, 68, 68, ${point.intensity * 0.95})`);
        radGrad.addColorStop(0.25, `rgba(249, 115, 22, ${point.intensity * 0.85})`);
        radGrad.addColorStop(0.55, `rgba(234, 179, 8, ${point.intensity * 0.65})`);
        radGrad.addColorStop(0.75, `rgba(34, 197, 94, ${point.intensity * 0.4})`);
        radGrad.addColorStop(0.9, `rgba(6, 182, 212, ${point.intensity * 0.2})`);
        radGrad.addColorStop(1.0, 'rgba(6, 182, 212, 0)');
      }

      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }, [anomalies, width, height, opacity, colorMode]);

  return (
    <div className="absolute inset-0 pointer-events-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full pointer-events-none"
      />
    </div>
  );
};
