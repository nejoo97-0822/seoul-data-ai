"use client";

/**
 * SceneStage — v2 cinematic loading sequence
 * ───────────────────────────────────────────
 * This is NOT a diagram. It is a short film.
 *
 * The stage plays a 7-beat scene sequence one vignette at a time.
 * Each scene is a self-contained React component that mounts when
 * active and unmounts when done. CSS keyframes drive all animation.
 *
 * Total run time (auto-play mode): ~15.6 seconds.
 *
 * Info layer on top of the stage shows only:
 *   • current scene number + name
 *   • a single line description
 *   • thin progress bar
 *   • (scenes 3–5 only) in-flight dataset ticker
 *
 * Hidden:
 *   • technical logs
 *   • activity feed
 *   • agent characters standing next to stages
 *   • step icon rows
 *   • dotted path + moving dot
 */

import { useEffect, useMemo, useState } from "react";
import type { Dataset } from "@/data/datasets";

import Scene1Spawn from "./scenes/Scene1Spawn";
import Scene2Intake from "./scenes/Scene2Intake";
import Scene3Discovery from "./scenes/Scene3Discovery";
import Scene4Alignment from "./scenes/Scene4Alignment";
import Scene5Compute from "./scenes/Scene5Compute";
import Scene6Assembly from "./scenes/Scene6Assembly";
import Scene7Reveal from "./scenes/Scene7Reveal";

// ─── Scene configuration ───────────────────────────────────────────

export type SceneId = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface SceneMeta {
  id: SceneId;
  label: string;
  description: string;
  accent: string;
  accentSoft: string;
  durationMs: number;
  showTicker: boolean;
}

export const SCENES: SceneMeta[] = [
  {
    id: 1,
    label: "의뢰 생성",
    description: "시민의 질문을 의뢰서로 접수하고 있어요",
    accent: "#3B82F6",
    accentSoft: "#DBEAFE",
    durationMs: 2000,
    showTicker: false,
  },
  {
    id: 2,
    label: "허브 접수",
    description: "의뢰서가 데이터 허브에 도착했어요",
    accent: "#0EA5E9",
    accentSoft: "#E0F2FE",
    durationMs: 1800,
    showTicker: false,
  },
  {
    id: 3,
    label: "데이터 탐색",
    description: "아카이브에서 관련 데이터를 찾고 있어요",
    accent: "#10B981",
    accentSoft: "#D1FAE5",
    durationMs: 2400,
    showTicker: true,
  },
  {
    id: 4,
    label: "정합화",
    description: "데이터를 비교 가능한 형태로 정돈하고 있어요",
    accent: "#F59E0B",
    accentSoft: "#FEF3C7",
    durationMs: 2200,
    showTicker: true,
  },
  {
    id: 5,
    label: "분석 엔진",
    description: "분석 코어가 지표를 결합하고 있어요",
    accent: "#8B5CF6",
    accentSoft: "#EDE9FE",
    durationMs: 3200,
    showTicker: true,
  },
  {
    id: 6,
    label: "리포트 조립",
    description: "결과 리포트를 조립하고 있어요",
    accent: "#EC4899",
    accentSoft: "#FCE7F3",
    durationMs: 2200,
    showTicker: false,
  },
  {
    id: 7,
    label: "분석 완료",
    description: "분석이 끝났어요. 결과를 확인해보세요",
    accent: "#F43F5E",
    accentSoft: "#FFE4E6",
    durationMs: 1800,
    showTicker: false,
  },
];

export const TOTAL_DURATION_MS = SCENES.reduce(
  (acc, s) => acc + s.durationMs,
  0
);

// ─── Shared props passed into every scene ──────────────────────────

export interface SceneComponentProps {
  query: string;
  datasets: Dataset[];
  /** 0..1, how far through the current scene */
  sceneProgress: number;
  accent: string;
  accentSoft: string;
}

// ─── Stage props ───────────────────────────────────────────────────

export interface SceneStageProps {
  query: string;
  datasets: Dataset[];
  /**
   * If provided, show this specific scene and do NOT auto-advance.
   * Used by /debug-scenes scrubbing mode.
   */
  sceneId?: SceneId;
  /**
   * Auto-advance through all 7 scenes then loop back.
   * Defaults to true. Ignored if sceneId is provided.
   */
  autoPlay?: boolean;
  /**
   * Called when the sequence reaches the final scene (scene 7).
   * Useful for /analysis integration to know when to swap in the
   * real result UI.
   */
  onComplete?: () => void;
}

