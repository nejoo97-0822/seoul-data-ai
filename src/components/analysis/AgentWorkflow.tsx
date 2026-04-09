"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Database,
  ShieldCheck,
  Calculator,
  FileBarChart,
  CheckCircle2,
  Hash,
  MapPin,
  FileCheck,
  Sigma,
  BarChart2,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { AnalysisPhase } from "@/hooks/useAnalysisSimulation";
import type { Dataset } from "@/data/datasets";

// ─── Types & constants ──────────────────────────────────────────────

const PHASE_ORDER: AnalysisPhase[] = [
  "intent",
  "catalog",
  "exploration",
  "calculation",
  "result",
];

// Station positions as % of canvas (stable layout, arc-ish)
const STATION_POSITIONS: { x: number; y: number }[] = [
  { x: 14, y: 38 },
  { x: 32, y: 62 },
  { x: 50, y: 34 },
  { x: 68, y: 62 },
  { x: 86, y: 38 },
];

interface StationDef {
  id: string;
  phase: AnalysisPhase;
  name: string;      // agent name
  role: string;      // what they do
  description: string;
  icon: typeof Search;
  microIcons: (typeof Hash)[];  // small icons that pop during work
  color: string;     // hex
  colorSoft: string; // lighter bg tint
  accentTw: string;
  bgTw: string;
  borderTw: string;
}

const STATIONS: StationDef[] = [
  {
    id: "interpreter",
    phase: "intent",
    name: "해석가",
    role: "질문 해석",
    description: "키워드와 의도를 파악해요",
    icon: Search,
    microIcons: [Hash, MapPin, Search],
    color: "#3B82F6",
    colorSoft: "#DBEAFE",
    accentTw: "text-blue-600",
    bgTw: "bg-blue-50",
    borderTw: "border-blue-200",
  },
  {
    id: "scout",
    phase: "catalog",
    name: "탐색가",
    role: "데이터 탐색",
    description: "공공데이터셋을 찾아와요",
    icon: Database,
    microIcons: [Database, Database, Database],
    color: "#10B981",
    colorSoft: "#D1FAE5",
    accentTw: "text-emerald-600",
    bgTw: "bg-emerald-50",
    borderTw: "border-emerald-200",
  },
  {
    id: "validator",
    phase: "exploration",
    name: "검증가",
    role: "데이터 검증",
    description: "품질과 정합성을 확인해요",
    icon: ShieldCheck,
    microIcons: [FileCheck, ShieldCheck, CheckCircle2],
    color: "#F59E0B",
    colorSoft: "#FEF3C7",
    accentTw: "text-amber-600",
    bgTw: "bg-amber-50",
    borderTw: "border-amber-200",
  },
  {
    id: "analyst",
    phase: "calculation",
    name: "분석가",
    role: "분석 수행",
    description: "점수와 순위를 계산해요",
    icon: Calculator,
    microIcons: [Sigma, Calculator, Hash],
    color: "#8B5CF6",
    colorSoft: "#EDE9FE",
    accentTw: "text-violet-600",
    bgTw: "bg-violet-50",
    borderTw: "border-violet-200",
  },
  {
    id: "reporter",
    phase: "result",
    name: "리포터",
    role: "결과 생성",
    description: "차트와 리포트를 완성해요",
    icon: FileBarChart,
    microIcons: [BarChart2, FileBarChart, Sparkles],
    color: "#F43F5E",
    colorSoft: "#FFE4E6",
    accentTw: "text-rose-600",
    bgTw: "bg-rose-50",
    borderTw: "border-rose-200",
  },
];

type AgentStatus = "waiting" | "working" | "done";

// ─── SVG curved connection paths ────────────────────────────────────

