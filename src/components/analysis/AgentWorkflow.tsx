"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Check,
  X,
  FileText,
  Database as DatabaseIcon,
  Cpu,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { AnalysisPhase } from "@/hooks/useAnalysisSimulation";
import type { Dataset } from "@/data/datasets";

// ═══════════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════════

const PHASE_CONFIG: Record<
  string,
  { label: string; description: string; color: string; accent: string }
> = {
  intent: {
    label: "질문 해석",
    description: "질문의 의도와 범위를 파악하고 있어요",
    color: "#3B82F6",
    accent: "text-blue-600",
  },
  catalog: {
    label: "데이터 탐색",
    description: "공공데이터 카탈로그에서 관련 데이터를 찾고 있어요",
    color: "#10B981",
    accent: "text-emerald-600",
  },
  exploration: {
    label: "데이터 검증",
    description: "품질과 정합성을 확인하고 불필요한 데이터를 걸러내요",
    color: "#F59E0B",
    accent: "text-amber-600",
  },
  calculation: {
    label: "분석 수행",
    description: "지표를 결합해 점수를 계산하고 순위를 매기고 있어요",
    color: "#8B5CF6",
    accent: "text-violet-600",
  },
  result: {
    label: "결과 생성",
    description: "리포트를 구성하고 있어요",
    color: "#F43F5E",
    accent: "text-rose-600",
  },
};

// ═══════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════

function shadeHex(hex: string, factor: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const nr = Math.max(0, Math.min(255, Math.round(r * factor)));
  const ng = Math.max(0, Math.min(255, Math.round(g * factor)));
  const nb = Math.max(0, Math.min(255, Math.round(b * factor)));
  return `#${nr.toString(16).padStart(2, "0")}${ng
    .toString(16)
    .padStart(2, "0")}${nb.toString(16).padStart(2, "0")}`;
}

// ═══════════════════════════════════════════════════════════════════
// AGENT CHARACTER (jointed blocky character)
// ═══════════════════════════════════════════════════════════════════

type AgentStatus = "waiting" | "working" | "done";
type AgentId = "interpreter" | "scout" | "validator" | "analyst" | "reporter";

interface LimbAnim {
  rotate: number | number[];
}

interface CharAnim {
  legLeft: LimbAnim;
  legRight: LimbAnim;
  armLeft: LimbAnim;
  armRight: LimbAnim;
  head: { rotate: number | number[] };
  body: { y: number | number[] };
  duration: number;
}

function getCharAnim(agentId: AgentId, status: AgentStatus): CharAnim {
  if (status === "waiting") {
    return {
      legLeft: { rotate: 0 },
      legRight: { rotate: 0 },
      armLeft: { rotate: 2 },
      armRight: { rotate: -2 },
      head: { rotate: 0 },
      body: { y: [0, -0.6, 0] },
      duration: 3.2,
    };
  }
  if (status === "done") {
    return {
      legLeft: { rotate: 0 },
      legRight: { rotate: 0 },
      armLeft: { rotate: [2, -8, 2] },
      armRight: { rotate: [-2, 8, -2] },
      head: { rotate: [0, 3, 0, -3, 0] },
      body: { y: [0, -1.5, 0] },
      duration: 2.4,
    };
  }
  switch (agentId) {
    case "interpreter":
      return {
        legLeft: { rotate: 0 },
        legRight: { rotate: 0 },
        armLeft: { rotate: [-55, -45, -55] },
        armRight: { rotate: [55, 45, 55] },
        head: { rotate: [-4, 4, -4] },
        body: { y: [0, -1, 0] },
        duration: 2.0,
      };
    case "scout":
      return {
        legLeft: { rotate: [-30, 30, -30] },
        legRight: { rotate: [30, -30, 30] },
        armLeft: { rotate: [30, -30, 30] },
        armRight: { rotate: [-30, 30, -30] },
        head: { rotate: [-2, 2, -2] },
        body: { y: [0, -2, 0, -2, 0] },
        duration: 0.8,
      };
    case "validator":
      return {
        legLeft: { rotate: 0 },
        legRight: { rotate: 0 },
        armLeft: { rotate: -20 },
        armRight: { rotate: [10, -120, -120, 10, 10] },
        head: { rotate: [0, 0, -3, 0, 0] },
        body: { y: [0, 0, -1, 0, 0] },
        duration: 1.4,
      };
    case "analyst":
      return {
        legLeft: { rotate: 0 },
        legRight: { rotate: 0 },
        armLeft: { rotate: [-75, -90, -75, -95, -75] },
        armRight: { rotate: [75, 90, 75, 95, 75] },
        head: { rotate: [-1.5, 1.5, -1.5] },
        body: { y: [0, -0.8, 0] },
        duration: 0.5,
      };
    case "reporter":
      return {
        legLeft: { rotate: 0 },
        legRight: { rotate: 0 },
        armLeft: { rotate: -10 },
        armRight: { rotate: [20, -70, -70, 20, 20] },
        head: { rotate: [0, 5, 5, 0, 0] },
        body: { y: [0, -1.2, 0] },
        duration: 1.8,
      };
  }
}

