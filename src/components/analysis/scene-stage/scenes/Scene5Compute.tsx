"use client";

/**
 * Scene 5 — Compute (3.2s) — THE WOW MOMENT
 * ─────────────────────────────────────────
 * A reactor chamber. The central core breathes. Rings spin
 * counter to each other. Particles stream in from every angle.
 * Energy arcs flicker between rings. Glyph operators orbit in
 * expanding paths. Then at 2.8s — the core flares to white,
 * everything freezes for 200ms, then collapses into a seed.
 *
 * Required effects (min 2): we use 4.
 *   1. Particle convergence into core
 *   2. Concentric counter-rotating rings
 *   3. Orbiting glyph operators (Σ Π λ σ)
 *   4. Expanding energy rings pulsing out
 *   5. Core breath + crescendo flare
 *
 * Timeline:
 *   0.0s  rings fade in, start spinning
 *   0.2s  glyphs begin orbiting
 *   0.3s  particle stream starts converging to core
 *   0.4s  core begins breathing
 *   0.8s  energy rings start pulsing outward
 *   1.2s  arcs start flickering
 *   1.8s  core starts growing visibly
 *   2.6s  core flare (white burst)
 *   2.8s  200ms freeze
 *   3.0s  core collapses into seed
 *   3.2s  seed shoots upward out of frame
 */

import type { SceneComponentProps } from "../SceneStage";

const GLYPHS = ["Σ", "Π", "λ", "σ"];

