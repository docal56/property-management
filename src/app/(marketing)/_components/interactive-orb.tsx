"use client";

import { useEffect, useRef, useState } from "react";

const AUDIO_SRC = "/marketing/call-demo.mp3";
const PARTICLE_COUNT = 500;
const ORB_SIZE = 880;

type Particle = {
  x: number;
  y: number;
  z: number;
  size: number;
  brightness: number;
  // Per-particle drift parameters for organic motion.
  freqX: number;
  freqY: number;
  freqZ: number;
  phaseX: number;
  phaseY: number;
  phaseZ: number;
  amp: number;
};

export function InteractiveOrb() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isPlayingRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Keep latest isPlaying in a ref so the rAF loop can read it without restarting.
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Audio setup
  useEffect(() => {
    const audio = new Audio(AUDIO_SRC);
    audio.preload = "none";
    const onEnded = () => setIsPlaying(false);
    audio.addEventListener("ended", onEnded);
    audioRef.current = audio;
    return () => {
      audio.removeEventListener("ended", onEnded);
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  // Particle sphere render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = ORB_SIZE * dpr;
    canvas.height = ORB_SIZE * dpr;
    ctx.scale(dpr, dpr);

    // Generate particles on a unit sphere using a Fibonacci spiral,
    // then add per-particle jitter and brightness variance for an "uneven" look.
    const goldenAngle = Math.PI * (Math.sqrt(5) - 1);
    const particles: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const yUnit = 1 - (i / (PARTICLE_COUNT - 1)) * 2;
      const ringRadius = Math.sqrt(Math.max(0, 1 - yUnit * yUnit));
      const theta = goldenAngle * i;
      const xUnit = Math.cos(theta) * ringRadius;
      const zUnit = Math.sin(theta) * ringRadius;

      const jitter = 0.05;
      const radialJitter = 1 + (Math.random() - 0.5) * 0.06;
      particles.push({
        x: (xUnit + (Math.random() - 0.5) * jitter) * radialJitter,
        y: (yUnit + (Math.random() - 0.5) * jitter) * radialJitter,
        z: (zUnit + (Math.random() - 0.5) * jitter) * radialJitter,
        size: 1.1 + Math.random() * 1.8,
        brightness: 0.7 + Math.random() * 0.3,
        freqX: 0.4 + Math.random() * 0.9,
        freqY: 0.4 + Math.random() * 0.9,
        freqZ: 0.4 + Math.random() * 0.9,
        phaseX: Math.random() * Math.PI * 2,
        phaseY: Math.random() * Math.PI * 2,
        phaseZ: Math.random() * Math.PI * 2,
        amp: 0.015 + Math.random() * 0.035,
      });
    }

    const cx = ORB_SIZE / 2;
    const cy = ORB_SIZE / 2;
    const sphereRadius = ORB_SIZE * 0.42;
    let rafId = 0;
    const startTs = performance.now();

    const draw = () => {
      // Time in seconds; particles drift faster while audio is playing.
      const t =
        ((performance.now() - startTs) / 1000) *
        (isPlayingRef.current ? 1.8 : 1);

      ctx.clearRect(0, 0, ORB_SIZE, ORB_SIZE);

      const projected: { sx: number; sy: number; rz: number; size: number }[] =
        [];
      for (const p of particles) {
        // Per-particle organic drift on each axis (no global rotation).
        const dx = Math.sin(t * p.freqX + p.phaseX) * p.amp;
        const dy = Math.cos(t * p.freqY + p.phaseY) * p.amp;
        const dz = Math.sin(t * p.freqZ + p.phaseZ) * p.amp;

        const px = p.x + dx;
        const py = p.y + dy;
        const pz = p.z + dz;

        const persp = 1 / (1.55 - pz * 0.45);
        const sx = cx + px * sphereRadius * persp;
        const sy = cy + py * sphereRadius * persp;
        const depth = (pz + 1) / 2; // 0 back → 1 front
        const size = p.size * (0.55 + depth * 0.65);
        projected.push({ sx, sy, rz: pz, size });
      }

      // Back-to-front so front particles overlap correctly.
      projected.sort((a, b) => a.rz - b.rz);

      ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
      for (const p of projected) {
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      rafId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(rafId);
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.currentTime = 0;
      audio.play().catch(() => {
        // Autoplay or missing-file failure — keep visual state in sync.
      });
      setIsPlaying(true);
    }
  };

  return (
    <div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
      <button
        aria-label={
          isPlaying ? "Stop the demo call" : "Listen to a sample call from Buzz"
        }
        aria-pressed={isPlaying}
        className="group relative size-[384px] cursor-pointer rounded-full focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300/40 sm:size-[560px] md:size-[720px] lg:size-[880px]"
        onClick={toggle}
        type="button"
      >
        {/* Soft outer halo */}
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute -inset-[40px] rounded-full blur-3xl transition-opacity duration-500 ${isPlaying ? "opacity-70" : "opacity-40"}`}
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(42,92,244,0.18) 0%, rgba(173,194,255,0.06) 50%, transparent 75%)",
          }}
        />

        {/* Particle sphere */}
        <canvas
          className="pointer-events-none absolute inset-0 h-full w-full"
          ref={canvasRef}
          tabIndex={-1}
        />

        {/* Listen to a call pill — text + inset black play button */}
        <span
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 inline-flex h-[56px] -translate-x-1/2 -translate-y-1/2 items-center gap-[12px] rounded-full bg-white pr-[4px] pl-[20px] shadow-[0_8px_30px_rgba(0,0,0,0.25)] transition-transform group-hover:scale-[1.02]"
        >
          <span className="font-medium font-season text-[18px] text-foreground leading-[18px] tracking-[0.03em]">
            {isPlaying ? "Pause" : "Listen to a call"}
          </span>
          <span className="flex size-[48px] shrink-0 items-center justify-center rounded-full bg-foreground text-white">
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </span>
        </span>
      </button>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="currentColor"
      height="17"
      viewBox="0 0 17 19"
      width="15"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M15 6.46858C17 7.62328 17 10.51 15 11.6647L4.5 17.7269C2.5 18.8816 0 17.4382 0 15.1288L0 3.00447C0 0.695072 2.5 -0.748305 4.5 0.406396L15 6.46858Z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="currentColor"
      height="14"
      viewBox="0 0 12 14"
      width="12"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect height="14" rx="1" width="3.5" x="1" y="0" />
      <rect height="14" rx="1" width="3.5" x="7.5" y="0" />
    </svg>
  );
}