function ConnectionPaths({
  currentIdx,
  canvasW,
  canvasH,
}: {
  currentIdx: number;
  canvasW: number;
  canvasH: number;
}) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
      <defs>
        <filter id="path-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {STATION_POSITIONS.slice(0, -1).map((from, i) => {
        const to = STATION_POSITIONS[i + 1];
        const x1 = (from.x / 100) * canvasW;
        const y1 = (from.y / 100) * canvasH;
        const x2 = (to.x / 100) * canvasW;
        const y2 = (to.y / 100) * canvasH;
        const midX = (x1 + x2) / 2;
        const midY = Math.min(y1, y2) - 25;

        const isDone = i < currentIdx;

        return (
          <g key={i}>
            <path
              d={`M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`}
              fill="none"
              stroke={isDone ? STATIONS[i + 1].color : "#CBD5E1"}
              strokeWidth={isDone ? 2 : 1.5}
              strokeDasharray={isDone ? "none" : "5 5"}
              opacity={isDone ? 0.45 : 0.3}
              strokeLinecap="round"
            />
            {isDone && (
              <path
                d={`M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`}
                fill="none"
                stroke={STATIONS[i + 1].color}
                strokeWidth={4}
                opacity={0.12}
                filter="url(#path-glow)"
                strokeLinecap="round"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ─── Handoff Packet — a "data crystal" that flies between stations ──

function HandoffPacket({
  fromIdx,
  toIdx,
  color,
  canvasW,
  canvasH,
  onArrive,
}: {
  fromIdx: number;
  toIdx: number;
  color: string;
  canvasW: number;
  canvasH: number;
  onArrive?: () => void;
}) {
  const from = STATION_POSITIONS[fromIdx];
  const to = STATION_POSITIONS[toIdx];
  const x1 = (from.x / 100) * canvasW;
  const y1 = (from.y / 100) * canvasH;
  const x2 = (to.x / 100) * canvasW;
  const y2 = (to.y / 100) * canvasH;
  const midX = (x1 + x2) / 2;
  const midY = Math.min(y1, y2) - 35;

  // Build 10 sample points along quadratic bezier for the trajectory
  const samples = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    for (let t = 0; t <= 1; t += 0.08) {
      const x = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * midX + t * t * x2;
      const y = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * midY + t * t * y2;
      pts.push({ x, y });
    }
    return pts;
  }, [x1, y1, x2, y2, midX, midY]);

  useEffect(() => {
    const t = setTimeout(() => onArrive?.(), 1250);
    return () => clearTimeout(t);
  }, [onArrive]);

  return (
    <>
      {/* Trail dots */}
      {samples.map((pt, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: pt.x,
            top: pt.y,
            backgroundColor: color,
            marginLeft: -2,
            marginTop: -2,
            width: 4,
            height: 4,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 0.6, 0], scale: [0, 1, 0] }}
          transition={{
            duration: 0.9,
            delay: i * 0.05,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Main crystal */}
      <motion.div
        className="absolute pointer-events-none z-30"
        initial={{
          left: x1,
          top: y1,
          opacity: 0,
          scale: 0.2,
          rotate: 0,
        }}
        animate={{
          left: [x1, midX, x2],
          top: [y1, midY, y2],
          opacity: [0, 1, 1, 0],
          scale: [0.2, 1.3, 1.1, 0.3],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 1.25,
          ease: [0.4, 0, 0.2, 1],
          times: [0, 0.2, 0.85, 1],
        }}
        style={{ marginLeft: -8, marginTop: -8 }}
      >
        <div className="relative">
          <div
            className="h-4 w-4 rotate-45 rounded-sm shadow-lg"
            style={{
              backgroundColor: color,
              boxShadow: `0 0 16px ${color}`,
            }}
          />
          <motion.div
            className="absolute inset-0 rotate-45 rounded-sm"
            style={{ backgroundColor: color }}
            animate={{ scale: [1, 2, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </>
  );
}

// ─── Burst effect when packet arrives ───────────────────────────────

function ArrivalBurst({
  x,
  y,
  color,
}: {
  x: number;
  y: number;
  color: string;
}) {
  return (
    <div
      className="absolute pointer-events-none z-20"
      style={{ left: x, top: y, marginLeft: -30, marginTop: -30 }}
    >
      {/* Expanding ring */}
      <motion.div
        className="absolute inset-0 w-[60px] h-[60px] rounded-full border-2"
        style={{ borderColor: color }}
        initial={{ scale: 0.3, opacity: 0.8 }}
        animate={{ scale: 2.2, opacity: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
      <motion.div
        className="absolute inset-0 w-[60px] h-[60px] rounded-full border-2"
        style={{ borderColor: color }}
        initial={{ scale: 0.3, opacity: 0.6 }}
        animate={{ scale: 1.7, opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
      />

      {/* Sparkle particles */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const angle = (i / 8) * Math.PI * 2;
        const dx = Math.cos(angle) * 40;
        const dy = Math.sin(angle) * 40;
        return (
          <motion.div
            key={i}
            className="absolute top-[30px] left-[30px] h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: color }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: dx, y: dy, opacity: 0, scale: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
        );
      })}
    </div>
  );
}

// ─── Agent Character — jointed block character with limbs ──────────

// Darken a hex color by multiplying each channel
function shadeHex(hex: string, factor: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const nr = Math.max(0, Math.min(255, Math.round(r * factor)));
  const ng = Math.max(0, Math.min(255, Math.round(g * factor)));
  const nb = Math.max(0, Math.min(255, Math.round(b * factor)));
  return `#${nr.toString(16).padStart(2, "0")}${ng.toString(16).padStart(2, "0")}${nb.toString(16).padStart(2, "0")}`;
}

interface LimbAnim {
  rotate: number | number[];
  y?: number | number[];
}

interface CharAnim {
  legLeft: LimbAnim;
  legRight: LimbAnim;
  armLeft: LimbAnim;
  armRight: LimbAnim;
  head: { rotate: number | number[] };
  body: { y: number | number[]; rotate?: number | number[] };
  duration: number;
}

function getCharAnim(agentId: string, status: AgentStatus): CharAnim {
  // Idle — subtle breathing
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

  // Done — satisfied sway
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

  // Working — varies by agent role
  switch (agentId) {
    case "interpreter":
      // Reading / thinking — head tilts, both arms hold up as if reading paper
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
      // Walking cycle — legs and arms swing alternating
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
      // Stamping — right arm raises high then slams down
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
      // Typing / calculating — both arms bob rapidly
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
      // Presenting — right arm sweeps outward in a grand gesture
      return {
        legLeft: { rotate: 0 },
        legRight: { rotate: 0 },
        armLeft: { rotate: -10 },
        armRight: { rotate: [20, -70, -70, 20, 20] },
        head: { rotate: [0, 5, 5, 0, 0] },
        body: { y: [0, -1.2, 0] },
        duration: 1.8,
      };

    default:
      return {
        legLeft: { rotate: 0 },
        legRight: { rotate: 0 },
        armLeft: { rotate: 0 },
        armRight: { rotate: 0 },
        head: { rotate: 0 },
        body: { y: 0 },
        duration: 2,
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
  agentId: string;
}) {
  const isWorking = status === "working";
  const isDone = status === "done";
  const anim = getCharAnim(agentId, status);

  // Blink periodically
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

  // Derived colors
  const shirtColor = color;
  const pantsColor = shadeHex(color, 0.62);
  const skinColor = shadeHex(color, 1.25);

  const tx = {
    duration: anim.duration,
    repeat: Infinity,
    ease: "easeInOut" as const,
  };

  // Character bounding box: 40 wide × 52 tall
  // Head: 16×16 at (12, 0)
  // Body: 14×16 at (13, 16)
  // Arms: 4×14 from (9,18) and (27,18), origin top-center
  // Legs: 5×13 from (14,30) and (21,30), origin top-center

  return (
    <div className="relative" style={{ width: 40, height: 52 }}>
      {/* Shadow on ground */}
      <motion.div
        className="absolute rounded-full bg-black/18 blur-[1.5px]"
        style={{
          width: 26,
          height: 4,
          left: 7,
          top: 47,
        }}
        animate={
          isWorking
            ? { scaleX: [1, 0.85, 1, 0.9, 1], opacity: [0.25, 0.15, 0.25] }
            : { scaleX: [1, 0.97, 1], opacity: [0.2, 0.17, 0.2] }
        }
        transition={tx}
      />

      {/* Whole body bob */}
      <motion.div
        className="absolute inset-0"
        animate={{ y: anim.body.y }}
        transition={tx}
      >
        {/* LEFT LEG */}
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

        {/* RIGHT LEG */}
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

        {/* BODY (torso/shirt) */}
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
          {/* Collar detail */}
          <div
            className="absolute left-1/2 -translate-x-1/2 top-0 rounded-b-[2px]"
            style={{
              width: 6,
              height: 2,
              backgroundColor: shadeHex(color, 0.75),
            }}
          />
        </div>

        {/* LEFT ARM */}
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
          {/* Hand */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full"
            style={{
              width: 4,
              height: 4,
              backgroundColor: skinColor,
            }}
          />
        </motion.div>

        {/* RIGHT ARM */}
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
          {/* Hand */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full"
            style={{
              width: 4,
              height: 4,
              backgroundColor: skinColor,
            }}
          />
        </motion.div>

        {/* HEAD */}
        <motion.div
          className="absolute rounded-[4px] border border-white/50 shadow-sm"
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
          {/* Hair cap (top band in shirt color) */}
          <div
            className="absolute top-0 left-0 right-0 rounded-t-[3px]"
            style={{
              height: 4,
              backgroundColor: shadeHex(color, 0.55),
            }}
          />

          {/* Eyes */}
          <div
            className="absolute flex gap-[4px]"
            style={{ top: 6, left: 3 }}
          >
            <motion.div
              className="bg-[#1f2937] rounded-sm"
              animate={{ scaleY: blink ? 0.1 : 1 }}
              transition={{ duration: 0.08 }}
              style={{ width: 2.5, height: 2.5, transformOrigin: "center" }}
            />
            <motion.div
              className="bg-[#1f2937] rounded-sm"
              animate={{ scaleY: blink ? 0.1 : 1 }}
              transition={{ duration: 0.08 }}
              style={{ width: 2.5, height: 2.5, transformOrigin: "center" }}
            />
          </div>

          {/* Mouth */}
          {isDone ? (
            <svg
              width="8"
              height="4"
              className="absolute"
              style={{ top: 11, left: 4 }}
            >
              <path
                d="M 0.5 0.5 Q 4 3.5 7.5 0.5"
                stroke="#1f2937"
                strokeWidth="1"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          ) : isWorking ? (
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

      {/* Thought / sweat indicator above head when working hard */}
      {isWorking && (agentId === "analyst" || agentId === "validator") && (
        <motion.div
          className="absolute"
          style={{ top: -2, left: 28 }}
          animate={{
            y: [0, -4, 0],
            opacity: [0, 1, 0],
          }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
        >
          <div
            className="rounded-full"
            style={{
              width: 3,
              height: 5,
              backgroundColor: "#60A5FA",
              borderTopLeftRadius: "50%",
              borderTopRightRadius: "50%",
            }}
          />
        </motion.div>
      )}

      {/* Thought bubble dots for interpreter */}
      {isWorking && agentId === "interpreter" && (
        <>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white border"
              style={{
                width: 3,
                height: 3,
                left: 30 + i * 1.5,
                top: -2 - i * 2,
                borderColor: color,
              }}
              animate={{ opacity: [0, 1, 0], scale: [0.6, 1, 0.6] }}
              transition={{
                duration: 1.8,
                delay: i * 0.2,
                repeat: Infinity,
              }}
            />
          ))}
        </>
      )}

      {/* Footstep dust for scout */}
      {isWorking && agentId === "scout" && (
        <>
          {[0, 1].map((i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-muted-foreground/30"
              style={{
                width: 4,
                height: 2,
                left: 8 + i * 20,
                top: 46,
              }}
              animate={{
                opacity: [0, 0.6, 0],
                scale: [0.4, 1, 1.4],
                y: [0, -1, 0],
              }}
              transition={{
                duration: 0.8,
                delay: i * 0.4,
                repeat: Infinity,
              }}
            />
          ))}
        </>
      )}

      {/* Sparkle burst for reporter presenting */}
      {isWorking && agentId === "reporter" && (
        <motion.div
          className="absolute"
          style={{ left: 34, top: 14 }}
          animate={{ opacity: [0, 1, 0], scale: [0.6, 1.1, 0.6] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        >
          <Sparkles className="h-3 w-3" style={{ color }} />
        </motion.div>
      )}

      {/* Done celebration — tiny stars */}
      {isDone && (
        <motion.div
          className="absolute"
          style={{ left: 28, top: -2 }}
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: [0, 1, 1], rotate: [-20, 15, 0] }}
          transition={{ duration: 0.6 }}
        >
          <Sparkles className="h-3 w-3 text-amber-400" />
        </motion.div>
      )}
    </div>
  );
}

// ─── Micro events — small icons that pop around active station ──────

function MicroEvents({
  icons,
  color,
}: {
  icons: (typeof Hash)[];
  color: string;
}) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 900);
    return () => clearInterval(id);
  }, []);

  // Place 3 icons at fixed offsets around the agent
  const slots = [
    { x: -32, y: -18, rotate: -12 },
    { x: 32, y: -22, rotate: 14 },
    { x: 0, y: -38, rotate: 0 },
  ];

  return (
    <>
      {slots.map((slot, i) => {
        const Icon = icons[(tick + i) % icons.length];
        return (
          <motion.div
            key={`${tick}-${i}`}
            className="absolute pointer-events-none"
            style={{ left: slot.x, top: slot.y }}
            initial={{ opacity: 0, scale: 0.4, y: slot.y + 6 }}
            animate={{
              opacity: [0, 0.9, 0],
              scale: [0.4, 1, 0.6],
              y: [slot.y + 6, slot.y - 4, slot.y - 10],
            }}
            transition={{ duration: 1.6, delay: i * 0.15, ease: "easeOut" }}
          >
            <div
              className="flex h-5 w-5 items-center justify-center rounded-md shadow-sm border"
              style={{
                backgroundColor: "white",
                borderColor: `${color}40`,
                transform: `rotate(${slot.rotate}deg)`,
              }}
            >
              <Icon className="h-3 w-3" style={{ color }} />
            </div>
          </motion.div>
        );
      })}
    </>
  );
}

// ─── Station zone ───────────────────────────────────────────────────

function Station({
  station,
  position,
  status,
  pulseKey,
  canvasW,
  canvasH,
}: {
  station: StationDef;
  position: { x: number; y: number };
  status: AgentStatus;
  pulseKey: number;
  canvasW: number;
  canvasH: number;
}) {
  const x = (position.x / 100) * canvasW;
  const y = (position.y / 100) * canvasH;
  const isActive = status === "working";
  const isDone = status === "done";

  return (
    <div
      className="absolute pointer-events-none"
      style={{ left: x, top: y, transform: "translate(-50%, -50%)" }}
    >
      {/* Ground zone glow */}
      {isActive && (
        <>
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 120,
              height: 44,
              top: 30,
              left: -60,
              background: `radial-gradient(ellipse, ${station.color}25 0%, ${station.color}08 50%, transparent 80%)`,
            }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.9, 1, 0.9] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
          {/* Ground ripples */}
          {[0, 1].map((i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border"
              style={{
                width: 70,
                height: 26,
                top: 40,
                left: -35,
                borderColor: `${station.color}55`,
              }}
              animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
              transition={{
                duration: 2.2,
                delay: i * 1.1,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          ))}
        </>
      )}

      {/* Station platform (mini pedestal) */}
      <motion.div
        key={pulseKey}
        className={`absolute rounded-2xl border transition-all duration-500 ${
          isActive
            ? `${station.bgTw} ${station.borderTw} shadow-lg`
            : isDone
              ? `bg-white ${station.borderTw} shadow-sm`
              : "bg-white/70 border-border/30"
        }`}
        style={{
          width: 64,
          height: 72,
          left: -32,
          top: -48,
          zIndex: 0,
        }}
        animate={
          isActive
            ? { scale: [1, 1.03, 1] }
            : {}
        }
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* The agent character */}
      <div
        className="relative"
        style={{ width: 40, height: 52, marginLeft: -20, marginTop: -44, zIndex: 10 }}
      >
        <AgentCharacter status={status} color={station.color} agentId={station.id} />
      </div>

      {/* Micro events during active */}
      {isActive && (
        <div className="absolute left-0 top-0 pointer-events-none z-20">
          <MicroEvents icons={station.microIcons} color={station.color} />
        </div>
      )}

      {/* Done checkmark badge */}
      {isDone && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="absolute z-20"
          style={{
            left: 8,
            top: -26,
          }}
        >
          <div
            className="flex h-4 w-4 items-center justify-center rounded-full shadow-sm border border-white"
            style={{ backgroundColor: station.color }}
          >
            <CheckCircle2 className="h-3 w-3 text-white" strokeWidth={3} />
          </div>
        </motion.div>
      )}

      {/* Label */}
      <div
        className="absolute left-1/2 -translate-x-1/2 text-center whitespace-nowrap"
        style={{ top: 28 }}
      >
        <p
          className={`text-[11px] font-semibold transition-colors duration-500 ${
            isActive
              ? station.accentTw
              : isDone
                ? "text-foreground/65"
                : "text-muted-foreground/35"
          }`}
        >
          {station.name}
        </p>
        <p
          className={`text-[9px] transition-colors duration-500 ${
            isActive ? "text-muted-foreground" : "text-muted-foreground/30"
          }`}
        >
          {station.role}
        </p>
      </div>
    </div>
  );
}

// ─── Ambient floating particles ─────────────────────────────────────

function AmbientParticles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        x: 5 + Math.random() * 90,
        y: 10 + Math.random() * 80,
        size: 1.5 + Math.random() * 2,
        delay: Math.random() * 5,
        duration: 5 + Math.random() * 4,
      })),
    []
  );

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

