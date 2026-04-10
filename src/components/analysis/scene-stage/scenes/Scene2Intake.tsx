"use client";

/**
 * Scene 2 — Intake (1.8s)
 * ───────────────────────
 * The quest card arrives at the data hub's receiving dock.
 * It drops onto a conveyor belt, travels left, and is consumed
 * by an intake chute. Three lamps blink confirming receipt.
 *
 * Timeline:
 *   0.0s  belt fades in, chute visible on left
 *   0.2s  card drops from top-right onto belt
 *   0.55s card slides left along belt
 *   1.15s chute door opens
 *   1.30s card is absorbed by chute
 *   1.45s chute door slams shut
 *   1.55s 3 lamps blink sequentially (red→yellow→green)
 */

import type { SceneComponentProps } from "../SceneStage";

export default function Scene2Intake({ query, accent }: SceneComponentProps) {
  return (
    <div className="absolute inset-0">
      {/* Atmospheric floor light */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 70% 40% at 30% 60%, ${accent}12, transparent 75%)`,
        }}
      />

      {/* Intake chute (left side) */}
      <div
        className="absolute"
        style={{
          left: "12%",
          top: "38%",
          width: 130,
          height: 130,
        }}
      >
        {/* Chute body (isometric-ish) */}
        <svg width="130" height="130" viewBox="0 0 130 130" fill="none">
          <defs>
            <linearGradient id="chuteBody" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#E0F2FE" />
              <stop offset="1" stopColor="#7DD3FC" />
            </linearGradient>
            <linearGradient id="chuteTop" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#F0F9FF" />
              <stop offset="1" stopColor="#BAE6FD" />
            </linearGradient>
          </defs>
          {/* Back panel */}
          <polygon points="14,30 116,30 126,42 4,42" fill="url(#chuteTop)" stroke={accent} strokeWidth="1.5" />
          {/* Front body */}
          <rect x="4" y="42" width="122" height="76" fill="url(#chuteBody)" stroke={accent} strokeWidth="1.5" rx="3" />
          {/* Intake slot (where the card will enter) */}
          <rect x="28" y="54" width="74" height="10" fill="#1E293B" opacity="0.15" rx="2" />
        </svg>

        {/* Chute door (closes at 1.45s) */}
        <div
          className="absolute rounded-sm"
          style={{
            left: 28,
            top: 54,
            width: 74,
            height: 10,
            background: `linear-gradient(180deg, ${accent}, ${accent}CC)`,
            boxShadow: `0 0 8px ${accent}66`,
            transformOrigin: "top center",
            animation:
              "stgS2ChuteDoorOpen 0.15s ease-out 1.12s both, stgS2ChuteDoorOpen 0.12s ease-in 1.43s reverse forwards",
          }}
        />

        {/* Three indicator lamps */}
        <div className="absolute bottom-[18px] left-[24px] right-[24px] flex justify-between">
          {[
            { color: "#EF4444", delay: 1.55 },
            { color: "#F59E0B", delay: 1.63 },
            { color: "#10B981", delay: 1.71 },
          ].map((lamp, i) => (
            <div
              key={i}
              className="h-2 w-2 rounded-full"
              style={{
                color: lamp.color,
                backgroundColor: lamp.color,
                opacity: 0.25,
                animation: `stgS2LampBlink 0.4s ease-out ${lamp.delay}s both`,
              }}
            />
          ))}
        </div>

        {/* Chute label */}
        <div
          className="absolute left-1/2 -translate-x-1/2 text-[8px] font-bold uppercase tracking-[0.18em] whitespace-nowrap"
          style={{
            top: 16,
            color: accent,
          }}
        >
          Intake
        </div>
      </div>

      {/* Conveyor belt — diagonal, spans from right to chute */}
      <div
        className="absolute"
        style={{
          left: "20%",
          right: "8%",
          top: "55%",
          height: 14,
          transform: "translateY(-50%)",
        }}
      >
        {/* Belt body */}
        <div
          className="absolute inset-0 rounded-sm border"
          style={{
            borderColor: `${accent}66`,
            background: `repeating-linear-gradient(90deg, ${accent}CC 0 6px, ${accent}99 6px 12px)`,
            backgroundSize: "24px 100%",
            animation: "stgS2BeltFlow 0.7s linear infinite",
            boxShadow: `0 4px 12px ${accent}20, inset 0 1px 0 rgba(255,255,255,0.5)`,
          }}
        />
        {/* Belt rails */}
        <div
          className="absolute -top-[3px] inset-x-0 h-[2px] rounded-full"
          style={{ backgroundColor: `${accent}88` }}
        />
        <div
          className="absolute -bottom-[3px] inset-x-0 h-[2px] rounded-full"
          style={{ backgroundColor: `${accent}88` }}
        />
      </div>

      {/* The quest card on its journey */}
      <div
        className="absolute"
        style={{
          top: "55%",
          left: "78%",
          width: 88,
          transform: "translate(-50%, -50%)",
          animation:
            "stgS2CardDrop 0.5s cubic-bezier(0.33, 1, 0.68, 1) 0.15s both, stgS2CardTravel 0.6s cubic-bezier(0.5, 0, 0.5, 1) 0.55s forwards, stgS2CardIntake 0.3s ease-in 1.2s forwards",
        }}
      >
        <div
          className="rounded-md bg-white p-1.5 shadow-[0_6px_16px_rgba(15,23,42,0.2)]"
          style={{ border: `1.5px solid ${accent}88` }}
        >
          <div className="flex items-center gap-1 mb-1">
            <div
              className="h-1 w-1 rounded-full"
              style={{ backgroundColor: accent }}
            />
            <div
              className="text-[6px] font-bold tracking-wider"
              style={{ color: accent }}
            >
              ORDER
            </div>
            <div className="ml-auto text-[5px] text-slate-400">#SDA-2026</div>
          </div>
          <div
            className="text-[7px] font-semibold text-slate-600 leading-tight"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {query || "분석 의뢰"}
          </div>
        </div>
      </div>

      {/* Arrival pulse rings (when card enters chute) */}
      <div
        className="absolute left-[18%] top-[50%] rounded-full border-2 pointer-events-none"
        style={{
          width: 80,
          height: 80,
          borderColor: accent,
          transform: "translate(-50%, -50%)",
          opacity: 0,
          animation: "stgS4PulseRing 0.9s ease-out 1.3s both",
        }}
      />
      <div
        className="absolute left-[18%] top-[50%] rounded-full border-2 pointer-events-none"
        style={{
          width: 80,
          height: 80,
          borderColor: accent,
          transform: "translate(-50%, -50%)",
          opacity: 0,
          animation: "stgS4PulseRing 0.9s ease-out 1.55s both",
        }}
      />

      {/* Bottom caption */}
      <div
        className="absolute left-1/2 bottom-8 -translate-x-1/2 text-[11px] text-slate-400 font-medium tracking-wide pointer-events-none"
        style={{ animation: "stgChromeSlideIn 0.5s ease-out 0.2s both" }}
      >
        데이터 허브에 의뢰서가 접수됨
      </div>
    </div>
  );
}