function prn(i: number, s: number) {
  const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export default function Scene5Compute({ accent }: SceneComponentProps) {
  // Spokes for particle streams
  const particles = Array.from({ length: 28 }).map((_, i) => {
    const angle = (i / 28) * Math.PI * 2 + prn(i, 1) * 0.3;
    const radius = 180 + prn(i, 2) * 80;
    return {
      id: i,
      startX: Math.cos(angle) * radius,
      startY: Math.sin(angle) * radius,
      delay: 0.3 + prn(i, 3) * 1.3,
      duration: 0.9 + prn(i, 4) * 0.4,
      size: 1.5 + prn(i, 5) * 2,
    };
  });

  return (
    <div className="absolute inset-0">
      {/* Chamber backdrop */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
        style={{
          width: 520,
          height: 520,
          background: `radial-gradient(circle, ${accent}25, ${accent}10 40%, transparent 75%)`,
          filter: "blur(8px)",
        }}
      />

      {/* Chamber grid (subtle dot matrix) */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
        style={{
          width: 460,
          height: 460,
          backgroundImage: `radial-gradient(circle, ${accent}33 1px, transparent 1px)`,
          backgroundSize: "16px 16px",
          maskImage:
            "radial-gradient(circle, black 35%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(circle, black 35%, transparent 75%)",
          opacity: 0.6,
        }}
      />

      {/* Outer dashed ring (counter-clockwise) */}
      <div
        className="absolute left-1/2 top-1/2 rounded-full border-2 border-dashed"
        style={{
          width: 320,
          height: 320,
          borderColor: `${accent}66`,
          animation: "stgS5RingSpinReverse 14s linear infinite",
        }}
      />

      {/* Middle solid ring (clockwise) */}
      <div
        className="absolute left-1/2 top-1/2 rounded-full"
        style={{
          width: 240,
          height: 240,
          border: `2px solid ${accent}AA`,
          boxShadow: `0 0 20px ${accent}44, inset 0 0 20px ${accent}33`,
          animation: "stgS5RingSpin 9s linear infinite",
        }}
      />

      {/* Inner dashed ring (counter-clockwise fast) */}
      <div
        className="absolute left-1/2 top-1/2 rounded-full border border-dashed"
        style={{
          width: 170,
          height: 170,
          borderColor: accent,
          animation: "stgS5RingSpinReverse 5s linear infinite",
        }}
      />

      {/* Tick marks on middle ring */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * 360;
        return (
          <div
            key={`tick-${i}`}
            className="absolute left-1/2 top-1/2"
            style={{
              width: 240,
              height: 240,
              transform: "translate(-50%, -50%)",
              animation: "stgS5RingSpin 9s linear infinite",
            }}
          >
            <div
              className="absolute left-1/2 top-0 w-[2px] h-2.5 rounded-full"
              style={{
                backgroundColor: accent,
                transform: `translateX(-50%) rotate(${angle}deg)`,
                transformOrigin: "center 120px",
                boxShadow: `0 0 4px ${accent}`,
              }}
            />
          </div>
        );
      })}

      {/* Particle convergence streams */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: accent,
            boxShadow: `0 0 ${p.size * 3}px ${accent}`,
            ["--start-x" as string]: `${p.startX.toFixed(2)}px`,
            ["--start-y" as string]: `${p.startY.toFixed(2)}px`,
            animation: `stgS5ParticleIn ${p.duration.toFixed(
              2
            )}s ease-in ${p.delay.toFixed(2)}s infinite`,
          } as React.CSSProperties}
        />
      ))}

      {/* Expanding energy rings (pulse outward) */}
      {[0, 0.6, 1.2].map((delay, i) => (
        <div
          key={`pulse-${i}`}
          className="absolute left-1/2 top-1/2 rounded-full border-2"
          style={{
            width: 120,
            height: 120,
            borderColor: accent,
            animation: `stgS5RingExpand 1.8s ease-out ${0.8 + delay}s infinite`,
          }}
        />
      ))}

      {/* Orbiting glyph operators */}
      {GLYPHS.map((glyph, i) => (
        <div
          key={glyph}
          className="absolute left-1/2 top-1/2 flex items-center justify-center rounded-full bg-white shadow-md"
          style={{
            width: 28,
            height: 28,
            border: `2px solid ${accent}`,
            color: accent,
            fontSize: 14,
            fontWeight: 800,
            ["--orbit-r" as string]: `${130 + (i % 2) * 10}px`,
            animation: `stgS5GlyphOrbit ${6 + i * 0.4}s linear ${i * 0.3}s infinite`,
            transformOrigin: "center center",
          } as React.CSSProperties}
        >
          {glyph}
        </div>
      ))}

      {/* Energy arcs (SVG) */}
      <svg
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        width="340"
        height="340"
        viewBox="-170 -170 340 340"
      >
        {[0, 1, 2, 3].map((i) => {
          const startAngle = (i * 90 + 15) * (Math.PI / 180);
          const endAngle = (i * 90 + 75) * (Math.PI / 180);
          const r1 = 85;
          const r2 = 118;
          const x1 = Math.cos(startAngle) * r1;
          const y1 = Math.sin(startAngle) * r1;
          const x2 = Math.cos(endAngle) * r2;
          const y2 = Math.sin(endAngle) * r2;
          return (
            <path
              key={i}
              d={`M ${x1} ${y1} Q ${(x1 + x2) / 2 + 10} ${
                (y1 + y2) / 2 - 10
              } ${x2} ${y2}`}
              stroke={accent}
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              style={{
                filter: `drop-shadow(0 0 4px ${accent})`,
                animation: `stgS5ArcFlicker 1.6s ease-in-out ${
                  1.2 + i * 0.15
                }s infinite`,
              }}
            />
          );
        })}
      </svg>

      {/* Core flare (appears at 2.6s, explodes outward) */}
      <div
        className="absolute left-1/2 top-1/2 rounded-full pointer-events-none"
        style={{
          width: 120,
          height: 120,
          background: `radial-gradient(circle, white, ${accent} 30%, transparent 70%)`,
          filter: `blur(4px)`,
          opacity: 0,
          animation: "stgS5CoreFlare 0.8s ease-out 2.6s both",
        }}
      />

      {/* The core orb */}
      <div
        className="absolute left-1/2 top-1/2 rounded-full flex items-center justify-center"
        style={{
          width: 72,
          height: 72,
          background: `radial-gradient(circle at 35% 30%, white, ${accent} 55%, ${accent}CC 100%)`,
          boxShadow: `0 0 40px ${accent}, 0 0 80px ${accent}88, inset 0 -8px 16px rgba(0,0,0,0.15)`,
          animation: `
            stgS5CoreBreath 1.4s ease-in-out infinite,
            stgS5CoreGrow 0.8s ease-out 1.8s forwards,
            stgS5CoreCollapse 0.2s ease-in 3.0s forwards,
            stgS5SeedShoot 0.2s ease-in 3.15s forwards
          `,
        }}
      >
        <div
          className="text-white font-black"
          style={{
            fontSize: 26,
            textShadow: "0 0 8px rgba(255,255,255,0.8)",
          }}
        >
          ∑
        </div>
      </div>

      {/* Bottom caption */}
      <div
        className="absolute left-1/2 bottom-6 -translate-x-1/2 text-[11px] text-slate-400 font-medium tracking-wide pointer-events-none"
        style={{ animation: "stgChromeSlideIn 0.5s ease-out 0.2s both" }}
      >
        분석 코어에서 지표를 결합하는 중
      </div>
    </div>
  );
}
