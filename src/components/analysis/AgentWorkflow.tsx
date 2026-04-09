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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { AnalysisPhase } from "@/hooks/useAnalysisSimulation";
import type { Dataset } from "@/data/datasets";

// ─── Constants ──────────────────────────────────────────────────────

const PHASE_ORDER: AnalysisPhase[] = [
  "intent",
  "catalog",
  "exploration",
  "calculation",
  "result",
];

// Station positions as percentages of the canvas (x, y)
// Arranged in a gentle arc / organic layout, NOT a straight line
const STATION_POSITIONS: { x: number; y: number }[] = [
  { x: 12, y: 30 },   // Interpreter - top left
  { x: 32, y: 58 },   // Scout - mid left low
  { x: 50, y: 28 },   // Validator - center top
  { x: 68, y: 56 },   // Analyst - mid right low
  { x: 88, y: 32 },   // Reporter - top right
];

// ─── Agent / Station Definitions ────────────────────────────────────

interface StationDef {
  id: string;
  phase: AnalysisPhase;
  label: string;
  description: string;
  icon: typeof Search;
  color: string;         // hex for inline styles
  accentTw: string;      // tailwind text
  bgTw: string;          // tailwind bg
  borderTw: string;      // tailwind border
}

const STATIONS: StationDef[] = [
  {
    id: "interpreter",
    phase: "intent",
    label: "질문 해석",
    description: "의도를 파악하고 있어요",
    icon: Search,
    color: "#3B82F6",
    accentTw: "text-blue-500",
    bgTw: "bg-blue-50",
    borderTw: "border-blue-200",
  },
  {
    id: "scout",
    phase: "catalog",
    label: "데이터 탐색",
    description: "공공데이터를 찾고 있어요",
    icon: Database,
    color: "#10B981",
    accentTw: "text-emerald-500",
    bgTw: "bg-emerald-50",
    borderTw: "border-emerald-200",
  },
  {
    id: "validator",
    phase: "exploration",
    label: "데이터 검증",
    description: "품질을 확인하고 있어요",
    icon: ShieldCheck,
    color: "#F59E0B",
    accentTw: "text-amber-500",
    bgTw: "bg-amber-50",
    borderTw: "border-amber-200",
  },
  {
    id: "analyst",
    phase: "calculation",
    label: "분석 수행",
    description: "점수를 계산하고 있어요",
    icon: Calculator,
    color: "#8B5CF6",
    accentTw: "text-violet-500",
    bgTw: "bg-violet-50",
    borderTw: "border-violet-200",
  },
  {
    id: "reporter",
    phase: "result",
    label: "결과 생성",
    description: "리포트를 만들고 있어요",
    icon: FileBarChart,
    color: "#F43F5E",
    accentTw: "text-rose-500",
    bgTw: "bg-rose-50",
    borderTw: "border-rose-200",
  },
];