function AgentCharacter({
  status,
  color,
  agentId,
}: {
  status: AgentStatus;
  color: string;
  agentId: AgentId;
}) {
  const anim = getCharAnim(agentId, status);

  const [blink, setBlink] = useState(false);
  useEffect(() => {
    const id = setInterval(
      () => {
        setBlink(true);
        setTimeout(() => setBlink(false), 110);
      },
      2600 + Math.random() * 1800
    );
    return () => clearInterval(id);
  }, []);

  const shirtColor = color;
  const pantsColor = shadeHex(color, 0.62);
  const skinColor = shadeHex(color, 1.25);

  const tx = {
    duration: anim.duration,
    repeat: Infinity,
    ease: "easeInOut" as const,
  };

  return (
    <div className="relative" style={{ width: 40, height: 52 }}>
      {/* Shadow */}
      <motion.div
        className="absolute rounded-full bg-black/18 blur-[1.5px]"
        style={{ width: 26, height: 4, left: 7, top: 47 }}
        animate={
          status === "working"
            ? { scaleX: [1, 0.85, 1, 0.9, 1], opacity: [0.25, 0.15, 0.25] }
            : { scaleX: [1, 0.97, 1], opacity: [0.2, 0.17, 0.2] }
        }
        transition={tx}
      />

      <motion.div className="absolute inset-0" animate={{ y: anim.body.y }} transition={tx}>
        {/* Legs */}
        <motion.div
          className="absolute rounded-b-[2px] rounded-t-[1px]"
          style={{
            left: 14,
            top: 30,
            width: 5,
            height: 13,
            backgroundColor: pantsColor,
            transformOrigin: "50% 0%",
            boxShadow: "inset -1px 0 0 rgba(0,0,0,0.15)",
          }}
          animate={{ rotate: anim.legLeft.rotate }}
          transition={tx}
        />
        <motion.div
          className="absolute rounded-b-[2px] rounded-t-[1px]"
          style={{
            left: 21,
            top: 30,
            width: 5,
            height: 13,
            backgroundColor: pantsColor,
            transformOrigin: "50% 0%",
            boxShadow: "inset -1px 0 0 rgba(0,0,0,0.18)",
          }}
          animate={{ rotate: anim.legRight.rotate }}
          transition={tx}
        />

        {/* Body */}
        <div
          className="absolute rounded-[3px]"
          style={{
            left: 13,
            top: 16,
            width: 14,
            height: 16,
            backgroundColor: shirtColor,
            boxShadow:
              "inset -1.5px 0 0 rgba(0,0,0,0.15), inset 1px 1px 0 rgba(255,255,255,0.25)",
          }}
        >
          <div
            className="absolute left-1/2 -translate-x-1/2 top-0 rounded-b-[2px]"
            style={{ width: 6, height: 2, backgroundColor: shadeHex(color, 0.75) }}
          />
        </div>

        {/* Arms */}
        <motion.div
          className="absolute rounded-[2px]"
          style={{
            left: 9,
            top: 17,
            width: 4,
            height: 14,
            backgroundColor: shirtColor,
            transformOrigin: "50% 2px",
            boxShadow: "inset 1px 0 0 rgba(255,255,255,0.2)",
          }}
          animate={{ rotate: anim.armLeft.rotate }}
          transition={tx}
        >
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full"
            style={{ width: 4, height: 4, backgroundColor: skinColor }}
          />
        </motion.div>
        <motion.div
          className="absolute rounded-[2px]"
          style={{
            left: 27,
            top: 17,
            width: 4,
            height: 14,
            backgroundColor: shirtColor,
            transformOrigin: "50% 2px",
            boxShadow: "inset -1px 0 0 rgba(0,0,0,0.18)",
          }}
          animate={{ rotate: anim.armRight.rotate }}
          transition={tx}
        >
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full"
            style={{ width: 4, height: 4, backgroundColor: skinColor }}
          />
        </motion.div>

        {/* Head */}
        <motion.div
          className="absolute rounded-[4px] border border-white/50"
          style={{
            left: 12,
            top: 0,
            width: 16,
            height: 16,
            backgroundColor: skinColor,
            transformOrigin: "50% 100%",
            boxShadow:
              "inset -1.5px -1px 0 rgba(0,0,0,0.12), inset 1px 1px 0 rgba(255,255,255,0.35), 0 1px 2px rgba(0,0,0,0.1)",
          }}
          animate={{ rotate: anim.head.rotate }}
          transition={tx}
        >
          {/* Hair cap */}
          <div
            className="absolute top-0 left-0 right-0 rounded-t-[3px]"
            style={{ height: 4, backgroundColor: shadeHex(color, 0.55) }}
          />
          {/* Eyes */}
          <div className="absolute flex gap-[4px]" style={{ top: 6, left: 3 }}>
            <motion.div
              className="bg-[#1f2937] rounded-sm"
              animate={{ scaleY: blink ? 0.1 : 1 }}
              transition={{ duration: 0.08 }}
              style={{ width: 2.5, height: 2.5 }}
            />
            <motion.div
              className="bg-[#1f2937] rounded-sm"
              animate={{ scaleY: blink ? 0.1 : 1 }}
              transition={{ duration: 0.08 }}
              style={{ width: 2.5, height: 2.5 }}
            />
          </div>
          {/* Mouth */}
          {status === "done" ? (
            <svg width="8" height="4" className="absolute" style={{ top: 11, left: 4 }}>
              <path
                d="M 0.5 0.5 Q 4 3.5 7.5 0.5"
                stroke="#1f2937"
                strokeWidth="1"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          ) : status === "working" ? (
            <motion.div
              className="absolute rounded-full bg-[#1f2937]"
              style={{ top: 11, left: 7, width: 2, height: 2 }}
              animate={{ scale: [1, 0.6, 1] }}
              transition={{ duration: 0.7, repeat: Infinity }}
            />
          ) : (
            <div
              className="absolute bg-[#1f2937] rounded-full"
              style={{ top: 11.5, left: 6, width: 4, height: 1 }}
            />
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// SCENE 1 — QUEST CARD MATERIALIZES
// ═══════════════════════════════════════════════════════════════════

function QuestScene({ query }: { query: string }) {
  const [keywords, setKeywords] = useState<string[]>([]);
  const allKeywords = ["지역 범위", "분석 대상", "핵심 지표"];

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    allKeywords.forEach((k, i) => {
      timers.push(
        setTimeout(() => setKeywords((p) => [...p, k]), 1100 + i * 450)
      );
    });
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Client-only random particles (avoid hydration mismatch)
  const [particles, setParticles] = useState<
    Array<{ id: number; angle: number; dist: number; delay: number }>
  >([]);
  useEffect(() => {
    setParticles(
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        angle: (i / 14) * Math.PI * 2,
        dist: 80 + Math.random() * 40,
        delay: Math.random() * 0.6,
      }))
    );
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* Converging particles into card */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute h-1.5 w-1.5 rounded-full bg-blue-400"
          initial={{
            x: Math.cos(p.angle) * p.dist,
            y: Math.sin(p.angle) * p.dist,
            opacity: 0,
          }}
          animate={{ x: 0, y: 0, opacity: [0, 1, 0] }}
          transition={{
            duration: 1.2,
            delay: p.delay,
            ease: "easeIn",
          }}
        />
      ))}

      {/* Quest card */}
      <motion.div
        className="relative z-10"
        initial={{ scale: 0.2, opacity: 0, rotateX: -40, y: 20 }}
        animate={{ scale: 1, opacity: 1, rotateX: 0, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: -20 }}
        transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.3 }}
      >
        {/* Glow halo */}
        <motion.div
          className="absolute -inset-4 rounded-3xl bg-blue-400/25 blur-2xl"
          animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />

        {/* Card body */}
        <div className="relative rounded-2xl bg-white border-2 border-blue-100 shadow-[0_20px_60px_-15px_rgba(59,130,246,0.35)] p-5 w-[300px]">
          <div className="flex items-center gap-2 mb-2.5">
            <motion.div
              className="h-1.5 w-1.5 rounded-full bg-blue-500"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-blue-600">
              Incoming quest
            </span>
            <FileText className="h-3 w-3 text-blue-400 ml-auto" />
          </div>

          <p className="text-sm font-semibold text-foreground leading-relaxed line-clamp-2">
            &ldquo;{query || "분석 요청"}&rdquo;
          </p>

          {/* Extracted tag chips */}
          <div className="mt-3 flex flex-wrap gap-1 min-h-[22px]">
            <AnimatePresence>
              {keywords.map((k) => (
                <motion.span
                  key={k}
                  initial={{ scale: 0, y: 12, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 280, damping: 16 }}
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200"
                >
                  {k}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Interpreter agent below card, reading */}
      <motion.div
        className="absolute"
        initial={{ x: -60, y: 120, opacity: 0 }}
        animate={{ x: -100, y: 100, opacity: 1 }}
        transition={{ type: "spring", stiffness: 80, delay: 0.9, damping: 14 }}
      >
        <AgentCharacter status="working" color="#3B82F6" agentId="interpreter" />
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// SCENE 2 — CATALOG EXPLORATION
// ═══════════════════════════════════════════════════════════════════

function CatalogScene({ datasets }: { datasets: Dataset[] }) {
  // Fallback datasets for animation even if not yet populated
  const displayDs =
    datasets.length > 0
      ? datasets.slice(0, 5)
      : [
          { id: "d1", title: "서울시 인구 데이터" },
          { id: "d2", title: "생활 편의시설" },
          { id: "d3", title: "대중교통 이용" },
          { id: "d4", title: "주거 환경" },
          { id: "d5", title: "안전 지수" },
        ];

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* LEFT: Archive / catalog rack */}
      <motion.div
        className="absolute left-[8%] top-1/2 -translate-y-1/2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="relative">
          <div className="flex items-center gap-1.5 mb-2">
            <DatabaseIcon className="h-3 w-3 text-emerald-600" />
            <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700">
              Catalog
            </span>
          </div>
          {/* Archive shelves */}
          {[0, 1, 2].map((row) => (
            <div key={row} className="flex gap-1 mb-1">
              {[0, 1, 2, 3, 4].map((col) => (
                <motion.div
                  key={`${row}-${col}`}
                  className="rounded-[2px] border border-emerald-300"
                  style={{
                    width: 10,
                    height: 14,
                    backgroundColor: `hsl(${150 + col * 4}, 60%, ${80 + row * 3}%)`,
                  }}
                  animate={{
                    opacity: [0.4, 1, 0.4],
                    y: [0, -1, 0],
                  }}
                  transition={{
                    duration: 2.2,
                    delay: (row * 5 + col) * 0.12,
                    repeat: Infinity,
                  }}
                />
              ))}
            </div>
          ))}
          {/* Platform base */}
          <div className="mt-1 h-1 rounded-full bg-emerald-200/60 blur-[1px]" />
        </div>
      </motion.div>

      {/* CENTER: Scout agent walking */}
      <motion.div
        className="absolute"
        style={{ left: "50%", top: "50%", marginLeft: -20, marginTop: -26 }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
      >
        <AgentCharacter status="working" color="#10B981" agentId="scout" />
      </motion.div>

      {/* Flying data packet cards from catalog → scout */}
      {displayDs.map((ds, i) => (
        <motion.div
          key={ds.id}
          className="absolute z-20"
          style={{ left: "18%", top: "50%" }}
          initial={{
            x: 0,
            y: -20,
            opacity: 0,
            scale: 0.4,
            rotate: -15,
          }}
          animate={{
            x: [0, 120, 230],
            y: [-20 + i * 8, -50 - i * 3, 5 + i * 4 - 20],
            opacity: [0, 1, 1, 0.9],
            scale: [0.4, 1, 1, 0.95],
            rotate: [-15, 5, 0],
          }}
          transition={{
            duration: 2.4,
            delay: 0.8 + i * 0.35,
            ease: [0.4, 0, 0.2, 1],
            repeat: Infinity,
            repeatDelay: 1,
          }}
        >
          <div className="rounded-lg bg-white border border-emerald-200 shadow-md px-2.5 py-1.5 whitespace-nowrap">
            <div className="flex items-center gap-1.5">
              <div className="h-1 w-1 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-semibold text-emerald-800">
                {ds.title}
              </span>
            </div>
          </div>
        </motion.div>
      ))}

      {/* RIGHT: Collected packets stacking up */}
      <div className="absolute right-[10%] top-1/2 -translate-y-1/2 flex flex-col gap-1.5 items-end">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700">
            Collected
          </span>
          <Sparkles className="h-3 w-3 text-emerald-500" />
        </div>
        {displayDs.slice(0, 3).map((ds, i) => (
          <motion.div
            key={ds.id}
            initial={{ opacity: 0, x: 30, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{
              delay: 1.5 + i * 0.5,
              type: "spring",
              stiffness: 200,
            }}
            className="rounded-lg bg-emerald-50 border border-emerald-300 shadow-sm px-2.5 py-1"
          >
            <span className="text-[10px] font-semibold text-emerald-800 whitespace-nowrap">
              {ds.title}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// SCENE 3 — VALIDATION / REFINEMENT
// ═══════════════════════════════════════════════════════════════════

function ValidateScene({ datasets }: { datasets: Dataset[] }) {
  const displayDs =
    datasets.length > 0
      ? datasets.slice(0, 4)
      : [
          { id: "v1", title: "데이터셋 A" },
          { id: "v2", title: "데이터셋 B" },
          { id: "v3", title: "데이터셋 C" },
          { id: "v4", title: "데이터셋 D" },
        ];

  // Belt is 80% wide (10% to 90% of container). Packets use CSS animations
  // bound to this belt container so `left: 0%` / `left: 100%` are belt-relative.
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* Conveyor belt container (defines 0%-100% coordinate system) */}
      <div className="absolute left-[10%] right-[10%] top-1/2 -translate-y-1/2 h-20">
        {/* Belt track */}
        <div className="relative h-full rounded-xl border-2 border-amber-200 bg-amber-50/50 overflow-visible">
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-amber-300/60" />
          <div className="absolute top-2 left-3 text-[9px] font-bold uppercase tracking-wider text-amber-700">
            Validation belt
          </div>
          {/* Rolling marker to suggest belt motion */}
          <div
            className="absolute top-1/2 -translate-y-1/2 h-[3px] w-10 bg-amber-400/80 rounded-full"
            style={{
              animation: "beltMarker 1.8s linear infinite",
            }}
          />
        </div>

        {/* Data packets flowing ON the belt (belt-relative positioning) */}
        {displayDs.map((ds, i) => {
          const isApproved = i !== 2;
          const delay = `${0.3 + i * 1.1}s`;
          const animName = isApproved ? "beltPacketFlow" : "beltPacketReject";
          return (
            <div
              key={ds.id}
              className="absolute top-1/2 z-20 -translate-x-1/2"
              style={{
                animation: `${animName} 4.2s ease-in-out ${delay} infinite`,
              }}
            >
              <div
                className={`relative rounded-lg border shadow-md px-2.5 py-1.5 whitespace-nowrap ${
                  isApproved
                    ? "bg-white border-amber-200"
                    : "bg-red-50 border-red-300"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <div
                    className={`h-1 w-1 rounded-full ${
                      isApproved ? "bg-amber-500" : "bg-red-500"
                    }`}
                  />
                  <span
                    className={`text-[10px] font-semibold ${
                      isApproved ? "text-amber-900" : "text-red-700"
                    }`}
                  >
                    {ds.title}
                  </span>
                </div>

                {/* Stamp overlay */}
                <div
                  className="absolute -top-1.5 -right-1.5"
                  style={{
                    animation: `stampPop 4.2s ease-out ${delay} infinite`,
                  }}
                >
                  <div
                    className={`h-4 w-4 rounded-full flex items-center justify-center shadow-md ${
                      isApproved ? "bg-emerald-500" : "bg-red-500"
                    }`}
                  >
                    {isApproved ? (
                      <Check className="h-3 w-3 text-white" strokeWidth={3} />
                    ) : (
                      <X className="h-3 w-3 text-white" strokeWidth={3} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Validator agent hovering above the belt with stamp */}
      <div
        className="absolute"
        style={{
          right: "15%",
          top: "28%",
          animation: "validatorBreathe 2s ease-in-out infinite",
        }}
      >
        <AgentCharacter status="working" color="#F59E0B" agentId="validator" />
      </div>

      {/* Scene caption */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center">
        <div className="text-xs font-semibold text-amber-900 uppercase tracking-widest mb-1">
          Data Quality Gate
        </div>
        <div className="text-[11px] text-amber-700/80">
          {displayDs.length}개 데이터셋 중 품질 검증 중…
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// SCENE 4 — COMPUTE ORB (THE WOW MOMENT)
// ═══════════════════════════════════════════════════════════════════

function ComputeScene({ datasets }: { datasets: Dataset[] }) {
  const symbols = ["σ", "∑", "μ", "π", "λ", "R²", "w₁", "x̄"];

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {/* Radial background wash */}
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 45%, rgba(139,92,246,0.12) 0%, rgba(139,92,246,0.02) 40%, transparent 70%)",
        }}
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Grid pattern faintly */}
      <svg className="absolute inset-0 opacity-[0.06]" width="100%" height="100%">
        <defs>
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#8B5CF6" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* CENTER CORE */}
      <div className="relative flex items-center justify-center">
        {/* Outermost pulse ring */}
        <motion.div
          className="absolute rounded-full border-2 border-violet-400/40"
          style={{ width: 180, height: 180 }}
          animate={{ scale: [0.9, 1.2, 0.9], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2.2, repeat: Infinity }}
        />
        <motion.div
          className="absolute rounded-full border-2 border-violet-400/30"
          style={{ width: 160, height: 160 }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2.2, delay: 0.7, repeat: Infinity }}
        />

        {/* Large outer rotating ring with orbital nodes */}
        <motion.div
          className="absolute rounded-full border border-violet-300/60"
          style={{ width: 140, height: 140 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-violet-600 shadow-lg shadow-violet-500/50" />
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-violet-400" />
          <div className="absolute top-1/2 -right-1 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-violet-500" />
        </motion.div>

        {/* Inner dashed ring, counter rotation */}
        <motion.div
          className="absolute rounded-full border border-dashed border-violet-400/70"
          style={{ width: 110, height: 110 }}
          animate={{ rotate: -360 }}
          transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-violet-500" />
          <div className="absolute top-1/2 -left-1 -translate-y-1/2 h-1 w-1 rounded-full bg-violet-400" />
        </motion.div>

        {/* Core orb */}
        <motion.div
          className="relative rounded-full flex items-center justify-center"
          style={{
            width: 76,
            height: 76,
            background:
              "radial-gradient(circle at 35% 30%, #c4b5fd 0%, #8b5cf6 50%, #6d28d9 100%)",
          }}
          animate={{
            scale: [1, 1.07, 1, 1.04, 1],
            boxShadow: [
              "0 0 40px 10px rgba(139,92,246,0.3)",
              "0 0 70px 20px rgba(139,92,246,0.55)",
              "0 0 40px 10px rgba(139,92,246,0.3)",
            ],
          }}
          transition={{ duration: 1.4, repeat: Infinity }}
        >
          {/* Inner highlight */}
          <div
            className="absolute rounded-full bg-white/30 blur-sm"
            style={{ width: 20, height: 14, top: 14, left: 18 }}
          />
          {/* CPU icon pulse */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.85, 1, 0.85] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            <Cpu className="h-6 w-6 text-white" strokeWidth={2.5} />
          </motion.div>
        </motion.div>

        {/* Floating formula symbols around core */}
        {symbols.map((sym, i) => {
          const angle = (i / symbols.length) * Math.PI * 2;
          const radius = 100;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          return (
            <motion.div
              key={i}
              className="absolute font-mono font-bold text-violet-500/70 text-base"
              style={{ left: x, top: y }}
              animate={{
                opacity: [0, 0.9, 0],
                scale: [0.6, 1.1, 0.6],
                y: [y, y - 12, y - 24],
              }}
              transition={{
                duration: 2.6,
                delay: i * 0.28,
                repeat: Infinity,
                ease: "easeOut",
              }}
            >
              {sym}
            </motion.div>
          );
        })}

        {/* Energy sparks shooting out */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const angle = (i / 6) * Math.PI * 2 + 0.5;
          const dist = 75;
          return (
            <motion.div
              key={i}
              className="absolute h-1 w-1 rounded-full bg-violet-400"
              style={{ left: 0, top: 0 }}
              animate={{
                x: [0, Math.cos(angle) * dist],
                y: [0, Math.sin(angle) * dist],
                opacity: [1, 0],
                scale: [1.5, 0],
              }}
              transition={{
                duration: 1.1,
                delay: i * 0.18,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          );
        })}
      </div>

      {/* Data packets being consumed by orb */}
      {datasets.slice(0, 3).map((ds, i) => {
        const angle = (i / 3) * Math.PI * 2 - Math.PI / 2;
        const startRadius = 220;
        return (
          <motion.div
            key={ds.id}
            className="absolute z-10"
            style={{
              left: "50%",
              top: "50%",
              marginLeft: -50,
            }}
            initial={{
              x: Math.cos(angle) * startRadius,
              y: Math.sin(angle) * startRadius - 20,
              opacity: 0,
              scale: 0.8,
            }}
            animate={{
              x: [Math.cos(angle) * startRadius, 0],
              y: [Math.sin(angle) * startRadius - 20, -20],
              opacity: [0, 1, 1, 0],
              scale: [0.8, 1, 0.6, 0],
            }}
            transition={{
              duration: 2,
              delay: 0.5 + i * 0.6,
              ease: [0.4, 0, 0.2, 1],
              repeat: Infinity,
              repeatDelay: 1.5,
            }}
          >
            <div className="rounded-md bg-white border border-violet-200 shadow-md px-2 py-1 whitespace-nowrap">
              <span className="text-[9px] font-medium text-violet-700">
                {ds.title}
              </span>
            </div>
          </motion.div>
        );
      })}

      {/* Analyst at terminal (bottom) */}
      <motion.div
        className="absolute"
        style={{ bottom: 20, left: "50%", marginLeft: -20 }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, type: "spring" }}
      >
        <AgentCharacter status="working" color="#8B5CF6" agentId="analyst" />
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// AMBIENT BACKGROUND
// ═══════════════════════════════════════════════════════════════════

function AmbientParticles() {
  // Client-only to avoid hydration mismatch from Math.random
  const [particles, setParticles] = useState<
    Array<{
      id: number;
      x: number;
      y: number;
      size: number;
      delay: number;
      duration: number;
    }>
  >([]);
  useEffect(() => {
    setParticles(
      Array.from({ length: 10 }, (_, i) => ({
        id: i,
        x: 5 + Math.random() * 90,
        y: 10 + Math.random() * 80,
        size: 1.5 + Math.random() * 2,
        delay: Math.random() * 5,
        duration: 5 + Math.random() * 4,
      }))
    );
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-primary/10"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{ y: [0, -18, 0], opacity: [0, 0.5, 0] }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════

interface AgentWorkflowProps {
  phase: AnalysisPhase;
  progress: number;
  usedDatasets: Dataset[];
  query: string;
}

export function AgentWorkflow({
  phase,
  progress,
  usedDatasets,
  query,
}: AgentWorkflowProps) {
  if (phase === "idle" || phase === "no-match") return null;

  const config = PHASE_CONFIG[phase] || PHASE_CONFIG.intent;
  const phaseIdx =
    ["intent", "catalog", "exploration", "calculation", "result"].indexOf(phase) + 1;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gradient-to-br from-slate-50/40 via-white to-slate-50/40">
      {/* Top status bar */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between shrink-0">
        {/* Plain div re-mounted via key; avoids AnimatePresence mode="wait" bug */}
        <div
          key={phase}
          className="flex items-center gap-2.5 animate-[phaseFadeIn_0.3s_ease-out]"
        >
          <motion.div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: config.color }}
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className={`text-sm font-semibold ${config.accent}`}>
            {config.label}
          </span>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {config.description}
          </span>
        </div>

        <span className="text-[11px] text-muted-foreground/50 tabular-nums">
          {phaseIdx}/5
        </span>
      </div>

      {/* Progress bar */}
      <div className="px-5 pb-3 shrink-0">
        <div className="relative h-1 rounded-full bg-border/25 overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              background: `linear-gradient(90deg, #3B82F690, ${config.color})`,
            }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
          <motion.div
            className="absolute inset-y-0 w-8 bg-gradient-to-r from-transparent via-white/40 to-transparent"
            animate={{ left: ["-5%", "105%"] }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              repeatDelay: 0.5,
            }}
          />
        </div>
      </div>

      {/* Scene stage */}
      <div className="relative flex-1 min-h-0">
        <AmbientParticles />

        {/*
          NOTE: We intentionally do NOT wrap scenes in AnimatePresence.
          AnimatePresence mode="wait" combined with children that use
          repeat: Infinity can leave the incoming scene's motion wrapper
          stuck at its initial opacity: 0 state (observed bug: exploration
          scene rendered blank). Each scene is mounted fresh with a key
          and fades itself in internally.
        */}
        <div key={`scene-${phase}`} className="absolute inset-0">
          {phase === "intent" && <QuestScene query={query} />}
          {phase === "catalog" && <CatalogScene datasets={usedDatasets} />}
          {phase === "exploration" && (
            <ValidateScene datasets={usedDatasets} />
          )}
          {phase === "calculation" && (
            <ComputeScene datasets={usedDatasets} />
          )}
        </div>
      </div>

      {/* Datasets footer */}
      <AnimatePresence>
        {usedDatasets.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="px-5 py-3 border-t bg-white/40 backdrop-blur-sm flex items-center gap-2 flex-wrap shrink-0"
          >
            <span className="text-[10px] font-medium text-muted-foreground/50 shrink-0">
              데이터
            </span>
            {usedDatasets.slice(0, 3).map((ds, i) => (
              <motion.div
                key={ds.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06 }}
              >
                <Badge
                  variant="secondary"
                  className="text-[10px] font-normal bg-white/70 border shadow-sm"
                >
                  {ds.title}
                </Badge>
              </motion.div>
            ))}
            {usedDatasets.length > 3 && (
              <span className="text-[10px] text-muted-foreground/40">
                +{usedDatasets.length - 3}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
