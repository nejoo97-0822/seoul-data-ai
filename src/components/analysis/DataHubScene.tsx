"use client";

/**
 * DataHubScene
 * ─────────────────────────────────────────────────────────────
 * "Seoul Data Logistics Hub" — a scene-based interaction surface
 * that replaces the step-based pipeline diagram.
 *
 * Design philosophy:
 *   • It is a SINGLE persistent canvas, not a slideshow of scenes.
 *   • 5 zones (Intake / Catalog / Validation / Compute / Report)
 *     always exist in the same coordinate space.
 *   • Phase changes shift the spotlight and trigger events at the
 *     active zone; inactive zones keep subtle ambient motion.
 *   • Work items (quest card, dataset volumes, result packets)
 *     physically travel between zones — the user sees WORK moving,
 *     not abstract state.
 *   • CSS @keyframes drive all animation (reliable, HMR-safe).
 *
 * Visual tone: civic-tech bright, card-based, no fantasy/dark/RPG.
 */

import { useEffect, useMemo, useState } from "react";
import type { AnalysisPhase } from "@/hooks/useAnalysisSimulation";
import type { Dataset } from "@/data/datasets";

// ═══════════════════════════════════════════════════════════════════
// TYPES & CONFIG
// ═══════════════════════════════════════════════════════════════════

type HubPhase = Exclude<AnalysisPhase, "idle" | "no-match">;

interface PhaseMeta {
  idx: number;
  label: string;
  description: string;
  accent: string; // hex
  accentSoft: string; // very light tint
  zoneId: ZoneId;
}

type ZoneId = "intake" | "catalog" | "validation" | "compute" | "report";

const PHASE_META: Record<HubPhase, PhaseMeta> = {
  intent: {
    idx: 1,
    label: "질문 접수",
    description: "의뢰서가 허브로 도착했어요",
    accent: "#3B82F6",
    accentSoft: "#EFF6FF",
    zoneId: "intake",
  },
  catalog: {
    idx: 2,
    label: "데이터 수집",
    description: "아카이브에서 후보 데이터를 꺼내고 있어요",
    accent: "#10B981",
    accentSoft: "#ECFDF5",
    zoneId: "catalog",
  },
  exploration: {
    idx: 3,
    label: "품질 검수",
    description: "검수 게이트에서 데이터를 검증하고 있어요",
    accent: "#F59E0B",
    accentSoft: "#FFFBEB",
    zoneId: "validation",
  },
  calculation: {
    idx: 4,
    label: "분석 엔진 가동",
    description: "코어 프로세서가 지표를 결합하고 있어요",
    accent: "#8B5CF6",
    accentSoft: "#F5F3FF",
    zoneId: "compute",
  },
  result: {
    idx: 5,
    label: "리포트 조립",
    description: "결과 리포트를 조립해 출고합니다",
    accent: "#EC4899",
    accentSoft: "#FDF2F8",
    zoneId: "report",
  },
};

// Zone positions on a 100x100 abstract canvas (percent units).
// Layout sketch (L→R flow with catalog rising above the line):
//
//                   CATALOG (40, 18)
//                    │
//                    ▼
//  INTAKE (10, 55) ──► VALIDATION (42, 55) ──► COMPUTE (70, 48) ──► REPORT (91, 58)
//
const ZONE_POS: Record<ZoneId, { x: number; y: number }> = {
  intake: { x: 10, y: 58 },
  catalog: { x: 37, y: 22 },
  validation: { x: 43, y: 58 },
  compute: { x: 70, y: 50 },
  report: { x: 91, y: 60 },
};

// ═══════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════

function cn(...parts: Array<string | false | undefined | null>) {
  return parts.filter(Boolean).join(" ");
}

// ═══════════════════════════════════════════════════════════════════
// FLOOR GRID + AMBIENT ATMOSPHERE
// ═══════════════════════════════════════════════════════════════════

function HubFloor() {
  return (
    <>
      {/* Soft vertical vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 50% 42%, rgba(255,255,255,0.85), transparent 70%)",
        }}
      />
      {/* Isometric-ish grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(15,23,42,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.045) 1px, transparent 1px)",
          backgroundSize: "38px 38px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 55%, black 40%, transparent 85%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 55%, black 40%, transparent 85%)",
        }}
      />
      {/* Horizon wash */}
      <div
        className="absolute inset-x-0 top-0 h-1/3 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(99,102,241,0.05), transparent)",
        }}
      />
    </>
  );
}

