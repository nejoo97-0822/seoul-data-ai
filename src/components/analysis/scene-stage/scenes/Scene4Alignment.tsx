"use client";

/**
 * Scene 4 — Alignment (2.2s)
 * ──────────────────────────
 * Not rejection. Not filtering. NORMALIZATION.
 *
 * 4 raw data packets enter with different sizes, rotations, and
 * drift offsets. A calibration grid overlays the workbench. An
 * alignment beam sweeps through; each packet snaps to the grid —
 * resized to uniform width, rotated straight, color-matched to a
 * common palette. Normalization tags pop up. Then the packets
 * condense into a single tidy bundle that exits right.
 *
 * Timeline:
 *   0.0s  packets slide in from left with random drift/rotation
 *   0.5s  calibration grid overlay fades in
 *   0.8s  alignment beam sweeps through
 *   1.0s  packets normalize (resize + rotate + color)
 *   1.4s  normalization tags pop above each packet
 *   1.9s  packets condense into bundle
 */

import type { SceneComponentProps } from "../SceneStage";
import type { Dataset } from "@/data/datasets";

const FALLBACK: Pick<Dataset, "id" | "title">[] = [
  { id: "f1", title: "어린이집" },
  { id: "f2", title: "공원" },
  { id: "f3", title: "소아과" },
  { id: "f4", title: "안전지수" },
];

// Each packet's initial drift (asymmetric / off-kilter)
const PACKETS = [
  { driftX: 16, driftY: -18, driftR: -8, driftS: 1.15, finalX: -120 },
  { driftX: -24, driftY: 6, driftR: 12, driftS: 0.82, finalX: -40 },
  { driftX: 10, driftY: -8, driftR: -5, driftS: 1.05, finalX: 40 },
  { driftX: -18, driftY: 14, driftR: 8, driftS: 0.92, finalX: 120 },
];

const TAGS = ["단위 정합", "시점 맞춤", "키 매칭"];

