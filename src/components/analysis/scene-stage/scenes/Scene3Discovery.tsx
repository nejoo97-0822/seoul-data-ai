"use client";

/**
 * Scene 3 — Discovery (2.4s)
 * ──────────────────────────
 * We're inside an endless archive hall. A scan beam sweeps
 * across the shelves; matching data boxes glow, lift off the
 * shelves, and fly forward into the central formation.
 *
 * Timeline:
 *   0.0s  archive shelves fade in
 *   0.2s  scan beam starts sweeping L→R
 *   0.6s  first box starts lifting off
 *   0.8s  second box
 *   1.0s  third box
 *   1.2s  fourth box
 *   1.6s  all boxes in formation, labels unfold
 *   2.0s  subtle float/hover ambient
 */

import type { SceneComponentProps } from "../SceneStage";
import type { Dataset } from "@/data/datasets";

// Fallback datasets for /debug-scenes when nothing is wired in
const FALLBACK_DATASETS: Pick<Dataset, "id" | "title">[] = [
  { id: "f1", title: "서울시 어린이집 현황" },
  { id: "f2", title: "서울시 공원 현황" },
  { id: "f3", title: "서울시 소아과 의원" },
  { id: "f4", title: "서울시 안전지수" },
];

export default function Scene3Discovery({
  datasets,
  accent,
}: SceneComponentProps) {
  const shown = (datasets.length > 0 ? datasets : FALLBACK_DATASETS).slice(0, 4);

  // Formation positions (arc)
  const positions = [
    { x: -160, y: 10, originX: -260, originY: -120 },
    { x: -55, y: -12, originX: -90, originY: -160 },
    { x: 55, y: -12, originX: 90, originY: -160 },
    { x: 160, y: 10, originX: 260, originY: -120 },
  ];

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ animation: "stgS3DollyIn 2.4s ease-out both" }}
    >
      {/* Archive hall perspective floor */}
      <div
        className="absolute inset-x-0 bottom-0 h-[50%] pointer-events-none"
        style={{
          background: `linear-gradient(180deg, transparent, ${accent}0A 40%, ${accent}14 100%)`,
        }}
      />

      {/* Shelving rows (3 rows receding into perspective) */}
      {[0, 1, 2].map((row) => {
        const top = 18 + row * 16;
        const scale = 1 - row * 0.12;
        return (
          <div
            key={row}
            className="absolute left-1/2 -translate-x-1/2"
            style={{
              top: `${top}%`,
              width: `${80 - row * 12}%`,
              height: 38,
              transform: `translate(-50%, 0) scale(${scale})`,
              opacity: 0.55 - row * 0.12,
            }}
          >
            {/* Shelf back panel */}
            <div
              className="absolute inset-0 rounded-sm border"
              style={{
                borderColor: `${accent}55`,
                background: `linear-gradient(180deg, ${accent}14 0%, ${accent}1E 100%)`,
              }}
            />
            {/* Horizontal shelves */}
            <div
              className="absolute left-0 right-0 top-[30%] h-[1.5px]"
              style={{ background: `${accent}88` }}
            />
            <div
              className="absolute left-0 right-0 top-[65%] h-[1.5px]"
              style={{ background: `${accent}88` }}
            />
            {/* Vertical separators */}
            {[0, 1, 2, 3, 4, 5].map((col) => (
              <div
                key={col}
                className="absolute top-0 bottom-0 w-[1px]"
                style={{
                  left: `${(col + 1) * 14}%`,
                  background: `${accent}55`,
                }}
              />
            ))}
            {/* Book spines */}
            {Array.from({ length: 14 }).map((_, i) => {
              const col = i % 7;
              const r = Math.floor(i / 7);
              const height = r === 0 ? 10 : 9;
              const top = r === 0 ? 4 : 16;
              return (
                <div
                  key={i}
                  className="absolute rounded-[1px]"
                  style={{
                    left: `${(col + 0.5) * 12.5}%`,
                    top,
                    width: 3 + (i % 3),
                    height,
                    backgroundColor: `hsl(${200 + (i * 11) % 50}, 50%, ${55 + (i % 3) * 8}%)`,
                    animation: `stgS3ShelfHighlight ${1.5 + (i % 4) * 0.3}s ease-in-out ${
                      (i * 0.1) % 0.8
                    }s infinite`,
                  }}
                />
              );
            })}
          </div>
        );
      })}

      {/* Scan beam */}
      <div
        className="absolute top-0 bottom-0 w-[3px] pointer-events-none"
        style={{
          background: `linear-gradient(180deg, transparent, ${accent} 20%, ${accent} 80%, transparent)`,
          boxShadow: `0 0 24px ${accent}, 0 0 48px ${accent}88`,
          animation: "stgS3ScanBeam 1.4s ease-in-out 0.2s both",
        }}
      />

      {/* Lifted data boxes in formation */}
      {shown.map((ds, i) => {
        const pos = positions[i];
        const delay = 0.6 + i * 0.2;
        return (
          <div
            key={ds.id}
            className="absolute left-1/2 top-[62%]"
            style={{
              ["--origin-x" as string]: `${pos.originX}px`,
              ["--origin-y" as string]: `${pos.originY}px`,
              ["--target-x" as string]: `${pos.x}px`,
              ["--target-y" as string]: `${pos.y}px`,
              transform: `translate(calc(-50% + ${pos.x}px), ${pos.y}px)`,
              animation: `stgS3BoxLift 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s both, stgS3BoxFloat 3s ease-in-out ${
                delay + 0.8
              }s infinite`,
            } as React.CSSProperties}
          >
            {/* Box visual */}
            <div
              className="relative rounded-lg bg-white"
              style={{
                width: 104,
                padding: "10px 12px",
                border: `2px solid ${accent}`,
                boxShadow: `0 14px 28px -10px ${accent}66, 0 0 0 4px ${accent}14`,
              }}
            >
              {/* Icon dot */}
              <div
                className="absolute -top-1.5 -left-1.5 h-3 w-3 rounded-full border-2 border-white"
                style={{
                  backgroundColor: accent,
                  boxShadow: `0 0 8px ${accent}`,
                }}
              />
              {/* Title (unfolds) */}
              <div
                className="text-[10px] font-semibold text-slate-700 leading-tight whitespace-nowrap overflow-hidden"
                style={{
                  animation: `stgS3LabelUnfold 0.5s cubic-bezier(0.33, 1, 0.68, 1) ${
                    delay + 0.35
                  }s both`,
                  transformOrigin: "left center",
                }}
              >
                {ds.title}
              </div>
              {/* Sub meta */}
              <div
                className="mt-1 flex items-center gap-1"
                style={{
                  animation: `stgS3LabelUnfold 0.4s ease-out ${delay + 0.55}s both`,
                  transformOrigin: "left center",
                }}
              >
                <span
                  className="text-[7px] px-1 py-0.5 rounded font-bold"
                  style={{
                    color: accent,
                    backgroundColor: `${accent}18`,
                  }}
                >
                  검증
                </span>
                <span className="text-[7px] text-slate-400 font-medium">
                  25개 구
                </span>
              </div>
            </div>
          </div>
        );
      })}

      {/* Bottom caption */}
      <div
        className="absolute left-1/2 bottom-6 -translate-x-1/2 text-[11px] text-slate-400 font-medium tracking-wide pointer-events-none"
        style={{ animation: "stgChromeSlideIn 0.5s ease-out 0.2s both" }}
      >
        후보 데이터셋 {shown.length}건 수집 중
      </div>
    </div>
  );
}
