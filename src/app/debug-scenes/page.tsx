"use client";

import { useEffect, useState } from "react";
import { DataHubScene } from "@/components/analysis/DataHubScene";
import type { AnalysisPhase } from "@/hooks/useAnalysisSimulation";
import type { Dataset } from "@/data/datasets";

type HubPhase = Exclude<AnalysisPhase, "idle" | "no-match">;

function makeDs(
  id: string,
  title: string,
  category: string,
  categoryColor: string,
  qualityScore: number,
): Dataset {
  return {
    id,
    title,
    summary: "",
    category,
    categoryColor,
    rows: 1000,
    columns: 10,
    qualityScore,
    updateDate: "2025-10",
    updateCycle: "월간",
    source: "서울시",
    spatialUnit: "자치구",
    columnMappings: [],
    useCases: [],
    cautions: [],
    tags: [],
    connectedDatasetIds: [],
    joinKeys: [],
  };
}

const mockDatasets: Dataset[] = [
  makeDs("d1", "서울시 어린이집 현황", "육아", "bg-pink-100 text-pink-700", 92),
  makeDs("d2", "서울시 공원 현황", "환경", "bg-green-100 text-green-700", 88),
  makeDs("d3", "서울시 소아과 의원 현황", "의료", "bg-red-100 text-red-700", 85),
  makeDs("d4", "서울시 안전지수", "안전", "bg-amber-100 text-amber-700", 90),
  makeDs("d5", "서울 생활인구 데이터", "인구", "bg-blue-100 text-blue-700", 95),
];

const phases: HubPhase[] = [
  "intent",
  "catalog",
  "exploration",
  "calculation",
  "result",
];

const PHASE_LABEL: Record<HubPhase, string> = {
  intent: "1. 질문 접수",
  catalog: "2. 데이터 수집",
  exploration: "3. 품질 검수",
  calculation: "4. 분석 엔진",
  result: "5. 리포트 출고",
};

// Default progress per phase for the auto-demo
const PHASE_PROGRESS: Record<HubPhase, number> = {
  intent: 12,
  catalog: 34,
  exploration: 58,
  calculation: 82,
  result: 100,
};

export default function DebugScenesPage() {
  const [phase, setPhase] = useState<HubPhase>("intent");
  const [progress, setProgress] = useState(PHASE_PROGRESS.intent);
  const [dsCount, setDsCount] = useState(4);
  const [autoPlay, setAutoPlay] = useState(true);

  // Auto-advance phase cycle for demo purposes
  useEffect(() => {
    if (!autoPlay) return;
    const id = setInterval(() => {
      setPhase((prev) => {
        const i = phases.indexOf(prev);
        const next = phases[(i + 1) % phases.length];
        setProgress(PHASE_PROGRESS[next]);
        return next;
      });
    }, 3600);
    return () => clearInterval(id);
  }, [autoPlay]);

  return (
    <div className="flex h-screen flex-col bg-slate-100">
      {/* Debug control bar */}
      <div className="border-b border-slate-200 bg-white px-4 py-3 flex items-center gap-3 flex-wrap shrink-0">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
          Scene Debug
        </span>

        <div className="flex items-center gap-1.5">
          {phases.map((p) => (
            <button
              key={p}
              onClick={() => {
                setAutoPlay(false);
                setPhase(p);
                setProgress(PHASE_PROGRESS[p]);
              }}
              className={`rounded-md border px-2.5 py-1 text-[11px] font-medium transition ${
                phase === p
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {PHASE_LABEL[p]}
            </button>
          ))}
        </div>

        <button
          onClick={() => setAutoPlay((v) => !v)}
          className={`rounded-md border px-2.5 py-1 text-[11px] font-medium transition ${
            autoPlay
              ? "bg-emerald-500 text-white border-emerald-500"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          {autoPlay ? "■ Auto" : "▶ Auto"}
        </button>

        <label className="text-[11px] text-slate-600 ml-2 flex items-center gap-2">
          progress
          <input
            type="range"
            min={0}
            max={100}
            value={progress}
            onChange={(e) => {
              setAutoPlay(false);
              setProgress(Number(e.target.value));
            }}
            className="w-24"
          />
          <span className="tabular-nums w-8 text-right">{progress}</span>
        </label>

        <label className="text-[11px] text-slate-600 ml-2 flex items-center gap-1.5">
          datasets
          <input
            type="number"
            min={0}
            max={5}
            value={dsCount}
            onChange={(e) => setDsCount(Number(e.target.value))}
            className="w-12 border border-slate-200 rounded px-1.5 py-0.5 text-[11px]"
          />
        </label>
      </div>

      {/* The hub canvas */}
      <div className="flex-1 min-h-0">
        <DataHubScene
          phase={phase}
          progress={progress}
          datasets={mockDatasets.slice(0, dsCount)}
          query="서울에서 아이 키우기 좋은 구는 어디야?"
        />
      </div>
    </div>
  );
}
