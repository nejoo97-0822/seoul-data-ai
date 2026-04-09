"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Loader2, Layers } from "lucide-react";
import { scenarios } from "@/data/scenarios";

const SeoulMap = dynamic(() => import("@/components/map/SeoulMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  ),
});

export default function MapPage() {
  const [activeScenario, setActiveScenario] = useState("childcare");

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col">
      {/* Controls */}
      <div className="border-b bg-white px-4 py-3 sm:px-6">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">지표 선택</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {scenarios.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveScenario(s.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeScenario === s.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <span className="mr-1">{s.icon}</span>
                {s.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1">
        <SeoulMap activeScenario={activeScenario} />
      </div>
    </div>
  );
}
