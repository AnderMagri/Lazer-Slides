"use client";

import { useRef, useEffect, useCallback } from "react";
import type { SlideBackground } from "@/types/deck";

interface Props {
  config: SlideBackground;
  className?: string;
}

// ─── Gradient Orbs ───
// Soft, floating gradient circles that drift and blend

function drawGradientOrbs(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  config: SlideBackground
) {
  const { intensity, speed, colors } = config;

  // 5 orbs with different paths
  const orbs = [
    { cx: 0.3, cy: 0.3, r: 0.35, phase: 0, dx: 0.12, dy: 0.08 },
    { cx: 0.7, cy: 0.6, r: 0.30, phase: 1.5, dx: 0.10, dy: 0.14 },
    { cx: 0.5, cy: 0.8, r: 0.28, phase: 3.0, dx: 0.14, dy: 0.06 },
    { cx: 0.2, cy: 0.7, r: 0.22, phase: 4.2, dx: 0.08, dy: 0.12 },
    { cx: 0.8, cy: 0.2, r: 0.26, phase: 5.5, dx: 0.06, dy: 0.10 },
  ];

  for (let i = 0; i < orbs.length; i++) {
    const orb = orbs[i];
    const color = colors[i % colors.length];
    const time = t * speed * 0.0003;

    const x = (orb.cx + Math.sin(time + orb.phase) * orb.dx) * w;
    const y = (orb.cy + Math.cos(time * 0.7 + orb.phase) * orb.dy) * h;
    const r = orb.r * Math.min(w, h);

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
    gradient.addColorStop(0, hexToRgba(color, 0.4 * intensity));
    gradient.addColorStop(0.5, hexToRgba(color, 0.15 * intensity));
    gradient.addColorStop(1, hexToRgba(color, 0));

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
  }
}

// ─── Particle Mesh ───
// Connected dots forming a constellation-like pattern

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

// Per-canvas particle state stored on the canvas element itself
const PARTICLE_CACHE = new WeakMap<HTMLCanvasElement, { particles: Particle[]; key: string }>();

function initMeshParticles(w: number, h: number, count: number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 1,
    });
  }
  return particles;
}

function drawParticleMesh(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  _t: number,
  config: SlideBackground,
  canvas: HTMLCanvasElement
) {
  const { intensity, speed, colors } = config;
  const count = Math.floor(40 + intensity * 40);
  const key = `${w}-${h}-${count}`;

  let cache = PARTICLE_CACHE.get(canvas);
  if (!cache || cache.key !== key) {
    cache = { particles: initMeshParticles(w, h, count), key };
    PARTICLE_CACHE.set(canvas, cache);
  }
  const meshParticles = cache.particles;

  const connectionDist = 120 + intensity * 80;

  // Update positions
  for (const p of meshParticles) {
    p.x += p.vx * speed;
    p.y += p.vy * speed;
    if (p.x < 0 || p.x > w) p.vx *= -1;
    if (p.y < 0 || p.y > h) p.vy *= -1;
    p.x = Math.max(0, Math.min(w, p.x));
    p.y = Math.max(0, Math.min(h, p.y));
  }

  // Draw connections
  for (let i = 0; i < meshParticles.length; i++) {
    for (let j = i + 1; j < meshParticles.length; j++) {
      const a = meshParticles[i];
      const b = meshParticles[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < connectionDist) {
        const alpha = (1 - dist / connectionDist) * 0.3 * intensity;
        ctx.strokeStyle = hexToRgba(colors[0], alpha);
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  // Draw dots
  for (const p of meshParticles) {
    ctx.fillStyle = hexToRgba(colors[1] || colors[0], 0.6 * intensity);
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── Aurora ───
// Flowing color waves

function drawAurora(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  config: SlideBackground
) {
  const { intensity, speed, colors } = config;
  const time = t * speed * 0.0002;

  // Draw 3 wave layers
  for (let layer = 0; layer < 3; layer++) {
    const color = colors[layer % colors.length];
    const yBase = h * (0.3 + layer * 0.2);
    const amplitude = h * (0.15 + layer * 0.05);
    const freq = 0.003 + layer * 0.001;
    const phaseShift = layer * 1.2;

    ctx.beginPath();
    ctx.moveTo(0, h);

    for (let x = 0; x <= w; x += 3) {
      const y =
        yBase +
        Math.sin(x * freq + time + phaseShift) * amplitude * 0.6 +
        Math.sin(x * freq * 2.3 + time * 1.4 + phaseShift) * amplitude * 0.3 +
        Math.cos(x * freq * 0.7 + time * 0.6) * amplitude * 0.2;
      ctx.lineTo(x, y);
    }

    ctx.lineTo(w, h);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, yBase - amplitude, 0, h);
    gradient.addColorStop(0, hexToRgba(color, 0.02 * intensity));
    gradient.addColorStop(0.3, hexToRgba(color, 0.15 * intensity));
    gradient.addColorStop(0.6, hexToRgba(color, 0.08 * intensity));
    gradient.addColorStop(1, hexToRgba(color, 0));

    ctx.fillStyle = gradient;
    ctx.fill();
  }
}

// ─── Helpers ───

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ─── Main Component ───

export function CanvasBackground({ config, className = "" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  const draw = useCallback(
    (t: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      switch (config.effect) {
        case "gradient-orbs":
          drawGradientOrbs(ctx, w, h, t, config);
          break;
        case "particle-mesh":
          drawParticleMesh(ctx, w, h, t, config, canvas);
          break;
        case "aurora":
          drawAurora(ctx, w, h, t, config);
          break;
        case "none":
        default:
          break;
      }

      rafRef.current = requestAnimationFrame(draw);
    },
    [config]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || config.effect === "none") return;

    // Size canvas to parent
    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = parent.clientWidth * dpr;
      canvas.height = parent.clientHeight * dpr;
      canvas.style.width = `${parent.clientWidth}px`;
      canvas.style.height = `${parent.clientHeight}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);
      // Reset canvas dimensions for drawing (use CSS dimensions)
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas.parentElement!);

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
    };
  }, [config, draw]);

  if (config.effect === "none") return null;

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      aria-hidden="true"
    />
  );
}
