"use client";

import { useEffect, useState, useMemo } from "react";
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

// ─── Agent Definitions ──────────────────────────────────────────────

interface AgentDef {
  id: string;
  phase: AnalysisPhase;
  name: string;
  description: string;
  icon: typeof Search;
  gradient: string;       // for active glow
  accentColor: string;    // tailwind text
  bgActive: string;       // tailwind bg
  ringColor: string;      // ring glow
}

const AGENTS: AgentDef[] = [
  {
    id: "interpreter",
    phase: "intent",
    name: "질문 해석",
    description: "질문의 의도와 범위를 파악하고 있어요",
    icon: Search,
    gradient: "from-blue-400 to-blue-600",
    accentColor: "text-blue-600",
    bgActive: "bg-blue-50",
    ringColor: "ring-blue-300/40",
  },
  {
    id: "scout",
    phase: "catalog",
    name: "데이터 탐색",
    description: "관련 공공데이터를 찾고 있어요",
    icon: Database,
    gradient: "from-emerald-400 to-emerald-600",
    accentColor: "text-emerald-600",
    bgActive: "bg-emerald-50",
    ringColor: "ring-emerald-300/40",
  },
  {
    id: "validator",
    phase: "exploration",
    name: "데이터 검증",
    description: "데이터 품질과 결합 가능성을 확인해요",
    icon: ShieldCheck,
    gradient: "from-amber-400 to-amber-600",
    accentColor: "text-amber-600",
    bgActive: "bg-amber-50",
    ringColor: "ring-amber-300/40",
  },
  {
    id: "analyst",
    phase: "calculation",
    name: "분석 수행",
    description: "지표별 점수를 계산하고 순위를 매겨요",
    icon: Calculator,
    gradient: "from-violet-400 to-violet-600",
    accentColor: "text-violet-600",
    bgActive: "bg-violet-50",
    ringColor: "ring-violet-300/40",
  },
  {
    id: "reporter",
    phase: "result",
    name: "결과 생성",
    description: "차트와 리포트를 만들고 있어요",
    icon: FileBarChart,
    gradient: "from-rose-400 to-rose-600",
    accentColor: "text-rose-600",
    bgActive: "bg-rose-50",
    ringColor: "ring-rose-300/40",
  },
];

const PHASE_ORDER: AnalysisPhase[] = [
  "intent",
  "catalog",
  "exploration",
  "calculation",
  "result",
];

// ─── Animated ring pulses around active node ────────────────────────