// Deterministic pseudo-random so SSR and client render identically
function seeded(i: number, salt: number) {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function HubDustMotes() {
  const motes = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        id: i,
        left: (8 + seeded(i, 1) * 84).toFixed(2),
        top: (40 + seeded(i, 2) * 45).toFixed(2),
        delay: (seeded(i, 3) * 5).toFixed(2),
        duration: (5 + seeded(i, 4) * 4).toFixed(2),
      })),
    []
  );
  return (
    <div className="absolute inset-0 pointer-events-none">
      {motes.map((m) => (
        <div
          key={m.id}
          className="absolute h-1 w-1 rounded-full bg-indigo-300/50"
          style={{
            left: `${m.left}%`,
            top: `${m.top}%`,
            animation: `hubDust ${m.duration}s ${m.delay}s ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// CONVEYOR CONNECTORS
// ═══════════════════════════════════════════════════════════════════

/**
 * Connector between two zones, drawn as a thin "conveyor track"
 * (dashed line that continuously flows). Active connectors glow.
 */
function HubConnector({
  from,
  to,
  active,
  accent = "#94A3B8",
}: {
  from: ZoneId;
  to: ZoneId;
  active: boolean;
  accent?: string;
}) {
  const a = ZONE_POS[from];
  const b = ZONE_POS[to];
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;

  return (
    <div
      className="absolute"
      style={{
        left: `${a.x}%`,
        top: `${a.y}%`,
        width: `${length}%`,
        height: active ? 3 : 2,
        transform: `translate(0, -50%) rotate(${angleDeg}deg)`,
        transformOrigin: "0% 50%",
        borderRadius: 2,
        background: active
          ? `repeating-linear-gradient(90deg, ${accent} 0 14px, ${accent}33 14px 22px)`
          : `repeating-linear-gradient(90deg, ${accent}40 0 10px, transparent 10px 18px)`,
        backgroundSize: active ? "28px 100%" : "20px 100%",
        animation: active
          ? "hubConveyorFlowActive 0.9s linear infinite"
          : "hubConveyorFlow 3.2s linear infinite",
        boxShadow: active ? `0 0 14px ${accent}55` : "none",
        opacity: active ? 1 : 0.45,
        transition: "opacity 0.5s ease, height 0.3s ease",
      }}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════
// ZONE BASE — platform + spotlight + label
// ═══════════════════════════════════════════════════════════════════

function ZonePlatform({
  zoneId,
  active,
  label,
  sublabel,
  accent,
  accentSoft,
  size = 160,
  children,
}: {
  zoneId: ZoneId;
  active: boolean;
  label: string;
  sublabel: string;
  accent: string;
  accentSoft: string;
  size?: number;
  children: React.ReactNode;
}) {
  const { x, y } = ZONE_POS[zoneId];
  return (
    <div
      className="absolute"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        transform: "translate(-50%, -50%)",
        transition: "filter 0.6s ease, opacity 0.6s ease",
        filter: active ? "none" : "saturate(0.45)",
        opacity: active ? 1 : 0.68,
      }}
    >
      {/* Radial ground glow */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: active
            ? `radial-gradient(circle at 50% 55%, ${accent}33, ${accent}10 45%, transparent 75%)`
            : `radial-gradient(circle at 50% 55%, ${accent}14, transparent 65%)`,
          animation: active
            ? "hubZoneActivePulse 3.2s ease-in-out infinite"
            : "hubZoneIdlePulse 5s ease-in-out infinite",
        }}
      />

      {/* Expanding ring (only when active, as focus cue) */}
      {active && (
        <>
          <div
            className="absolute left-1/2 top-[55%] -translate-x-1/2 -translate-y-1/2 rounded-full border pointer-events-none"
            style={{
              width: size * 0.85,
              height: size * 0.85,
              borderColor: `${accent}55`,
              animation: "hubPlatformRing 2.4s ease-out infinite",
            }}
          />
          <div
            className="absolute left-1/2 top-[55%] -translate-x-1/2 -translate-y-1/2 rounded-full border pointer-events-none"
            style={{
              width: size * 0.85,
              height: size * 0.85,
              borderColor: `${accent}33`,
              animation: "hubPlatformRing 2.4s 0.8s ease-out infinite",
            }}
          />
        </>
      )}

      {/* Zone label — always visible but de-emphasized when idle */}
      <div
        className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-full pb-1 whitespace-nowrap text-center pointer-events-none"
        style={{ opacity: active ? 1 : 0.55 }}
      >
        <div
          className="text-[9px] font-bold uppercase tracking-[0.18em]"
          style={{ color: active ? accent : "#64748B" }}
        >
          {label}
        </div>
        {active && (
          <div
            className="text-[10px] font-medium mt-0.5"
            style={{
              color: "#475569",
              animation: "hubMetaSlideIn 0.4s ease-out",
            }}
          >
            {sublabel}
          </div>
        )}
      </div>

      {/* Zone content */}
      <div className="absolute inset-0">{children}</div>

      {/* Subtle background tint when active */}
      {active && (
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 50% 55%, ${accentSoft}, transparent 75%)`,
            animation: "hubSpotlightIn 0.5s ease-out",
          }}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// INTAKE ZONE — Quest desk
// ═══════════════════════════════════════════════════════════════════

function IntakeZoneContent({ active, query }: { active: boolean; query: string }) {
  return (
    <>
      {/* Reception desk — isometric hint */}
      <svg
        className="absolute left-1/2 top-[62%] -translate-x-1/2"
        width="110"
        height="44"
        viewBox="0 0 110 44"
        fill="none"
      >
        <defs>
          <linearGradient id="deskFront" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#E0E7FF" />
            <stop offset="1" stopColor="#C7D2FE" />
          </linearGradient>
          <linearGradient id="deskTop" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#EEF2FF" />
            <stop offset="1" stopColor="#C7D2FE" />
          </linearGradient>
        </defs>
        {/* Desk top (parallelogram) */}
        <polygon points="15,14 95,14 105,24 5,24" fill="url(#deskTop)" stroke="#A5B4FC" strokeWidth="1" />
        {/* Desk front */}
        <rect x="5" y="24" width="100" height="14" fill="url(#deskFront)" stroke="#A5B4FC" strokeWidth="1" rx="1" />
        {/* Slot */}
        <rect x="46" y="18" width="18" height="2" fill="#6366F1" opacity="0.4" rx="1" />
      </svg>

      {/* Stacked inbox tray (always visible, subtle ambient) */}
      <div
        className="absolute left-[12%] top-[62%] -translate-y-1/2 rounded-sm border border-indigo-300/60 bg-white/90 shadow-sm"
        style={{ width: 18, height: 10 }}
      >
        <div className="absolute inset-0.5 rounded-[1px] bg-indigo-100/70" />
      </div>
      <div
        className="absolute left-[12%] top-[65%] -translate-y-1/2 rounded-sm border border-indigo-300/60 bg-white/90 shadow-sm"
        style={{ width: 18, height: 10 }}
      />

      {/* Quest card materializes on active */}
      {active && (
        <>
          {/* Stamp ripple */}
          <div
            key="ripple"
            className="absolute left-1/2 top-[50%] rounded-full border-2 pointer-events-none"
            style={{
              width: 90,
              height: 90,
              borderColor: "#3B82F6",
              transform: "translate(-50%, -50%)",
              animation: "hubQuestStampRipple 1.6s ease-out 0.3s 2",
            }}
          />
          {/* Glow halo */}
          <div
            className="absolute left-1/2 top-[50%] rounded-2xl pointer-events-none"
            style={{
              width: 140,
              height: 84,
              transform: "translate(-50%, -50%)",
              background:
                "radial-gradient(ellipse at center, rgba(59,130,246,0.28), transparent 70%)",
              filter: "blur(8px)",
              animation: "hubQuestGlow 2.4s ease-in-out infinite",
            }}
          />
          {/* Quest order card */}
          <div
            className="absolute left-1/2 top-[50%] rounded-lg bg-white border-2 border-blue-200 shadow-[0_14px_32px_-8px_rgba(59,130,246,0.4)] p-2.5 pointer-events-none"
            style={{
              width: 132,
              transform: "translate(-50%, -50%)",
              animation: "hubQuestMaterialize 1s cubic-bezier(0.22, 1, 0.36, 1) forwards",
            }}
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <div
                className="h-1.5 w-1.5 rounded-full bg-blue-500"
                style={{ animation: "hubZoneActivePulse 1.5s ease-in-out infinite" }}
              />
              <div className="text-[7px] font-bold uppercase tracking-[0.15em] text-blue-600">
                Quest Order
              </div>
              <div className="ml-auto text-[7px] text-blue-400 tabular-nums">#SDA-2026</div>
            </div>
            <div
              className="text-[9.5px] font-semibold text-slate-700 leading-snug"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              &ldquo;{query || "분석 요청"}&rdquo;
            </div>
            <div className="mt-1.5 flex gap-1">
              <span className="text-[7px] px-1 py-[1px] rounded bg-blue-50 border border-blue-100 text-blue-600">
                접수완료
              </span>
              <span className="text-[7px] px-1 py-[1px] rounded bg-slate-50 border border-slate-100 text-slate-500">
                의뢰서
              </span>
            </div>
          </div>
        </>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════
// CATALOG ZONE — Archive shelves with data volumes
// ═══════════════════════════════════════════════════════════════════

function CatalogZoneContent({
  active,
  datasets,
}: {
  active: boolean;
  datasets: Dataset[];
}) {
  const pulled = active ? datasets.slice(0, 4) : [];

  return (
    <>
      {/* Shelving system (always visible) */}
      <div className="absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2">
        {/* Shelf unit */}
        <div className="relative" style={{ width: 120, height: 70 }}>
          {/* Back panel */}
          <div
            className="absolute inset-x-2 top-0 bottom-0 rounded-sm border border-emerald-200/70"
            style={{
              background:
                "linear-gradient(180deg, #ECFDF5 0%, #D1FAE5 60%, #A7F3D0 100%)",
            }}
          />
          {/* Horizontal shelves */}
          {[0, 1, 2].map((row) => (
            <div
              key={row}
              className="absolute inset-x-1 h-[1.5px] bg-emerald-400/70"
              style={{ top: 10 + row * 20 }}
            />
          ))}
          {/* Vertical separators */}
          {[0, 1, 2, 3].map((col) => (
            <div
              key={col}
              className="absolute top-1 bottom-1 w-[1.5px] bg-emerald-400/70"
              style={{ left: 10 + col * 28 }}
            />
          ))}
          {/* Book spines on shelves */}
          {Array.from({ length: 15 }).map((_, i) => {
            const row = Math.floor(i / 5);
            const col = i % 5;
            const hue = 145 + (i * 7) % 40;
            return (
              <div
                key={i}
                className="absolute rounded-[1px] border border-emerald-600/30"
                style={{
                  left: 12 + col * 22 + (i * 3) % 6,
                  top: 12 + row * 20,
                  width: 3 + (i % 3),
                  height: 16,
                  backgroundColor: `hsl(${hue}, 55%, ${60 + (i % 3) * 6}%)`,
                  animation: active
                    ? `hubShelfGlow ${2 + (i % 3) * 0.5}s ease-in-out ${(i * 0.1) % 1}s infinite`
                    : undefined,
                  opacity: active ? 1 : 0.55,
                }}
              />
            );
          })}
          {/* Scan beam when active */}
          {active && (
            <div
              className="absolute inset-y-0 w-0.5 bg-gradient-to-b from-transparent via-emerald-500 to-transparent pointer-events-none"
              style={{
                left: "50%",
                animation: "hubGateScan 2.4s ease-in-out infinite",
                boxShadow: "0 0 10px rgba(16,185,129,0.8)",
              }}
            />
          )}
        </div>
      </div>

      {/* Archive label */}
      <div
        className="absolute left-1/2 top-[10%] -translate-x-1/2 text-[7px] font-bold text-emerald-700/70 uppercase tracking-[0.2em] whitespace-nowrap"
        style={{ opacity: active ? 0 : 0.7 }}
      >
        Data Archive
      </div>

      {/* Data volumes pulled from shelves (active state) */}
      {pulled.map((ds, i) => {
        const angle = -40 + i * 25;
        const rad = (angle * Math.PI) / 180;
        const radius = 70;
        const tx = Math.cos(rad) * radius;
        const ty = Math.sin(rad) * radius * 0.6 + 30;
        const delay = 0.4 + i * 0.35;
        return (
          <div
            key={ds.id}
            className="absolute left-1/2 top-[58%] pointer-events-none"
            style={{
              transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px))`,
              animation: `hubVolumePull 0.8s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s both, hubVolumeDrift 2.4s ease-in-out ${delay + 0.8}s infinite`,
            }}
          >
            <div className="flex items-center gap-1 rounded-md border-2 border-emerald-300 bg-white shadow-[0_8px_18px_-6px_rgba(16,185,129,0.4)] px-2 py-1">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
              <div className="text-[8px] font-semibold text-slate-700 whitespace-nowrap max-w-[74px] overflow-hidden text-ellipsis">
                {ds.title}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════
// VALIDATION ZONE — Inspection gate
// ═══════════════════════════════════════════════════════════════════

function ValidationZoneContent({
  active,
  datasets,
}: {
  active: boolean;
  datasets: Dataset[];
}) {
  const inspected = datasets.slice(0, 4);

  return (
    <>
      {/* Gate structure */}
      <div className="absolute left-1/2 top-[55%] -translate-x-1/2 -translate-y-1/2">
        <div className="relative" style={{ width: 150, height: 78 }}>
          {/* Left pillar */}
          <div
            className="absolute top-0 left-0 bottom-0 rounded-sm border-2 border-amber-300"
            style={{
              width: 10,
              background: "linear-gradient(180deg, #FEF3C7, #FDE68A)",
              animation: active ? "hubGatePulse 2s ease-in-out infinite" : undefined,
            }}
          />
          {/* Right pillar */}
          <div
            className="absolute top-0 right-0 bottom-0 rounded-sm border-2 border-amber-300"
            style={{
              width: 10,
              background: "linear-gradient(180deg, #FEF3C7, #FDE68A)",
              animation: active ? "hubGatePulse 2s ease-in-out 0.6s infinite" : undefined,
            }}
          />
          {/* Arch top */}
          <div
            className="absolute top-0 left-0 right-0 h-2 rounded-t-sm border-t-2 border-x-2 border-amber-300"
            style={{ background: "linear-gradient(180deg, #FDE68A, #FCD34D)" }}
          />
          {/* Belt floor */}
          <div
            className="absolute bottom-2 left-0 right-0 h-3 rounded-sm border border-amber-400/60"
            style={{
              background:
                "repeating-linear-gradient(90deg, #FDE68A 0 6px, #FCD34D 6px 12px)",
              animation: active
                ? "hubConveyorFlowActive 0.5s linear infinite"
                : "hubConveyorFlow 3s linear infinite",
              backgroundSize: "24px 100%",
            }}
          />

          {/* Scan beam */}
          {active && (
            <div
              className="absolute top-3 bottom-6 w-[2px] rounded-full pointer-events-none"
              style={{
                left: "50%",
                background:
                  "linear-gradient(180deg, transparent, #F59E0B, transparent)",
                boxShadow: "0 0 12px rgba(245,158,11,0.9)",
                animation: "hubGateScan 1.8s ease-in-out infinite",
              }}
            />
          )}

          {/* Inspected packets flowing through */}
          {active &&
            inspected.map((ds, i) => {
              const isReject = i === 2; // visual: third packet gets rejected
              const baseDelay = 0.4 + i * 1.1;
              return (
                <div
                  key={ds.id}
                  className="absolute left-2 top-[24px] pointer-events-none"
                  style={{
                    animation: isReject
                      ? `hubGateReject 3.6s ease-in-out ${baseDelay}s infinite`
                      : `hubGatePass 3.2s ease-in-out ${baseDelay}s infinite`,
                  }}
                >
                  <div
                    className={cn(
                      "relative rounded border shadow-sm px-1.5 py-0.5",
                      isReject
                        ? "bg-red-50 border-red-300"
                        : "bg-white border-amber-300"
                    )}
                  >
                    <div className="text-[7px] font-semibold whitespace-nowrap max-w-[48px] overflow-hidden text-ellipsis text-slate-700">
                      {ds.title.replace("서울시 ", "")}
                    </div>
                    {/* Stamp */}
                    <div
                      className={cn(
                        "absolute -top-1 -right-1 h-3 w-3 rounded-full border flex items-center justify-center text-[6px] font-bold",
                        isReject
                          ? "bg-red-500 border-red-600 text-white"
                          : "bg-emerald-500 border-emerald-600 text-white"
                      )}
                      style={{
                        animation: `hubGateCheck 3.2s ease-out ${baseDelay + 1.2}s infinite`,
                      }}
                    >
                      {isReject ? "✕" : "✓"}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════
// COMPUTE ZONE — Core reactor (THE wow moment)
// ═══════════════════════════════════════════════════════════════════

function ComputeZoneContent({
  active,
  datasets,
}: {
  active: boolean;
  datasets: Dataset[];
}) {
  return (
    <>
      {/* Subtle grid backdrop */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-3xl pointer-events-none"
        style={{
          width: 180,
          height: 180,
          backgroundImage:
            "radial-gradient(circle, rgba(139,92,246,0.12) 1px, transparent 1px)",
          backgroundSize: "14px 14px",
          animation: active
            ? "hubGridPulse 2.4s ease-in-out infinite"
            : "hubZoneIdlePulse 6s ease-in-out infinite",
          opacity: active ? 0.9 : 0.3,
        }}
      />

      {/* Outer ring (always spins slowly) */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-violet-300/70"
        style={{
          width: 136,
          height: 136,
          animation: `hubCoreSpin ${active ? 12 : 30}s linear infinite`,
        }}
      />

      {/* Middle ring (opposite direction) */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-violet-300/80"
        style={{
          width: 100,
          height: 100,
          animation: `hubCoreSpinReverse ${active ? 8 : 20}s linear infinite`,
        }}
      />

      {/* Pulsing core orb */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: 58,
          height: 58,
          background:
            "radial-gradient(circle at 35% 35%, #C4B5FD, #8B5CF6 55%, #6D28D9 100%)",
          animation: active
            ? "hubCoreBreath 2s ease-in-out infinite"
            : "hubZoneIdlePulse 4s ease-in-out infinite",
        }}
      >
        {/* Inner highlight */}
        <div
          className="absolute rounded-full bg-white/40 blur-[2px]"
          style={{ top: 8, left: 10, width: 14, height: 10 }}
        />
        {/* Core symbol */}
        <div
          className="absolute inset-0 flex items-center justify-center text-white font-bold"
          style={{ fontSize: 20 }}
        >
          ∑
        </div>
      </div>

      {/* Orbiting data chips — only when active */}
      {active && (
        <>
          {[0, 1, 2].map((i) => (
            <div
              key={`orbit-outer-${i}`}
              className="absolute left-1/2 top-1/2 rounded-md bg-white border border-violet-300 shadow-sm px-1 py-0.5 text-[7px] font-bold text-violet-700"
              style={{
                animation: `hubCoreOrbit ${6 + i * 1.2}s linear ${i * 0.4}s infinite`,
                transformOrigin: "0 0",
              }}
            >
              {["λ", "σ", "π"][i]}
            </div>
          ))}
          {[0, 1, 2, 3].map((i) => (
            <div
              key={`orbit-inner-${i}`}
              className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-violet-500"
              style={{
                animation: `hubCoreOrbitInner ${3 + i * 0.3}s linear ${i * 0.2}s infinite`,
                transformOrigin: "0 0",
                boxShadow: "0 0 6px rgba(139,92,246,0.8)",
              }}
            />
          ))}
        </>
      )}

      {/* Expanding energy rings — only when active */}
      {active && (
        <>
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-violet-400"
            style={{
              width: 60,
              height: 60,
              animation: "hubCoreRing 2.4s ease-out infinite",
            }}
          />
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-300"
            style={{
              width: 60,
              height: 60,
              animation: "hubCoreRing 2.4s ease-out 0.8s infinite",
            }}
          />
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-200"
            style={{
              width: 60,
              height: 60,
              animation: "hubCoreRing 2.4s ease-out 1.6s infinite",
            }}
          />
        </>
      )}

      {/* Dataset feed-in streaks — active only */}
      {active &&
        datasets.slice(0, 4).map((ds, i) => {
          const angle = 180 + i * 20; // feed from the left side
          const rad = (angle * Math.PI) / 180;
          const startX = Math.cos(rad) * 90;
          const startY = Math.sin(rad) * 90;
          return (
            <div
              key={`feed-${ds.id}`}
              className="absolute left-1/2 top-1/2 h-1 w-8 rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, transparent, #A78BFA, #8B5CF6)",
                ["--tx" as string]: `${-startX}px`,
                ["--ty" as string]: `${-startY}px`,
                transform: `translate(${startX}px, ${startY}px)`,
                animation: `hubDataStream 1.8s ease-in ${0.3 + i * 0.25}s infinite`,
                boxShadow: "0 0 8px rgba(139,92,246,0.6)",
              } as React.CSSProperties}
            />
          );
        })}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════
// REPORT ZONE — Assembly & reveal
// ═══════════════════════════════════════════════════════════════════

function ReportZoneContent({ active }: { active: boolean }) {
  return (
    <>
      {/* Assembly table */}
      <svg
        className="absolute left-1/2 top-[74%] -translate-x-1/2"
        width="120"
        height="30"
        viewBox="0 0 120 30"
        fill="none"
      >
        <polygon points="15,8 105,8 115,18 5,18" fill="#FDF2F8" stroke="#F9A8D4" strokeWidth="1" />
        <rect x="5" y="18" width="110" height="10" fill="#FCE7F3" stroke="#F9A8D4" strokeWidth="1" rx="1" />
      </svg>

      {/* Empty state — small stacked sheets */}
      {!active && (
        <>
          <div
            className="absolute left-[35%] top-[48%] rounded-sm bg-white/80 border border-rose-200 shadow-sm"
            style={{ width: 32, height: 8 }}
          />
          <div
            className="absolute left-[40%] top-[52%] rounded-sm bg-white/80 border border-rose-200 shadow-sm"
            style={{ width: 32, height: 8 }}
          />
        </>
      )}

      {/* Report card — assembles when active */}
      {active && (
        <>
          {/* Spark burst */}
          <div
            className="absolute left-1/2 top-[50%] rounded-full pointer-events-none"
            style={{
              width: 120,
              height: 120,
              background:
                "radial-gradient(circle, rgba(236,72,153,0.35), transparent 65%)",
              transform: "translate(-50%, -50%)",
              animation: "hubSparkBurst 1.8s ease-out 0.4s forwards",
            }}
          />

          {/* The report card */}
          <div
            className="absolute left-1/2 top-[50%] rounded-lg bg-white border-2 border-rose-200 shadow-[0_20px_50px_-12px_rgba(236,72,153,0.45)] p-2.5 pointer-events-none"
            style={{
              width: 122,
              transform: "translate(-50%, -50%)",
              transformOrigin: "50% 100%",
              animation:
                "hubReportAssemble 1.1s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both, hubReportLift 2.6s ease-in-out 1.4s infinite",
            }}
          >
            <div className="flex items-center gap-1 mb-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              <div className="text-[7px] font-bold uppercase tracking-[0.14em] text-rose-600">
                Final Report
              </div>
            </div>
            {/* Report lines */}
            <div className="space-y-1">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-[3px] rounded-full bg-rose-100"
                  style={{
                    width: `${60 + ((i * 13) % 35)}%`,
                    animation: `hubReportLine 0.4s ease-out ${0.6 + i * 0.15}s both`,
                  }}
                />
              ))}
            </div>
            {/* Mini chart preview */}
            <div
              className="mt-2 h-4 rounded-sm relative overflow-hidden border border-rose-100"
              style={{
                background:
                  "linear-gradient(180deg, #FDF2F8 0%, #FCE7F3 100%)",
                animation: "hubReportLine 0.5s ease-out 1.2s both",
              }}
            >
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="absolute bottom-0 bg-rose-400 rounded-t-sm"
                  style={{
                    left: `${10 + i * 18}%`,
                    width: 4,
                    height: `${40 + (i * 13) % 50}%`,
                    animation: `hubReportLine 0.3s ease-out ${1.3 + i * 0.05}s both`,
                  }}
                />
              ))}
            </div>
            <div className="mt-1.5 flex items-center justify-between">
              <span className="text-[6.5px] text-rose-500/80 font-medium">
                5개 지표 분석 완료
              </span>
              <span className="text-[6.5px] text-rose-400">✓</span>
            </div>
          </div>
        </>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TRAVELING WORK ITEMS (between-zone choreography)
// ═══════════════════════════════════════════════════════════════════

/**
 * When transitioning into a new phase, a "carrier" flies from the
 * previous zone to the active zone to show the work actually moving.
 */
function HubCarrier({
  phase,
  tick,
}: {
  phase: HubPhase;
  tick: number;
}) {
  const order: HubPhase[] = [
    "intent",
    "catalog",
    "exploration",
    "calculation",
    "result",
  ];
  const idx = order.indexOf(phase);
  if (idx <= 0) return null;

  const fromZone = PHASE_META[order[idx - 1]].zoneId;
  const toZone = PHASE_META[phase].zoneId;
  const accent = PHASE_META[phase].accent;

  const a = ZONE_POS[fromZone];
  const b = ZONE_POS[toZone];

  return (
    <div
      key={`carrier-${phase}-${tick}`}
      className="absolute pointer-events-none z-30"
      style={{
        left: `${a.x}%`,
        top: `${a.y}%`,
        transform: "translate(-50%, -50%)",
        animation: `hubCarrierFlow 1.1s cubic-bezier(0.55, 0, 0.45, 1) forwards`,
        ["--from-x" as string]: `${a.x}%`,
        ["--from-y" as string]: `${a.y}%`,
        ["--to-x" as string]: `${b.x}%`,
        ["--to-y" as string]: `${b.y}%`,
      } as React.CSSProperties}
    >
      <div
        className="rounded-md border-2 bg-white shadow-lg px-2 py-1 flex items-center gap-1"
        style={{ borderColor: accent }}
      >
        <div
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: accent }}
        />
        <span
          className="text-[7px] font-bold uppercase tracking-wider"
          style={{ color: accent }}
        >
          Delivering
        </span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// HEADER & META
// ═══════════════════════════════════════════════════════════════════

function HubHeader({
  phase,
  progress,
  datasets,
}: {
  phase: HubPhase;
  progress: number;
  datasets: Dataset[];
}) {
  const meta = PHASE_META[phase];
  return (
    <div className="relative z-20 flex items-center justify-between px-6 pt-5 pb-3 shrink-0">
      {/* Left: zone label chip */}
      <div
        key={`label-${phase}`}
        className="flex items-center gap-3"
        style={{ animation: "hubMetaSlideIn 0.4s ease-out" }}
      >
        <div
          className="flex items-center gap-2 rounded-full border px-3 py-1.5 bg-white shadow-sm"
          style={{ borderColor: `${meta.accent}40` }}
        >
          <div
            className="h-2 w-2 rounded-full"
            style={{
              backgroundColor: meta.accent,
              animation: "hubZoneActivePulse 1.6s ease-in-out infinite",
            }}
          />
          <span
            className="text-[11px] font-bold uppercase tracking-[0.14em]"
            style={{ color: meta.accent }}
          >
            {meta.label}
          </span>
        </div>
        <span className="text-xs text-slate-500 hidden sm:inline font-medium">
          {meta.description}
        </span>
      </div>

      {/* Right: step counter */}
      <div className="flex items-center gap-2">
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
          Station
        </div>
        <div className="tabular-nums text-xs font-bold text-slate-600">
          {meta.idx}
          <span className="text-slate-300">/5</span>
        </div>
      </div>
    </div>
  );
}

function HubProgressStrip({
  progress,
  accent,
}: {
  progress: number;
  accent: string;
}) {
  return (
    <div className="relative z-20 px-6 pb-3 shrink-0">
      <div className="relative h-[3px] rounded-full bg-slate-200/70 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 ease-out"
          style={{
            width: `${progress}%`,
            background: `linear-gradient(90deg, #6366F1, ${accent})`,
          }}
        />
        {/* Shimmer */}
        <div
          className="absolute inset-y-0 w-12 pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
            animation: "hubScanSweep 2.4s ease-in-out infinite",
          }}
        />
      </div>
    </div>
  );
}

function HubDatasetRail({
  datasets,
  accent,
}: {
  datasets: Dataset[];
  accent: string;
}) {
  if (datasets.length === 0) return null;
  return (
    <div
      className="relative z-20 px-6 py-3 border-t border-slate-200/60 bg-white/60 backdrop-blur-sm shrink-0 flex items-center gap-2 flex-wrap"
      style={{ animation: "hubMetaSlideIn 0.4s ease-out" }}
    >
      <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
        In flight
      </span>
      {datasets.slice(0, 4).map((ds, i) => (
        <div
          key={ds.id}
          className="flex items-center gap-1.5 rounded-full border bg-white px-2.5 py-1 shadow-sm"
          style={{
            borderColor: `${accent}33`,
            animation: `hubChipIn 0.4s ease-out ${i * 0.08}s both`,
          }}
        >
          <div
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: accent }}
          />
          <span className="text-[11px] font-medium text-slate-700">
            {ds.title}
          </span>
        </div>
      ))}
      {datasets.length > 4 && (
        <span className="text-[10px] text-slate-400">
          +{datasets.length - 4}
        </span>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════

export interface DataHubSceneProps {
  phase: HubPhase;
  progress: number;
  query: string;
  datasets: Dataset[];
}

export function DataHubScene({
  phase,
  progress,
  query,
  datasets,
}: DataHubSceneProps) {
  const meta = PHASE_META[phase];
  const activeZoneId = meta.zoneId;

  // Tick resets every time phase changes — used to re-key scene bits
  // so that one-shot animations (carrier, quest materialize, etc.) can
  // restart cleanly on re-entry to a phase.
  const [tick, setTick] = useState(0);
  useEffect(() => {
    setTick((t) => t + 1);
  }, [phase]);

  return (
    <div
      className="relative flex h-full w-full flex-col overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 35%, #F1F5F9 100%)",
      }}
    >
      <HubHeader phase={phase} progress={progress} datasets={datasets} />
      <HubProgressStrip progress={progress} accent={meta.accent} />

      {/* ── Hub canvas ── */}
      <div className="relative flex-1 min-h-0 overflow-hidden">
        <HubFloor />
        <HubDustMotes />

        {/* Connectors (behind zones) */}
        <HubConnector
          from="intake"
          to="validation"
          active={phase === "catalog" || phase === "exploration"}
          accent={PHASE_META.exploration.accent}
        />
        <HubConnector
          from="catalog"
          to="validation"
          active={phase === "catalog"}
          accent={PHASE_META.catalog.accent}
        />
        <HubConnector
          from="validation"
          to="compute"
          active={phase === "exploration" || phase === "calculation"}
          accent={PHASE_META.calculation.accent}
        />
        <HubConnector
          from="compute"
          to="report"
          active={phase === "calculation" || phase === "result"}
          accent={PHASE_META.result.accent}
        />

        {/* Zones */}
        <ZonePlatform
          zoneId="intake"
          active={activeZoneId === "intake"}
          label="Intake"
          sublabel="의뢰서 접수"
          accent={PHASE_META.intent.accent}
          accentSoft={PHASE_META.intent.accentSoft}
          size={150}
        >
          <IntakeZoneContent active={activeZoneId === "intake"} query={query} />
        </ZonePlatform>

        <ZonePlatform
          zoneId="catalog"
          active={activeZoneId === "catalog"}
          label="Archive"
          sublabel="데이터 아카이브"
          accent={PHASE_META.catalog.accent}
          accentSoft={PHASE_META.catalog.accentSoft}
          size={180}
        >
          <CatalogZoneContent
            active={activeZoneId === "catalog"}
            datasets={datasets}
          />
        </ZonePlatform>

        <ZonePlatform
          zoneId="validation"
          active={activeZoneId === "validation"}
          label="Quality Gate"
          sublabel="품질 검수 게이트"
          accent={PHASE_META.exploration.accent}
          accentSoft={PHASE_META.exploration.accentSoft}
          size={180}
        >
          <ValidationZoneContent
            active={activeZoneId === "validation"}
            datasets={datasets}
          />
        </ZonePlatform>

        <ZonePlatform
          zoneId="compute"
          active={activeZoneId === "compute"}
          label="Compute Core"
          sublabel="코어 프로세서"
          accent={PHASE_META.calculation.accent}
          accentSoft={PHASE_META.calculation.accentSoft}
          size={210}
        >
          <ComputeZoneContent
            active={activeZoneId === "compute"}
            datasets={datasets}
          />
        </ZonePlatform>

        <ZonePlatform
          zoneId="report"
          active={activeZoneId === "report"}
          label="Dispatch"
          sublabel="리포트 출고"
          accent={PHASE_META.result.accent}
          accentSoft={PHASE_META.result.accentSoft}
          size={160}
        >
          <ReportZoneContent active={activeZoneId === "report"} />
        </ZonePlatform>

        {/* Traveling carrier (fires on phase transitions) */}
        <HubCarrier phase={phase} tick={tick} />
      </div>

      <HubDatasetRail datasets={datasets} accent={meta.accent} />
    </div>
  );
}