// ─── Main Export ─────────────────────────────────────────────────────

interface AgentWorkflowProps {
  phase: AnalysisPhase;
  progress: number;
  usedDatasets: Dataset[];
}

interface Burst {
  id: number;
  x: number;
  y: number;
  color: string;
}

export function AgentWorkflow({ phase, progress, usedDatasets }: AgentWorkflowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ w: 700, h: 400 });
  const [packets, setPackets] = useState<
    { id: number; from: number; to: number; color: string }[]
  >([]);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [pulseKeys, setPulseKeys] = useState<Record<number, number>>({});
  const [prevPhase, setPrevPhase] = useState<AnalysisPhase>(phase);
  const idRef = useRef(0);

  const currentIdx = PHASE_ORDER.indexOf(phase);
  const activeStation = STATIONS[currentIdx];

  // Measure canvas
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setCanvasSize({
          w: entry.contentRect.width,
          h: entry.contentRect.height,
        });
      }
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // On phase transition: launch handoff packet + schedule burst on arrival
  useEffect(() => {
    if (phase !== prevPhase) {
      setPrevPhase(phase);
      const newIdx = PHASE_ORDER.indexOf(phase);
      if (newIdx > 0) {
        const id = ++idRef.current;
        const color = STATIONS[newIdx].color;
        setPackets((p) => [...p, { id, from: newIdx - 1, to: newIdx, color }]);
        const timer = setTimeout(() => {
          // Burst at destination
          const pos = STATION_POSITIONS[newIdx];
          const x = (pos.x / 100) * canvasSize.w;
          const y = (pos.y / 100) * canvasSize.h;
          const burstId = ++idRef.current;
          setBursts((b) => [...b, { id: burstId, x, y, color }]);
          setPulseKeys((pk) => ({ ...pk, [newIdx]: (pk[newIdx] || 0) + 1 }));
          // Remove packet
          setPackets((p) => p.filter((pk) => pk.id !== id));
          // Remove burst after animation
          setTimeout(() => {
            setBursts((b) => b.filter((bb) => bb.id !== burstId));
          }, 900);
        }, 1250);
        return () => clearTimeout(timer);
      }
    }
  }, [phase, prevPhase, canvasSize.w, canvasSize.h]);

  if (phase === "idle" || phase === "no-match") return null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Minimal status bar */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between">
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2.5"
          >
            <motion.div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: activeStation?.color || "#3B82F6" }}
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className={`text-sm font-semibold ${activeStation?.accentTw || ""}`}>
              {activeStation?.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {activeStation?.description}
            </span>
          </motion.div>
        </AnimatePresence>

        <span className="text-[11px] text-muted-foreground/50 tabular-nums">
          {currentIdx + 1}/{STATIONS.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="px-5 pb-3">
        <div className="relative h-1 rounded-full bg-border/25 overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              background: `linear-gradient(90deg, ${STATIONS[0].color}90, ${
                activeStation?.color || STATIONS[0].color
              })`,
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

      {/* Spatial canvas */}
      <div ref={containerRef} className="relative flex-1 min-h-0">
        <AmbientParticles />

        <ConnectionPaths
          currentIdx={currentIdx}
          canvasW={canvasSize.w}
          canvasH={canvasSize.h}
        />

        {/* All 5 agents always visible at their stations */}
        {STATIONS.map((station, i) => {
          const stationPhaseIdx = PHASE_ORDER.indexOf(station.phase);
          const status: AgentStatus =
            stationPhaseIdx < currentIdx
              ? "done"
              : stationPhaseIdx === currentIdx
                ? "working"
                : "waiting";

          return (
            <Station
              key={station.id}
              station={station}
              position={STATION_POSITIONS[i]}
              status={status}
              pulseKey={pulseKeys[i] || 0}
              canvasW={canvasSize.w}
              canvasH={canvasSize.h}
            />
          );
        })}

        {/* Handoff packets */}
        <AnimatePresence>
          {packets.map((pkt) => (
            <HandoffPacket
              key={pkt.id}
              fromIdx={pkt.from}
              toIdx={pkt.to}
              color={pkt.color}
              canvasW={canvasSize.w}
              canvasH={canvasSize.h}
            />
          ))}
        </AnimatePresence>

        {/* Arrival bursts */}
        <AnimatePresence>
          {bursts.map((b) => (
            <ArrivalBurst key={b.id} x={b.x} y={b.y} color={b.color} />
          ))}
        </AnimatePresence>
      </div>

      {/* Datasets footer */}
      <AnimatePresence>
        {usedDatasets.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="px-5 py-3 border-t bg-white/40 backdrop-blur-sm flex items-center gap-2 flex-wrap"
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
