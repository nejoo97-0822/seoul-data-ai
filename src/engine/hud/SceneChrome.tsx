"use client";

import type { SceneDefinition, ThemeDefinition } from "../core/types";

interface SceneChromeProps {
  scene: SceneDefinition;
  sceneIndex: number;
  totalScenes: number;
  overallProgress: number;
  theme: ThemeDefinition;
}

export function SceneChrome({
  scene,
  sceneIndex,
  totalScenes,
  overallProgress,
  theme,
}: SceneChromeProps) {
  const sceneAccent =
    theme.sceneAccents[scene.id]?.accent ?? theme.palette.primary;

  return (
    <div className="flex items-center gap-4 px-6 pt-5 pb-4 shrink-0 pointer-events-auto">
      {/* Scene label chip — smooth color transition */}
      <div
        className="flex items-center gap-2 rounded-full border px-3 py-1.5 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.06)] transition-all duration-500 ease-out"
        style={{ borderColor: `${sceneAccent}40` }}
      >
        <div
          className="h-1.5 w-1.5 rounded-full animate-pulse transition-all duration-500"
          style={{
            backgroundColor: sceneAccent,
            boxShadow: `0 0 10px ${sceneAccent}`,
          }}
        />
        <span
          className="text-[10px] font-bold tabular-nums tracking-widest transition-colors duration-500"
          style={{ color: sceneAccent }}
        >
          {String(sceneIndex + 1).padStart(2, "0")}
        </span>
        <span
          className="text-[11px] font-bold tracking-[0.08em] transition-colors duration-500"
          style={{ color: sceneAccent }}
        >
          {scene.label}
        </span>
      </div>

      {/* Description — fade transition */}
      <span
        className="text-[13px] text-slate-500 font-medium truncate transition-opacity duration-300"
        key={scene.id}
        style={{ animation: "fadeSlideIn 0.4s ease-out" }}
      >
        {scene.description}
      </span>

      {/* Progress bar */}
      <div className="ml-auto flex items-center gap-2">
        <div className="text-[10px] font-bold text-slate-400 tabular-nums tracking-widest">
          {Math.round(overallProgress * 100)}%
        </div>
        <div className="relative h-[3px] w-[120px] rounded-full bg-slate-200/80 overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-200 ease-linear"
            style={{
              width: `${overallProgress * 100}%`,
              background: `linear-gradient(90deg, ${theme.palette.accent}, ${sceneAccent})`,
              boxShadow: `0 0 8px ${sceneAccent}60`,
            }}
          />
        </div>
      </div>

      {/* Inline keyframes for description animation */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
