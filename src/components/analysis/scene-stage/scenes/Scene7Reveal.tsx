"use client";

/**
 * Scene 7 — Reveal (1.8s)
 * ───────────────────────
 * The dossier arrives at camera, bobs gently, unwraps its ribbon,
 * a shock wave and particle bloom pop outward, and a COMPLETED
 * stamp settles below. This is the handoff moment — the citizen's
 * question has been fulfilled.
 *
 * Timeline:
 *   0.0s  dossier floats in from offscreen
 *   0.35s spine/seal unwraps horizontally
 *   0.55s ribbon unfurls across the face
 *   0.75s shock wave pulse
 *   0.80s particle bloom (24 particles radiate outward)
 *   1.00s COMPLETED stamp settles
 *   1.15s dossier begins gentle bob (ambient until exit)
 */

import type { SceneComponentProps } from "../SceneStage";

const BLOOM_COUNT = 24;

function prn(i: number, s: number) {
  const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export default function Scene7Reveal({ query, accent }: SceneComponentProps) {
  // Precompute bloom particle directions
  const bloomParticles = Array.from({ length: BLOOM_COUNT }).map((_, i) => {
    const angle = (i / BLOOM_COUNT) * Math.PI * 2 + prn(i, 7) * 0.4;
    const dist = 140 + prn(i, 8) * 90;
    return {
      id: i,
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      size: 2 + prn(i, 9) * 3,
      delay: 0.8 + prn(i, 10) * 0.15,
    };
  });

  return (
    <div className="absolute inset-0">
      {/* Victory glow backdrop */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
        style={{
          width: 640,
          height: 460,
          background: `radial-gradient(ellipse, ${accent}28, ${accent}10 40%, transparent 75%)`,
          filter: "blur(10px)",
          animation: "stgFloorGlow 2.4s ease-in-out infinite",
        }}
      />

      {/* Shock wave ring 1 */}
      <div
        className="absolute left-1/2 top-1/2 rounded-full border-2 pointer-events-none"
        style={{
          width: 220,
          height: 220,
          borderColor: accent,
          opacity: 0,
          animation: "stgS7ShockWave 0.9s ease-out 0.75s both",
        }}
      />
      {/* Shock wave ring 2 */}
      <div
        className="absolute left-1/2 top-1/2 rounded-full border-2 pointer-events-none"
        style={{
          width: 260,
          height: 260,
          borderColor: accent,
          opacity: 0,
          animation: "stgS7ShockWave 1s ease-out 0.9s both",
        }}
      />

      {/* Central bloom glow */}
      <div
        className="absolute left-1/2 top-1/2 rounded-full pointer-events-none"
        style={{
          width: 200,
          height: 200,
          background: `radial-gradient(circle, white, ${accent} 35%, transparent 72%)`,
          filter: "blur(6px)",
          opacity: 0,
          animation: "stgS7Bloom 1.1s ease-out 0.7s both",
        }}
      />

      {/* Particle bloom (radiates outward) */}
      {bloomParticles.map((p) => (
        <div
          key={p.id}
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: accent,
            boxShadow: `0 0 ${p.size * 3}px ${accent}`,
            ["--bloom-x" as string]: `${p.x.toFixed(2)}px`,
            ["--bloom-y" as string]: `${p.y.toFixed(2)}px`,
            animation: `stgS7ParticleBloom 1.1s ease-out ${p.delay.toFixed(2)}s both`,
          } as React.CSSProperties}
        />
      ))}

      {/* The dossier (arrives, bobs, reveals) */}
      <div
        className="absolute left-1/2 top-1/2 rounded-2xl bg-white"
        style={{
          width: 380,
          padding: "18px 22px 20px",
          border: `2px solid ${accent}`,
          boxShadow: `0 28px 56px -14px ${accent}55, 0 0 0 6px ${accent}14, 0 2px 0 rgba(255,255,255,0.9)`,
          animation: `
            stgS7DossierFloat 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0s both,
            stgS7DossierBob 2.4s ease-in-out 1.15s infinite
          `,
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: accent, boxShadow: `0 0 8px ${accent}` }}
          />
          <span
            className="text-[9px] font-bold uppercase tracking-[0.18em]"
            style={{ color: accent }}
          >
            Analysis Complete
          </span>
          <span className="ml-auto text-[9px] text-slate-400 tabular-nums font-medium">
            #SDA-2026
          </span>
        </div>

        {/* Spine unwrap bar */}
        <div
          className="h-[3px] rounded-full mb-3 origin-left"
          style={{
            background: `linear-gradient(90deg, ${accent}, ${accent}66)`,
            boxShadow: `0 0 8px ${accent}66`,
            animation: "stgS7SpineUnwrap 0.45s cubic-bezier(0.22, 1, 0.36, 1) 0.35s both",
          }}
        />

        {/* Ribbon reveal of the query */}
        <div
          className="relative text-[13px] font-semibold text-slate-700 leading-snug mb-3"
          style={{
            animation: "stgS7RibbonUnfurl 0.7s ease-out 0.55s both",
          }}
        >
          &ldquo;{query || "서울에서 아이 키우기 좋은 구는 어디야?"}&rdquo;
        </div>

        {/* Result summary row */}
        <div
          className="flex items-center gap-2"
          style={{
            animation: "stgS7Completed 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.95s both",
          }}
        >
          <div
            className="flex items-center gap-1.5 rounded-full px-2 py-1"
            style={{
              backgroundColor: `${accent}14`,
              border: `1px solid ${accent}33`,
            }}
          >
            <div
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: accent }}
            />
            <span
              className="text-[9px] font-bold tracking-wider"
              style={{ color: accent }}
            >
              순위 · 차트 · 지도
            </span>
          </div>
          <div className="text-[9px] text-slate-400 font-medium">
            4개 데이터셋 기반
          </div>
        </div>

        {/* COMPLETED stamp (bottom-right corner) */}
        <div
          className="absolute -bottom-3 -right-3 flex items-center justify-center rounded-full font-bold"
          style={{
            width: 58,
            height: 58,
            border: `3px solid ${accent}`,
            color: accent,
            fontSize: 9,
            background: "rgba(255,255,255,0.98)",
            boxShadow: `0 6px 16px ${accent}44`,
            letterSpacing: "0.06em",
            lineHeight: 1,
            textAlign: "center",
            transform: "rotate(-6deg)",
            animation:
              "stgS1StampSlam 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) 1.0s both",
          }}
        >
          <div>
            COMPLETE
            <div style={{ fontSize: 7, marginTop: 2, opacity: 0.7 }}>
              2026·04·10
            </div>
          </div>
        </div>
      </div>

      {/* Bottom caption */}
      <div
        className="absolute left-1/2 bottom-6 -translate-x-1/2 text-[11px] font-semibold tracking-wide pointer-events-none"
        style={{
          color: accent,
          animation: "stgS7Completed 0.5s ease-out 1.1s both",
        }}
      >
        분석이 완료되었어요. 결과를 확인해보세요
      </div>
    </div>
  );
}