// ─── Main component ────────────────────────────────────────────────

export function SceneStage({
  query,
  datasets,
  sceneId,
  autoPlay = true,
  onComplete,
}: SceneStageProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  const isScrubMode = typeof sceneId === "number";
  const effectiveIdx = isScrubMode ? (sceneId as SceneId) - 1 : currentIdx;
  const scene = SCENES[effectiveIdx];

  // Auto-play ticker (advances elapsed by ~30ms per frame)
  useEffect(() => {
    if (isScrubMode || !autoPlay) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const dt = now - start;
      setElapsed(dt);
      if (dt >= scene.durationMs) {
        // Advance to next scene
        setCurrentIdx((i) => {
          const next = (i + 1) % SCENES.length;
          if (next === 0 && onComplete) onComplete();
          return next;
        });
        setElapsed(0);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [currentIdx, scene.durationMs, autoPlay, isScrubMode, onComplete]);

  // Reset elapsed when scrubbing between scenes
  useEffect(() => {
    if (isScrubMode) setElapsed(0);
  }, [sceneId, isScrubMode]);

  const sceneProgress = Math.min(1, elapsed / scene.durationMs);

  // Overall progress: sum of completed scene durations + current scene progress
  const overallProgress = useMemo(() => {
    const completedMs = SCENES.slice(0, effectiveIdx).reduce(
      (acc, s) => acc + s.durationMs,
      0
    );
    const inSceneMs = sceneProgress * scene.durationMs;
    return (completedMs + inSceneMs) / TOTAL_DURATION_MS;
  }, [effectiveIdx, sceneProgress, scene.durationMs]);

  const sceneProps: SceneComponentProps = {
    query,
    datasets,
    sceneProgress,
    accent: scene.accent,
    accentSoft: scene.accentSoft,
  };

  return (
    <div
      className="relative flex h-full w-full flex-col overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 40%, #F1F5F9 100%)",
      }}
    >
      {/* ── Top chrome strip ─────────────────────────────── */}
      <StageChrome
        scene={scene}
        overallProgress={overallProgress}
        key={`chrome-${effectiveIdx}`}
      />

      {/* ── The stage (shadowbox) ────────────────────────── */}
      <div className="relative flex-1 min-h-0 flex items-center justify-center px-8 py-4">
        <div
          className="relative h-full w-full max-w-[960px] rounded-3xl overflow-hidden"
          style={{
            background:
              "linear-gradient(180deg, #F1F5F9 0%, #E2E8F0 55%, #CBD5E1 100%)",
            boxShadow:
              "inset 0 2px 14px rgba(15,23,42,0.08), 0 24px 60px -20px rgba(15,23,42,0.18), 0 2px 0 rgba(255,255,255,0.8)",
            border: "1px solid rgba(203,213,225,0.9)",
          }}
        >
          {/* Stage atmosphere: subtle radial light from above */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 75% 55% at 50% 12%, rgba(255,255,255,0.9), transparent 75%)",
              animation: "stgFloorGlow 5s ease-in-out infinite",
            }}
          />

          {/* Stage floor grid */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(15,23,42,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.05) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
              maskImage:
                "radial-gradient(ellipse 68% 56% at 50% 58%, black 35%, transparent 85%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 68% 56% at 50% 58%, black 35%, transparent 85%)",
            }}
          />

          {/* The active scene (keyed so mount/unmount restarts animations) */}
          <div
            key={`scene-${effectiveIdx}`}
            className="absolute inset-0"
          >
            <ActiveScene id={scene.id} props={sceneProps} />
          </div>

          {/* Scene number badge (bottom-right corner, very subtle) */}
          <div
            className="absolute bottom-4 right-5 text-[10px] font-bold tracking-[0.2em] text-slate-400 select-none pointer-events-none"
            style={{ animation: "stgChromeSlideIn 0.4s ease-out" }}
          >
            SCENE {String(scene.id).padStart(2, "0")} / 07
          </div>
        </div>
      </div>

      {/* ── Bottom ticker strip (dataset in-flight chips) ──── */}
      <StageTicker
        datasets={datasets}
        show={scene.showTicker}
        accent={scene.accent}
        key={`ticker-${effectiveIdx}`}
      />
    </div>
  );
}

