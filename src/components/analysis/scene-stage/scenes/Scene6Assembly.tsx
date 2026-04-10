"use client";

/**
 * Scene 6 — Assembly (2.2s)
 * ─────────────────────────
 * A drafting table, high angle. An empty dossier frame sits open.
 * Report pieces fly in from off-screen and snap into place one by
 * one — ranking table from the left, chart widget from above,
 * map thumbnail from the right, insight lines typed at bottom.
 * Each snap-in triggers a short ping ring. Finally the dossier
 * lifts off the table toward camera.
 *
 * Timeline:
 *   0.0s  dossier frame fades in
 *   0.3s  ranking table slides in from left  + ping
 *   0.6s  chart widget drops from top        + ping
 *   0.9s  map thumbnail slides in from right + ping
 *   1.2s  insight line 1 types in
 *   1.4s  insight line 2 types in
 *   1.6s  insight line 3 types in
 *   1.95s dossier lifts off
 */

import type { SceneComponentProps } from "../SceneStage";

const INSIGHT_LINES = [
  "성동구·강동구가 상위권",
  "어린이집 1인당 공원 면적 기준",
  "야간 안전지수 가중치 0.2",
];

// Mini ranking rows rendered inside the left piece
const RANKING_ROWS = [
  { rank: 1, name: "성동구", score: 92 },
  { rank: 2, name: "강동구", score: 89 },
  { rank: 3, name: "송파구", score: 85 },
  { rank: 4, name: "노원구", score: 81 },
];

// Mini bar heights for the chart piece (normalized 0..1)
const BAR_HEIGHTS = [0.55, 0.72, 0.48, 0.88, 0.63, 0.76];

