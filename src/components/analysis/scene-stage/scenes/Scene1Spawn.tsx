"use client";

/**
 * Scene 1 — Request Spawn (2.0s)
 * ──────────────────────────────
 * A quest order card materializes center-stage from converging
 * particles. Typewriter query. Stamp slams down. Then the card
 * launches out to Scene 2.
 *
 * Timeline:
 *   0.0s  particles begin converging toward center
 *   0.4s  card solidifies (materialize animation)
 *   0.6s  typewriter reveal of query text
 *   1.2s  stamp slams down with ripple
 *   1.6s  card stabilizes, full ambient
 *   1.8s  card launches (exit) — picked up by Scene 2
 */

import type { SceneComponentProps } from "../SceneStage";

const PARTICLE_COUNT = 18;

function prn(i: number, s: number) {
  const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export default function Scene1Spawn({ query, accent }: SceneComponentProps) {
  return (
    <div className="absolute inset-0">
      {/* Soft focus spotlight from above */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
        style={{
          width: 420,
          height: 260,
          background: `radial-gradient(ellipse, ${accent}18, transparent 65%)`,
          filter: "blur(2px)",
        }}
      />

      {/* Converging particles */}
      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
        const angle = (i / PARTICLE_COUNT) * Math.PI * 2;
        const radius = 140 + prn(i, 1) * 80;
        const cx = Math.cos(angle) * radius;
        const cy = Math.sin(angle) * radius;
        const delay = prn(i, 2) * 0.3;
        return (
          <div
            key={i}
            className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full"
            style={{
              backgroundColor: accent,
              boxShadow: `0 0 8px ${accent}`,
              ["--cx" as string]: `${cx.toFixed(2)}px`,
              ["--cy" as string]: `${cy.toFixed(2)}px`,
              animation: `stgS1ParticleConverge 0.8s cubic-bezier(0.22, 1, 0.36, 1) ${delay.toFixed(
                2
              )}s forwards`,
            } as React.CSSProperties}
          />
        );
      })}

      {/* Card materialize halo */}
      <div
        className="absolute left-1/2 top-1/2 rounded-3xl pointer-events-none"
        style={{
          width: 360,
          height: 160,
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(ellipse at center, ${accent}28, transparent 70%)`,
          filter: "blur(10px)",
          animation: "stgS1CardMaterialize 1s cubic-bezier(0.22, 1, 0.36, 1) 0.35s both",
        }}
      />

      {/* Stamp ripple (behind the card) */}
      <div
        className="absolute left-[62%] top-[42%] rounded-full border-2 pointer-events-none"
        style={{
          width: 80,
          height: 80,
          borderColor: accent,
          transform: "translate(-50%, -50%)",
          animation: "stgS1StampRipple 1.4s ease-out 1.2s both",
        }}
      />

      {/* The quest order card */}
      <div
        className="absolute left-1/2 top-1/2 rounded-2xl bg-white"
        style={{
          width: 360,
          padding: "20px 24px",
          transform: "translate(-50%, -50%)",
          border: `2px solid ${accent}40`,
          boxShadow: `0 24px 50px -10px ${accent}55, 0 2px 0 rgba(255,255,255,0.9)`,
          animation:
            "stgS1CardMaterialize 1s cubic-bezier(0.22, 1, 0.36, 1) 0.35s both, stgS1CardLaunch 0.5s cubic-bezier(0.55, 0, 0.45, 1) 1.8s forwards",
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: accent, boxShadow: `0 0 8px ${accent}` }}
          />
          <div
            className="text-[9px] font-bold uppercase tracking-[0.18em]"
            style={{ color: accent }}
          >
            Quest Order
          </div>
          <div className="ml-auto text-[9px] text-slate-400 tabular-nums font-medium">
            #SDA-2026
          </div>
        </div>

        {/* Query text with typewriter reveal */}
        <div
          className="text-[15px] font-semibold text-slate-700 leading-snug"
          style={{
            animation: "stgS1TypeReveal 0.7s steps(20, end) 0.75s both",
          }}
        >
          &ldquo;{query || "서울에서 아이 키우기 좋은 구는 어디야?"}&rdquo;
        </div>

        {/* Meta row */}
        <div className="mt-3 flex items-center gap-1.5">
          <span
            className="text-[9px] px-1.5 py-0.5 rounded font-medium"
            style={{
              color: accent,
              backgroundColor: `${accent}14`,
              border: `1px solid ${accent}33`,
            }}
          >
            접수완료
          </span>
          <span className="text-[9px] text-slate-400 font-medium">
            {new Date().toLocaleDateString("ko-KR")}
          </span>
        </div>

        {/* The stamp (top-right) */}
        <div
          className="absolute -top-2 -right-2 flex items-center justify-center rounded-full font-bold"
          style={{
            width: 54,
            height: 54,
            border: `3px solid ${accent}`,
            color: accent,
            fontSize: 9,
            background: "rgba(255,255,255,0.98)",
            boxShadow: `0 4px 12px ${accent}44`,
            letterSpacing: "0.06em",
            lineHeight: 1,
            textAlign: "center",
            animation: "stgS1StampSlam 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 1.1s both",
          }}
        >
          <div>
            APPROVED
            <div style={{ fontSize: 7, marginTop: 2, opacity: 0.7 }}>
              2026·04·10
            </div>
          </div>
        </div>
      </div>

      {/* Bottom caption */}
      <div
        className="absolute left-1/2 bottom-8 -translate-x-1/2 text-[11px] text-slate-400 font-medium tracking-wide pointer-events-none"
        style={{ animation: "stgChromeSlideIn 0.6s ease-out 0.3s both" }}
      >
        시민의 질문을 의뢰서로 접수 중
      </div>
    </div>
  );
}