// ─── Scene switcher ────────────────────────────────────────────────

function ActiveScene({
  id,
  props,
}: {
  id: SceneId;
  props: SceneComponentProps;
}) {
  switch (id) {
    case 1:
      return <Scene1Spawn {...props} />;
    case 2:
      return <Scene2Intake {...props} />;
    case 3:
      return <Scene3Discovery {...props} />;
    case 4:
      return <Scene4Alignment {...props} />;
    case 5:
      return <Scene5Compute {...props} />;
    case 6:
      return <Scene6Assembly {...props} />;
    case 7:
      return <Scene7Reveal {...props} />;
  }
}

// ─── Chrome strip (top) ────────────────────────────────────────────

function StageChrome({
  scene,
  overallProgress,
}: {
  scene: SceneMeta;
  overallProgress: number;
}) {
  return (
    <div
      className="relative z-20 flex items-center gap-4 px-6 pt-5 pb-4 shrink-0"
      style={{ animation: "stgChromeSlideIn 0.45s ease-out" }}
    >
      {/* Scene label chip */}
      <div
        className="flex items-center gap-2 rounded-full border px-3 py-1.5 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.06)]"
        style={{ borderColor: `${scene.accent}40` }}
      >
        <div
          className="h-1.5 w-1.5 rounded-full"
          style={{
            backgroundColor: scene.accent,
            boxShadow: `0 0 10px ${scene.accent}`,
            animation: "stgFloorGlow 1.6s ease-in-out infinite",
          }}
        />
        <span
          className="text-[10px] font-bold tabular-nums tracking-widest"
          style={{ color: scene.accent }}
        >
          {String(scene.id).padStart(2, "0")}
        </span>
        <span
          className="text-[11px] font-bold tracking-[0.08em]"
          style={{ color: scene.accent }}
        >
          {scene.label}
        </span>
      </div>

      {/* Description */}
      <span className="text-[13px] text-slate-500 font-medium truncate">
        {scene.description}
      </span>

      {/* Progress bar (right aligned, small) */}
      <div className="ml-auto flex items-center gap-2">
        <div className="text-[10px] font-bold text-slate-400 tabular-nums tracking-widest">
          {Math.round(overallProgress * 100)}%
        </div>
        <div className="relative h-[3px] w-[120px] rounded-full bg-slate-200/80 overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-200 ease-linear"
            style={{
              width: `${overallProgress * 100}%`,
              background: `linear-gradient(90deg, #6366F1, ${scene.accent})`,
              boxShadow: `0 0 8px ${scene.accent}60`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Ticker strip (bottom) ─────────────────────────────────────────

function StageTicker({
  datasets,
  show,
  accent,
}: {
  datasets: Dataset[];
  show: boolean;
  accent: string;
}) {
  if (!show || datasets.length === 0) {
    return (
      <div className="shrink-0 h-10" aria-hidden />
    );
  }
  return (
    <div
      className="relative z-20 shrink-0 h-10 flex items-center gap-2 px-6 border-t border-slate-200/60 bg-white/70 backdrop-blur-sm overflow-hidden"
      style={{ animation: "stgTickerSlideUp 0.45s ease-out" }}
    >
      <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400 shrink-0">
        In flight
      </span>
      <div className="flex items-center gap-1.5 overflow-hidden">
        {datasets.slice(0, 4).map((ds, i) => (
          <div
            key={ds.id}
            className="flex items-center gap-1.5 rounded-full border bg-white px-2.5 py-1 shadow-[0_1px_3px_rgba(15,23,42,0.05)] shrink-0"
            style={{
              borderColor: `${accent}33`,
              animation: `stgChipIn 0.4s ease-out ${i * 0.08}s both`,
            }}
          >
            <div
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: accent }}
            />
            <span className="text-[11px] font-medium text-slate-700 whitespace-nowrap">
              {ds.title}
            </span>
          </div>
        ))}
        {datasets.length > 4 && (
          <span className="text-[10px] text-slate-400 ml-1">
            +{datasets.length - 4}
          </span>
        )}
      </div>
    </div>
  );
}