export default function Scene4Alignment({
  datasets,
  accent,
}: SceneComponentProps) {
  const shown = (datasets.length > 0 ? datasets : FALLBACK).slice(0, 4);

  return (
    <div className="absolute inset-0">
      {/* Workbench surface glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 70% 50% at 50% 58%, ${accent}18, transparent 75%)`,
        }}
      />

      {/* Calibration grid overlay (blueprint) */}
      <div
        className="absolute left-1/2 top-1/2 rounded-2xl pointer-events-none"
        style={{
          width: 560,
          height: 240,
          transform: "translate(-50%, -50%)",
          border: `1px dashed ${accent}55`,
          backgroundImage:
            `linear-gradient(to right, ${accent}26 1px, transparent 1px), linear-gradient(to bottom, ${accent}26 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
          animation: "stgS4GridOverlay 0.5s ease-out 0.5s both",
        }}
      />

      {/* Horizontal ruler marks (top) */}
      <div
        className="absolute left-1/2 top-[32%] -translate-x-1/2 pointer-events-none"
        style={{ animation: "stgS4GridOverlay 0.5s ease-out 0.55s both" }}
      >
        <div className="flex items-center gap-[26px]">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className="w-[1px] h-2"
              style={{
                backgroundColor: `${accent}99`,
                height: i % 4 === 0 ? 8 : 4,
              }}
            />
          ))}
        </div>
      </div>

      {/* Alignment beam (sweeps L→R) */}
      <div
        className="absolute top-[32%] bottom-[32%] w-[3px] pointer-events-none"
        style={{
          background: `linear-gradient(180deg, transparent, ${accent}, transparent)`,
          boxShadow: `0 0 18px ${accent}, 0 0 40px ${accent}AA`,
          animation: "stgS4AlignmentBeam 1s ease-in-out 0.8s both",
        }}
      />

      {/* The 4 packets */}
      {shown.map((ds, i) => {
        const p = PACKETS[i];
        return (
          <div
            key={ds.id}
            className="absolute left-1/2 top-1/2"
            style={{
              ["--drift-x" as string]: `${p.driftX}px`,
              ["--drift-y" as string]: `${p.driftY}px`,
              ["--drift-r" as string]: `${p.driftR}deg`,
              ["--drift-s" as string]: `${p.driftS}`,
              ["--final-x" as string]: `${p.finalX}px`,
              transform: `translate(calc(-50% + ${p.finalX}px), -50%)`,
              animation: `
                stgS4PacketEnter 0.5s cubic-bezier(0.33, 1, 0.68, 1) ${i * 0.08}s both,
                stgS4PacketNormalize 0.6s cubic-bezier(0.33, 1, 0.68, 1) ${
                  1.0 + i * 0.04
                }s forwards,
                stgS4BundleCondense 0.4s cubic-bezier(0.55, 0, 0.45, 1) 1.9s forwards
              `,
            } as React.CSSProperties}
          >
            {/* Packet card */}
            <div
              className="relative rounded-lg bg-white"
              style={{
                width: 96,
                padding: "10px 12px",
                border: `2px solid ${accent}`,
                boxShadow: `0 10px 24px -8px ${accent}55, 0 0 0 3px ${accent}14`,
              }}
            >
              {/* Uniform label bar (top strip) */}
              <div
                className="absolute top-0 left-0 right-0 h-1 rounded-t-md"
                style={{ backgroundColor: accent }}
              />
              <div className="flex items-center gap-1 mt-1 mb-1.5">
                <div
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: accent }}
                />
                <div className="text-[6px] font-bold tracking-wider text-slate-400 uppercase">
                  Dataset
                </div>
              </div>
              <div className="text-[9px] font-semibold text-slate-700 leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
                {ds.title.replace("서울시 ", "")}
              </div>
              {/* Standardized schema row */}
              <div className="mt-1.5 flex items-center gap-0.5">
                {[0, 1, 2, 3].map((b) => (
                  <div
                    key={b}
                    className="h-[3px] flex-1 rounded-full"
                    style={{
                      backgroundColor: `${accent}33`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Pulse ring triggered when beam hits */}
            <div
              className="absolute left-1/2 top-1/2 rounded-full border-2 pointer-events-none"
              style={{
                width: 110,
                height: 110,
                borderColor: accent,
                transform: "translate(-50%, -50%)",
                opacity: 0,
                animation: `stgS4PulseRing 0.8s ease-out ${1.0 + i * 0.04}s both`,
              }}
            />

            {/* Normalization tags popping above */}
            {TAGS.map((tag, ti) => (
              <div
                key={tag}
                className="absolute left-1/2 whitespace-nowrap rounded-full px-1.5 py-0.5 text-[7px] font-bold shadow-sm"
                style={{
                  top: -20 - ti * 13,
                  transform: "translateX(-50%)",
                  backgroundColor: "white",
                  color: accent,
                  border: `1px solid ${accent}66`,
                  opacity: 0,
                  animation: `stgS4TagPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${
                    1.35 + i * 0.04 + ti * 0.08
                  }s both`,
                }}
              >
                ✓ {tag}
              </div>
            ))}
          </div>
        );
      })}

      {/* Bundle confirmation stamp (appears after condense) */}
      <div
        className="absolute left-1/2 top-[72%] -translate-x-1/2 flex items-center gap-2 rounded-full px-3 py-1.5 bg-white shadow-[0_4px_14px_rgba(15,23,42,0.12)]"
        style={{
          border: `1.5px solid ${accent}`,
          opacity: 0,
          animation: "stgS1CardMaterialize 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 2.05s both",
        }}
      >
        <div
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: accent, boxShadow: `0 0 6px ${accent}` }}
        />
        <span
          className="text-[10px] font-bold tracking-[0.08em]"
          style={{ color: accent }}
        >
          표준 스키마로 정합 완료
        </span>
      </div>

      {/* Bottom caption */}
      <div
        className="absolute left-1/2 bottom-6 -translate-x-1/2 text-[11px] text-slate-400 font-medium tracking-wide pointer-events-none"
        style={{ animation: "stgChromeSlideIn 0.5s ease-out 0.2s both" }}
      >
        단위·시점·키를 통일해 비교 가능한 형태로 변환
      </div>
    </div>
  );
}
