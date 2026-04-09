"use client";

import { useState } from "react";
import { AgentWorkflow } from "@/components/analysis/AgentWorkflow";
import type { AnalysisPhase } from "@/hooks/useAnalysisSimulation";
import type { Dataset } from "@/data/datasets";

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

const phases: AnalysisPhase[] = [
  "intent",
  "catalog",
  "exploration",
  "calculation",
];

export default function DebugScenesPage() {
  const [phase, setPhase] = useState<AnalysisPhase>("intent");
  const [progress, setProgress] = useState(40);
  const [dsCount, setDsCount] = useState(5);

  return (
    <div className="flex h-screen flex-col">
      <div className="border-b px-4 py-3 flex items-center gap-3 flex-wrap bg-white">
        <span className="text-sm font-semibold">Scene Debug:</span>
        {phases.map((p) => (
          <button
            key={p}
            onClick={() => setPhase(p)}
            className={`rounded-md border px-3 py-1 text-xs ${
              phase === p ? "bg-black text-white" : "bg-white"
            }`}
          >
            {p}
          </button>
        ))}
        <label className="text-xs ml-4">
          progress
          <input
            type="range"
            min={0}
            max={100}
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            className="ml-2"
          />
          {progress}
        </label>
        <label className="text-xs ml-4">
          datasets
          <input
            type="number"
            min={0}
            max={5}
            value={dsCount}
            onChange={(e) => setDsCount(Number(e.target.value))}
            className="ml-2 w-12 border rounded px-1"
          />
        </label>
      </div>

      <div className="flex-1 min-h-0 bg-muted/20">
        <AgentWorkflow
          phase={phase}
          progress={progress}
          usedDatasets={mockDatasets.slice(0, dsCount)}
          query="서울에서 아이 키우기 좋은 구는 어디야?"
        />
      </div>
    </div>
  );
}