function PulseRings({ gradient }: { gradient: string }) {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${gradient} opacity-0`}
          animate={{
            scale: [1, 1.8 + i * 0.3],
            opacity: [0.25, 0],
          }}
          transition={{
            duration: 2.2,
            delay: i * 0.6,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}
    </>
  );
}

// ─── Data packet that travels between nodes ─────────────────────────

function DataPacket({ gradient }: { gradient: string }) {
  return (
    <motion.div
      className="absolute top-1/2 -translate-y-1/2 z-10"
      initial={{ left: "-10%", opacity: 0, scale: 0.3 }}
      animate={{
        left: ["0%", "100%"],
        opacity: [0, 1, 1, 0],
        scale: [0.4, 1, 1, 0.4],
      }}
      transition={{ duration: 1, ease: "easeInOut" }}
    >
      <div className={`h-3 w-3 rounded-full bg-gradient-to-br ${gradient} shadow-lg`}>
        <motion.div
          className={`absolute inset-0 rounded-full bg-gradient-to-br ${gradient}`}
          animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      </div>
    </motion.div>
  );
}

// ─── Connector line between nodes ───────────────────────────────────

function Connector({
  status,
  transferGradient,
}: {
  status: "pending" | "active" | "done";
  transferGradient: string | null;
}) {
  return (
    <div className="relative flex items-center w-10 sm:w-16 lg:w-20 shrink-0 mx-0.5">
      {/* Background line */}
      <div className="absolute inset-y-1/2 left-0 right-0 h-[2px] rounded-full bg-border/40" />

      {/* Active / done overlay */}
      <motion.div
        className="absolute inset-y-1/2 left-0 right-0 h-[2px] rounded-full bg-primary/30"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: status !== "pending" ? 1 : 0 }}
        style={{ transformOrigin: "left" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />

      {/* Flowing glow on active */}
      {status === "active" && (
        <motion.div
          className="absolute inset-y-1/2 left-0 h-[3px] w-6 rounded-full bg-primary/50 blur-sm"
          animate={{ left: ["0%", "80%", "0%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Data packet */}
      <AnimatePresence>
        {transferGradient && <DataPacket gradient={transferGradient} />}
      </AnimatePresence>
    </div>
  );
}

// ─── Single agent node ──────────────────────────────────────────────

function AgentNode({
  agent,
  status,
  isCurrent,
}: {
  agent: AgentDef;
  status: "pending" | "active" | "completed";
  isCurrent: boolean;
}) {
  const Icon = agent.icon;
  const isActive = status === "active";
  const isDone = status === "completed";

  return (
    <div className="relative flex flex-col items-center shrink-0 w-[72px] sm:w-[88px] lg:w-[100px]">
      {/* Pulse rings for active */}
      {isActive && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-14 sm:w-16 sm:h-16">
          <PulseRings gradient={agent.gradient} />
        </div>
      )}

      {/* Node */}
      <motion.div
        className={`relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-3xl border-2 transition-all duration-500 z-10 ${
          isActive
            ? `${agent.bgActive} border-current ${agent.accentColor} shadow-lg ring-4 ${agent.ringColor}`
            : isDone
              ? "bg-primary/5 border-primary/25 text-primary"
              : "bg-muted/30 border-border/30 text-muted-foreground/25"
        }`}
        animate={
          isActive
            ? { y: [0, -4, 0] }
            : {}
        }
        transition={
          isActive
            ? { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
            : {}
        }
      >
        {isDone ? (
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <CheckCircle2 className="h-6 w-6 sm:h-7 sm:w-7" />
          </motion.div>
        ) : (
          <Icon className={`h-6 w-6 sm:h-7 sm:w-7 transition-all duration-500 ${isActive ? "scale-110" : ""}`} />
        )}

        {/* Spinning ring for calculation phase */}
        {isActive && agent.phase === "calculation" && (
          <motion.div
            className={`absolute inset-[-3px] rounded-3xl border-2 border-dashed ${agent.accentColor} opacity-30`}
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
        )}
      </motion.div>

      {/* Label */}
      <motion.p
        className={`mt-2.5 text-[11px] sm:text-xs font-semibold text-center transition-colors duration-500 ${
          isActive
            ? agent.accentColor
            : isDone
              ? "text-foreground/70"
              : "text-muted-foreground/30"
        }`}
        animate={isActive ? { opacity: [0.7, 1, 0.7] } : {}}
        transition={isActive ? { duration: 2, repeat: Infinity } : {}}
      >
        {agent.name}
      </motion.p>
    </div>
  );
}

// ─── Floating background particles ──────────────────────────────────

function BackgroundParticles({ active }: { active: boolean }) {
  const particles = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        id: i,
        x: 10 + Math.random() * 80,
        y: 15 + Math.random() * 70,
        size: 2 + Math.random() * 3,
        delay: Math.random() * 4,
        duration: 3 + Math.random() * 3,
      })),
    []
  );

  if (!active) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
          animate={{
            y: [0, -20, 0],
            opacity: [0, 0.6, 0],
            scale: [0.5, 1, 0.5],
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
  const [transfers, setTransfers] = useState<Set<string>>(new Set());
  const [prevPhase, setPrevPhase] = useState<AnalysisPhase>(phase);

  const currentIdx = PHASE_ORDER.indexOf(phase);
  const activeAgent = AGENTS.find((a) => a.phase === phase);

  // Trigger data packet transfer on phase change
  useEffect(() => {
    if (phase !== prevPhase) {
      setPrevPhase(phase);
      const idx = PHASE_ORDER.indexOf(phase);
      if (idx > 0) {
        const prevAgent = AGENTS[idx - 1];
        setTransfers((s) => {
          const n = new Set(s);
          n.add(prevAgent.id);
          return n;
        });
        const timer = setTimeout(() => {
          setTransfers((s) => {
            const n = new Set(s);
            n.delete(prevAgent.id);
            return n;
          });
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [phase, prevPhase]);

  if (phase === "idle" || phase === "no-match") return null;

  return (
    <div className="relative flex flex-col h-full items-center justify-center overflow-hidden">
      {/* Floating background particles */}
      <BackgroundParticles active={true} />

      {/* Subtle radial glow behind active agent */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-gradient-to-br ${activeAgent?.gradient || "from-blue-400 to-blue-600"} opacity-[0.04] blur-3xl`}
          animate={{ scale: [1, 1.2, 1], opacity: [0.03, 0.06, 0.03] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-2xl px-4">
        {/* Status text */}
        <div className="mb-10 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={phase}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
            >
              <p className={`text-base sm:text-lg font-semibold ${activeAgent?.accentColor || "text-foreground"}`}>
                {activeAgent?.name || "처리 중"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {activeAgent?.description || ""}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Pipeline nodes */}
        <div className="flex items-center justify-center">
          {AGENTS.map((agent, i) => {
            const agentIdx = PHASE_ORDER.indexOf(agent.phase);
            const status: "pending" | "active" | "completed" =
              agentIdx < currentIdx
                ? "completed"
                : agentIdx === currentIdx
                  ? "active"
                  : "pending";

            const connectorStatus =
              agentIdx < currentIdx
                ? "done"
                : agentIdx === currentIdx
                  ? "active"
                  : "pending";

            return (
              <div key={agent.id} className="flex items-center">
                <AgentNode
                  agent={agent}
                  status={status}
                  isCurrent={agentIdx === currentIdx}
                />
                {i < AGENTS.length - 1 && (
                  <Connector
                    status={connectorStatus}
                    transferGradient={
                      transfers.has(agent.id) ? AGENTS[i + 1].gradient : null
                    }
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="mt-10 w-full max-w-xs">
          <div className="relative h-1.5 rounded-full bg-border/30 overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary/60 to-primary"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
            {/* Shimmer */}
            <motion.div
              className="absolute inset-y-0 w-12 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ left: ["-10%", "110%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-muted-foreground/50">
            <span>{currentIdx + 1} / {AGENTS.length} 단계</span>
            <span>{progress}%</span>
          </div>
        </div>

        {/* Used datasets - compact */}
        <AnimatePresence>
          {usedDatasets.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-8 flex flex-wrap justify-center gap-1.5"
            >
              {usedDatasets.slice(0, 4).map((ds, i) => (
                <motion.div
                  key={ds.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Badge
                    variant="secondary"
                    className="text-[10px] font-normal bg-white/60 backdrop-blur-sm border shadow-sm"
                  >
                    {ds.title}
                  </Badge>
                </motion.div>
              ))}
              {usedDatasets.length > 4 && (
                <Badge variant="outline" className="text-[10px] font-normal">
                  +{usedDatasets.length - 4}
                </Badge>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
