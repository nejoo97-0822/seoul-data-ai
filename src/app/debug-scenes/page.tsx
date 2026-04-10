"use client";

/**
 * /debug-scenes — Orbital Data Station (Phaser)
 * ──────────────────────────────────────────────
 * Persistent world: one station, no scene cuts.
 * Full-screen immersive view.
 */

import { useState, useEffect } from "react";
import { StationCanvas, stationScript } from "@/station";

export default function DebugScenesPage() {
  const [stageKey, setStageKey] = useState(0);

  // Hide site header for immersive experience
  useEffect(() => {
    const header = document.querySelector("header");
    const main = document.querySelector("main");
    if (header) header.style.display = "none";
    if (main) main.style.flex = "1";
    document.body.style.overflow = "hidden";
    return () => {
      if (header) header.style.display = "";
      if (main) main.style.flex = "";
      document.body.style.overflow = "";
    };
  }, []);

  const totalSec = stationScript.phases
    .reduce((a, p) => a + p.durationSec, 0)
    .toFixed(1);

  return (
    <div className="fixed inset-0 bg-[#0a0e1a] z-50">
      {/* Restart — minimal overlay */}
      <div className="absolute top-3 right-4 z-20 flex items-center gap-2">
        <span className="text-[10px] text-slate-600 tabular-nums font-mono">
          {totalSec}s loop
        </span>
        <button
          onClick={() => setStageKey((k) => k + 1)}
          className="rounded border border-slate-700/50 bg-slate-900/60 px-2 py-0.5 text-[10px] font-medium text-slate-500 hover:text-slate-300 hover:border-slate-600 transition backdrop-blur-sm"
        >
          ↻ Restart
        </button>
      </div>

      {/* Phaser canvas — full screen */}
      <StationCanvas
        key={stageKey}
        script={stationScript}
      />
    </div>
  );
}