// ─── SVG path lines connecting stations ─────────────────────────────

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
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
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

        // Curved connection
        const midX = (x1 + x2) / 2;
        const midY = Math.min(y1, y2) - 20;

        const isDone = i < currentIdx;
        const isActive = i === currentIdx - 1 || i === currentIdx;

        return (
          <g key={i}>
            {/* Background path */}
            <path
              d={`M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`}
              fill="none"
              stroke={isDone ? STATIONS[i + 1].color : "var(--color-border)"}
              strokeWidth={isDone ? 2 : 1.5}
              strokeDasharray={isDone ? "none" : "6 4"}
              opacity={isDone ? 0.35 : 0.25}
              strokeLinecap="round"
            />
            {/* Active glow */}
            {isActive && isDone && (
              <path
                d={`M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`}
                fill="none"
                stroke={STATIONS[i + 1].color}
                strokeWidth={3}
                opacity={0.15}
                filter="url(#glow)"
                strokeLinecap="round"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ─── Data packet flying between stations ────────────────────────────

function FlyingPacket({
  fromIdx,
  toIdx,
  color,
  canvasW,
  canvasH,
}: {
  fromIdx: number;
  toIdx: number;
  color: string;
  canvasW: number;
  canvasH: number;
}) {
  const from = STATION_POSITIONS[fromIdx];
  const to = STATION_POSITIONS[toIdx];

  const x1 = (from.x / 100) * canvasW;
  const y1 = (from.y / 100) * canvasH;
  const x2 = (to.x / 100) * canvasW;
  const y2 = (to.y / 100) * canvasH;

  return (
    <motion.div
      className="absolute z-30 pointer-events-none"
      initial={{ left: x1, top: y1, opacity: 0, scale: 0.3 }}
      animate={{
        left: [x1, (x1 + x2) / 2, x2],
        top: [y1, Math.min(y1, y2) - 30, y2],
        opacity: [0, 1, 1, 0],
        scale: [0.3, 1.2, 1, 0.3],
      }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
      style={{ marginLeft: -6, marginTop: -6 }}
    >
      <div
        className="h-3 w-3 rounded-full shadow-lg"
        style={{ backgroundColor: color, boxShadow: `0 0 12px ${color}50` }}
      />
    </motion.div>
  );
}

// ─── Agent token (the little character that moves) ──────────────────

function AgentToken({
  stationIdx,
  color,
  isWorking,
  canvasW,
  canvasH,
}: {
  stationIdx: number;
  color: string;
  isWorking: boolean;
  canvasW: number;
  canvasH: number;
}) {
  const pos = STATION_POSITIONS[stationIdx];
  const x = (pos.x / 100) * canvasW;
  const y = (pos.y / 100) * canvasH;

  return (
    <motion.div
      className="absolute z-20 pointer-events-none"
      animate={{
        left: x,
        top: y - 38,
      }}
      transition={{
        type: "spring",
        stiffness: 80,
        damping: 18,
        mass: 1,
      }}
      style={{ marginLeft: -14 }}
    >
      {/* Agent body */}
      <motion.div
        className="relative"
        animate={
          isWorking
            ? { y: [0, -3, 0, -2, 0] }
            : {}
        }
        transition={
          isWorking
            ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
            : {}
        }
      >
        {/* Glow behind agent */}
        {isWorking && (
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full"
            style={{ backgroundColor: color }}
            animate={{ scale: [1, 1.5, 1], opacity: [0.15, 0.05, 0.15] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}

        {/* Main circle */}
        <div
          className="relative h-7 w-7 rounded-full border-2 border-white shadow-md flex items-center justify-center"
          style={{ backgroundColor: color }}
        >
          {/* Face - two dots for eyes */}
          <div className="flex gap-[3px]">
            <div className="h-[3px] w-[3px] rounded-full bg-white/90" />
            <div className="h-[3px] w-[3px] rounded-full bg-white/90" />
          </div>
        </div>

        {/* Working indicator - small orbiting dot */}
        {isWorking && (
          <motion.div
            className="absolute top-0 left-1/2 w-2 h-2 rounded-full"
            style={{ backgroundColor: color, marginLeft: -4 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            // orbit around center
          >
            <motion.div
              className="absolute h-1.5 w-1.5 rounded-full bg-white shadow-sm"
              style={{ top: -8, left: 0.5 }}
            />
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Station (zone where work happens) ──────────────────────────────

function Station({
  station,
  position,
  status,
  canvasW,
  canvasH,
}: {
  station: StationDef;
  position: { x: number; y: number };
  status: "pending" | "active" | "completed";
  canvasW: number;
  canvasH: number;
}) {
  const Icon = station.icon;
  const isActive = status === "active";
  const isDone = status === "completed";

  const x = (position.x / 100) * canvasW;
  const y = (position.y / 100) * canvasH;

  return (
    <motion.div
      className="absolute flex flex-col items-center pointer-events-none"
      style={{ left: x, top: y, transform: "translate(-50%, -50%)" }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Active zone glow - the "ground" effect */}
      {isActive && (
        <>
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 100,
              height: 40,
              top: 16,
              background: `radial-gradient(ellipse, ${station.color}18 0%, transparent 70%)`,
            }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
          {/* Ripple rings on ground */}
          {[0, 1].map((i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border"
              style={{
                width: 60,
                height: 24,
                top: 22,
                borderColor: `${station.color}30`,
              }}
              animate={{ scale: [1, 2], opacity: [0.4, 0] }}
              transition={{
                duration: 2,
                delay: i * 0.8,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          ))}
        </>
      )}

      {/* Station platform */}
      <motion.div
        className={`relative flex h-12 w-12 items-center justify-center rounded-2xl border-[1.5px] transition-all duration-700 ${
          isActive
            ? `${station.bgTw} ${station.borderTw} shadow-lg`
            : isDone
              ? `bg-white ${station.borderTw} shadow-sm`
              : "bg-muted/40 border-border/30"
        }`}
        animate={isActive ? { scale: [1, 1.06, 1] } : {}}
        transition={isActive ? { duration: 3, repeat: Infinity, ease: "easeInOut" } : {}}
      >
        {isDone ? (
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 250, damping: 18 }}
          >
            <CheckCircle2 className={`h-5 w-5 ${station.accentTw}`} />
          </motion.div>
        ) : (
          <Icon
            className={`h-5 w-5 transition-colors duration-500 ${
              isActive ? station.accentTw : "text-muted-foreground/25"
            }`}
          />
        )}

        {/* Active sparkle dots */}
        {isActive && (
          <>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute h-1 w-1 rounded-full"
                style={{ backgroundColor: station.color }}
                animate={{
                  x: [0, (i - 1) * 18],
                  y: [0, -12 - i * 4, 0],
                  opacity: [0, 0.7, 0],
                  scale: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.35,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
            ))}
          </>
        )}
      </motion.div>

      {/* Label */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${station.id}-${status}`}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-center"
        >
          <p
            className={`text-[11px] font-semibold transition-colors duration-500 ${
              isActive
                ? station.accentTw
                : isDone
                  ? "text-foreground/60"
                  : "text-muted-foreground/25"
            }`}
          >
            {station.label}
          </p>
          {isActive && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[10px] text-muted-foreground mt-0.5"
            >
              {station.description}
            </motion.p>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Ambient floating particles ─────────────────────────────────────

function AmbientParticles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        id: i,
        x: 5 + Math.random() * 90,
        y: 10 + Math.random() * 80,
        size: 1.5 + Math.random() * 2.5,
        delay: Math.random() * 5,
        duration: 4 + Math.random() * 4,
      })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-primary/8"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -15, 0],
            opacity: [0, 0.5, 0],
          }}
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

export function AgentWorkflow({ phase, progress, usedDatasets }: AgentWorkflowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ w: 700, h: 400 });
  const [packets, setPackets] = useState<{ id: number; from: number; to: number }[]>([]);
  const [prevPhase, setPrevPhase] = useState<AnalysisPhase>(phase);
  const packetId = useRef(0);

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

  // Trigger flying packet on phase change
  useEffect(() => {
    if (phase !== prevPhase) {
      setPrevPhase(phase);
      const newIdx = PHASE_ORDER.indexOf(phase);
      if (newIdx > 0) {
        const id = ++packetId.current;
        setPackets((p) => [...p, { id, from: newIdx - 1, to: newIdx }]);
        const timer = setTimeout(() => {
          setPackets((p) => p.filter((pk) => pk.id !== id));
        }, 1400);
        return () => clearTimeout(timer);
      }
    }
  }, [phase, prevPhase]);

  if (phase === "idle" || phase === "no-match") return null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Status bar - minimal */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between">
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
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
              {activeStation?.label}
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

      {/* Progress */}
      <div className="px-5 pb-3">
        <div className="relative h-1 rounded-full bg-border/25 overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              background: `linear-gradient(90deg, ${STATIONS[0].color}80, ${activeStation?.color || STATIONS[0].color})`,
            }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
          <motion.div
            className="absolute inset-y-0 w-8 bg-gradient-to-r from-transparent via-white/40 to-transparent"
            animate={{ left: ["-5%", "105%"] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.5 }}
          />
        </div>
      </div>

      {/* Spatial canvas */}
      <div ref={containerRef} className="relative flex-1 min-h-0">
        {/* Ambient particles */}
        <AmbientParticles />

        {/* Connection paths */}
        <ConnectionPaths
          currentIdx={currentIdx}
          canvasW={canvasSize.w}
          canvasH={canvasSize.h}
        />

        {/* Stations */}
        {STATIONS.map((station, i) => {
          const stationPhaseIdx = PHASE_ORDER.indexOf(station.phase);
          const status: "pending" | "active" | "completed" =
            stationPhaseIdx < currentIdx
              ? "completed"
              : stationPhaseIdx === currentIdx
                ? "active"
                : "pending";

          return (
            <Station
              key={station.id}
              station={station}
              position={STATION_POSITIONS[i]}
              status={status}
              canvasW={canvasSize.w}
              canvasH={canvasSize.h}
            />
          );
        })}

        {/* Agent token that travels between stations */}
        <AgentToken
          stationIdx={currentIdx}
          color={activeStation?.color || "#3B82F6"}
          isWorking={true}
          canvasW={canvasSize.w}
          canvasH={canvasSize.h}
        />

        {/* Flying data packets */}
        <AnimatePresence>
          {packets.map((pkt) => (
            <FlyingPacket
              key={pkt.id}
              fromIdx={pkt.from}
              toIdx={pkt.to}
              color={STATIONS[pkt.to].color}
              canvasW={canvasSize.w}
              canvasH={canvasSize.h}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Datasets - compact footer */}
      <AnimatePresence>
        {usedDatasets.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="px-5 py-3 border-t bg-white/40 backdrop-blur-sm flex items-center gap-2 flex-wrap"
          >
            <span className="text-[10px] font-medium text-muted-foreground/50 shrink-0">데이터</span>
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