export default function Scene6Assembly({ accent }: SceneComponentProps) {
  return (
    <div className="absolute inset-0">
      {/* Drafting table surface glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 75% 55% at 50% 55%, ${accent}14, transparent 75%)`,
        }}
      />

      {/* Paper texture lines (blueprint-ish) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to bottom, ${accent}14 1px, transparent 1px)`,
          backgroundSize: "22px 22px",
          maskImage:
            "radial-gradient(ellipse 60% 50% at 50% 52%, black 40%, transparent 90%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 60% 50% at 50% 52%, black 40%, transparent 90%)",
          opacity: 0.6,
        }}
      />

      {/* Dossier frame (open folder) */}
      <div
        className="absolute left-1/2 top-1/2 rounded-2xl bg-white"
        style={{
          width: 540,
          height: 300,
          transform: "translate(-50%, -50%)",
          border: `2px solid ${accent}66`,
          boxShadow: `0 30px 60px -20px rgba(15,23,42,0.28), 0 0 0 6px ${accent}14`,
          animation: `
            stgS6FrameFade 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0s both,
            stgS6DossierLift 0.4s cubic-bezier(0.33, 1, 0.68, 1) 1.95s forwards
          `,
        }}
      >
        {/* Dossier header strip */}
        <div
          className="absolute top-0 left-0 right-0 h-6 rounded-t-2xl flex items-center px-3 gap-2"
          style={{
            background: `linear-gradient(180deg, ${accent}22, ${accent}10)`,
            borderBottom: `1px solid ${accent}33`,
          }}
        >
          <div
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: accent, boxShadow: `0 0 6px ${accent}` }}
          />
          <span
            className="text-[8px] font-bold uppercase tracking-[0.18em]"
            style={{ color: accent }}
          >
            Analysis Report · #SDA-2026
          </span>
          <span className="ml-auto text-[8px] font-bold text-slate-400 tabular-nums tracking-widest">
            DRAFT
          </span>
        </div>

        {/* ── Piece 1: Ranking table (slides from LEFT) ── */}
        <div
          className="absolute"
          style={{
            left: 18,
            top: 38,
            width: 170,
            animation: "stgS6PieceSlideLeft 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both",
          }}
        >
          <div
            className="rounded-lg bg-white p-2"
            style={{
              border: `1.5px solid ${accent}55`,
              boxShadow: `0 6px 16px -6px ${accent}44`,
            }}
          >
            <div className="flex items-center gap-1 mb-1.5">
              <div
                className="h-1 w-1 rounded-full"
                style={{ backgroundColor: accent }}
              />
              <span
                className="text-[7px] font-bold uppercase tracking-wider"
                style={{ color: accent }}
              >
                Ranking
              </span>
            </div>
            {RANKING_ROWS.map((row, i) => (
              <div
                key={row.rank}
                className="flex items-center gap-1.5 py-0.5"
                style={{
                  borderBottom:
                    i < RANKING_ROWS.length - 1 ? `1px dashed ${accent}22` : "none",
                }}
              >
                <span
                  className="text-[7px] font-black tabular-nums w-3 text-center"
                  style={{ color: accent }}
                >
                  {row.rank}
                </span>
                <span className="text-[8px] font-semibold text-slate-700 flex-1">
                  {row.name}
                </span>
                <span className="text-[7px] font-bold tabular-nums text-slate-500">
                  {row.score}
                </span>
              </div>
            ))}
          </div>
          {/* snap ping */}
          <div
            className="absolute left-1/2 top-1/2 rounded-full border-2 pointer-events-none"
            style={{
              width: 200,
              height: 100,
              borderColor: accent,
              transform: "translate(-50%, -50%)",
              opacity: 0,
              animation: "stgS6SnapPing 0.6s ease-out 0.75s both",
            }}
          />
        </div>

        {/* ── Piece 2: Chart widget (drops from TOP) ── */}
        <div
          className="absolute"
          style={{
            left: 200,
            top: 38,
            width: 150,
            animation: "stgS6PieceDropTop 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) 0.6s both",
          }}
        >
          <div
            className="rounded-lg bg-white p-2"
            style={{
              border: `1.5px solid ${accent}55`,
              boxShadow: `0 6px 16px -6px ${accent}44`,
            }}
          >
            <div className="flex items-center gap-1 mb-1.5">
              <div
                className="h-1 w-1 rounded-full"
                style={{ backgroundColor: accent }}
              />
              <span
                className="text-[7px] font-bold uppercase tracking-wider"
                style={{ color: accent }}
              >
                Indicator Mix
              </span>
            </div>
            {/* Mini bar chart */}
            <div className="flex items-end gap-1 h-[52px] px-0.5">
              {BAR_HEIGHTS.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm"
                  style={{
                    height: `${h * 100}%`,
                    background: `linear-gradient(180deg, ${accent}, ${accent}88)`,
                    boxShadow: `0 -2px 6px ${accent}33`,
                  }}
                />
              ))}
            </div>
            {/* Axis line */}
            <div
              className="mt-0.5 h-[1px]"
              style={{ background: `${accent}66` }}
            />
          </div>
          <div
            className="absolute left-1/2 top-1/2 rounded-full border-2 pointer-events-none"
            style={{
              width: 180,
              height: 90,
              borderColor: accent,
              transform: "translate(-50%, -50%)",
              opacity: 0,
              animation: "stgS6SnapPing 0.6s ease-out 1.05s both",
            }}
          />
        </div>

        {/* ── Piece 3: Map thumbnail (slides from RIGHT) ── */}
        <div
          className="absolute"
          style={{
            left: 360,
            top: 38,
            width: 160,
            animation: "stgS6PieceSlideRight 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.9s both",
          }}
        >
          <div
            className="rounded-lg bg-white p-2"
            style={{
              border: `1.5px solid ${accent}55`,
              boxShadow: `0 6px 16px -6px ${accent}44`,
            }}
          >
            <div className="flex items-center gap-1 mb-1.5">
              <div
                className="h-1 w-1 rounded-full"
                style={{ backgroundColor: accent }}
              />
              <span
                className="text-[7px] font-bold uppercase tracking-wider"
                style={{ color: accent }}
              >
                Seoul Map
              </span>
            </div>
            {/* Stylized seoul map using grid dots */}
            <div
              className="relative rounded-md overflow-hidden"
              style={{
                height: 56,
                background: `linear-gradient(135deg, ${accent}14, ${accent}08)`,
                border: `1px solid ${accent}33`,
              }}
            >
              {/* Choropleth cells */}
              <div
                className="absolute inset-1 grid gap-[2px]"
                style={{
                  gridTemplateColumns: "repeat(6, 1fr)",
                  gridTemplateRows: "repeat(4, 1fr)",
                }}
              >
                {Array.from({ length: 24 }).map((_, i) => {
                  const intensity =
                    0.15 + ((Math.sin(i * 1.7) + 1) / 2) * 0.75;
                  return (
                    <div
                      key={i}
                      className="rounded-[1px]"
                      style={{
                        backgroundColor: accent,
                        opacity: intensity,
                      }}
                    />
                  );
                })}
              </div>
              {/* Pin marker */}
              <div
                className="absolute h-1.5 w-1.5 rounded-full"
                style={{
                  left: "42%",
                  top: "38%",
                  backgroundColor: "white",
                  border: `1.5px solid ${accent}`,
                  boxShadow: `0 0 6px ${accent}`,
                }}
              />
            </div>
          </div>
          <div
            className="absolute left-1/2 top-1/2 rounded-full border-2 pointer-events-none"
            style={{
              width: 190,
              height: 90,
              borderColor: accent,
              transform: "translate(-50%, -50%)",
              opacity: 0,
              animation: "stgS6SnapPing 0.6s ease-out 1.35s both",
            }}
          />
        </div>

        {/* ── Piece 4: Insight lines (typed in at bottom) ── */}
        <div
          className="absolute"
          style={{
            left: 18,
            right: 18,
            bottom: 16,
          }}
        >
          <div className="flex items-center gap-1 mb-1.5">
            <div
              className="h-1 w-1 rounded-full"
              style={{ backgroundColor: accent }}
            />
            <span
              className="text-[7px] font-bold uppercase tracking-wider"
              style={{ color: accent }}
            >
              Insights
            </span>
          </div>
          {INSIGHT_LINES.map((line, i) => (
            <div
              key={i}
              className="relative mb-1 flex items-center gap-1.5"
              style={{
                animation: `stgS6PieceFadeUp 0.3s ease-out ${1.2 + i * 0.2}s both`,
              }}
            >
              <span
                className="inline-block text-[8px] font-bold tabular-nums w-3"
                style={{ color: accent }}
              >
                0{i + 1}
              </span>
              {/* Underline draw */}
              <div className="relative flex-1">
                <span className="text-[10px] font-semibold text-slate-700 leading-tight whitespace-nowrap">
                  {line}
                </span>
                <div
                  className="absolute left-0 bottom-[-2px] h-[1.5px]"
                  style={{
                    backgroundColor: `${accent}88`,
                    animation: `stgS6TextLineDraw 0.5s ease-out ${1.25 + i * 0.2}s both`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom caption */}
      <div
        className="absolute left-1/2 bottom-6 -translate-x-1/2 text-[11px] text-slate-400 font-medium tracking-wide pointer-events-none"
        style={{ animation: "stgChromeSlideIn 0.5s ease-out 0.2s both" }}
      >
        분석 결과를 리포트로 조립하는 중
      </div>
    </div>
  );
}
