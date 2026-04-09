"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AnalysisPhase } from "@/hooks/useAnalysisSimulation";

// ─── Layout: positions in % of container ─────────────────────────────

const ENTRANCE = { x: -4, y: 78 };
const EXIT = { x: 104, y: 20 };

interface DeskPos {
  id: string;
  x: number;
  y: number;
  label: string;
  sublabel: string;
  icon: string;
}

const DESKS: DeskPos[] = [
  { id: "scout",    x: 14, y: 38, label: "Scout",   sublabel: "데이터 탐색", icon: "🔍" },
  { id: "cleaner",  x: 38, y: 62, label: "Refiner", sublabel: "데이터 정제", icon: "🧹" },
  { id: "engineer", x: 62, y: 38, label: "Forge",   sublabel: "피처 엔지니어링", icon: "⚙️" },
  { id: "reporter", x: 86, y: 62, label: "Canvas",  sublabel: "시각화", icon: "📊" },
];

// ─── Agent defs ──────────────────────────────────────────────────────

interface AgentDef {
  id: string;
  name: string;
  title: string;
  emoji: string;
  color: string;       // for shirt
  hairColor: string;
  deskId: string;
  phases: AnalysisPhase[];
  tasks: Record<string, string[]>;
}

const AGENTS: AgentDef[] = [
  {
    id: "scout", name: "민준", title: "Scout", emoji: "🔍",
    color: "#3B82F6", hairColor: "#4B3621",
    deskId: "scout",
    phases: ["intent", "catalog"],
    tasks: {
      intent: ["키워드 추출 중...", "지역 범위 확인", "분석 목적 분류 완료"],
      catalog: ["카탈로그 검색 시작", "5건 발견!", "목록 정리 완료"],
    },
  },
  {
    id: "cleaner", name: "서윤", title: "Refiner", emoji: "🧹",
    color: "#10B981", hairColor: "#1a1a2e",
    deskId: "cleaner",
    phases: ["exploration"],
    tasks: {
      exploration: ["컬럼 타입 검증", "정합성 체크 OK", "결합 키 매칭 완료"],
    },
  },
  {
    id: "engineer", name: "도현", title: "Forge", emoji: "⚙️",
    color: "#F59E0B", hairColor: "#8B4513",
    deskId: "engineer",
    phases: ["calculation"],
    tasks: {
      calculation: ["파생 변수 생성 중...", "접근성 점수 산출", "가중치 적용", "순위 계산 완료!"],
    },
  },
  {
    id: "reporter", name: "지우", title: "Canvas", emoji: "📊",
    color: "#8B5CF6", hairColor: "#2d1b69",
    deskId: "reporter",
    phases: ["result"],
    tasks: {
      result: ["차트 포맷팅...", "지도 레이어 생성", "리포트 완성!"],
    },
  },
];

// ─── Pixel Character ─────────────────────────────────────────────────

function Character({
  agent, x, y, status, direction, bubble,
}: {
  agent: AgentDef;
  x: number; y: number;
  status: "idle" | "walking" | "sitting" | "done";
  direction: "left" | "right";
  bubble?: string;
}) {
  const isSitting = status === "sitting";

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ zIndex: Math.round(y) + 20 }}
      animate={{ left: `${x}%`, top: `${y}%` }}
      transition={{
        type: "tween",
        duration: status === "walking" ? 1.4 : 0.3,
        ease: "easeInOut",
      }}
    >
      <div className="relative" style={{ transform: "translate(-50%, -100%)" }}>
        {/* Bubble */}
        <AnimatePresence mode="wait">
          {bubble && (
            <motion.div
              key={bubble}
              initial={{ opacity: 0, y: 4, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              className="absolute -top-10 left-1/2 -translate-x-1/2 z-50"
            >
              <div className="whitespace-nowrap rounded-lg bg-white/95 px-2.5 py-1 text-[10px] font-medium text-foreground shadow-lg border border-border/60 backdrop-blur-sm">
                {bubble}
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-2 w-2 rotate-45 bg-white/95 border-b border-r border-border/60" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Name */}
        <div className="mb-1 flex justify-center">
          <span className="rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-bold text-white leading-none">
            {agent.name}
          </span>
        </div>

        {/* SVG Character (36x44) */}
        <svg
          width="36" height="44" viewBox="0 0 36 44"
          className={direction === "left" ? "scale-x-[-1]" : ""}
        >
          {/* Shadow */}
          <ellipse cx="18" cy="42" rx="10" ry="3" fill="rgba(0,0,0,0.12)" />

          {/* Legs */}
          <motion.g
            animate={status === "walking" ? { rotate: [-12, 12, -12] } : {}}
            transition={{ duration: 0.3, repeat: Infinity }}
            style={{ transformOrigin: "18px 30px" }}
          >
            <rect x="12" y="30" width="4.5" height="10" rx="2" fill="#374151" />
            <rect x="19.5" y="30" width="4.5" height="10" rx="2" fill="#4B5563" />
            {/* Shoes */}
            <rect x="11" y="38" width="6" height="3" rx="1.5" fill="#1F2937" />
            <rect x="19" y="38" width="6" height="3" rx="1.5" fill="#1F2937" />
          </motion.g>

          {/* Body */}
          <rect x="8" y="19" width="20" height="13" rx="3" fill={agent.color} />
          {/* Collar */}
          <path d="M 14 19 L 18 23 L 22 19" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />

          {/* Arms */}
          <motion.rect
            x="3" y="20" width="5" height="10" rx="2.5"
            fill={agent.color}
            animate={isSitting ? { rotate: [-20, 20, -20] } : {}}
            transition={{ duration: 0.6, repeat: Infinity }}
            style={{ transformOrigin: "5.5px 20px" }}
          />
          <motion.rect
            x="28" y="20" width="5" height="10" rx="2.5"
            fill={agent.color}
            animate={isSitting ? { rotate: [20, -20, 20] } : {}}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
            style={{ transformOrigin: "30.5px 20px" }}
          />
          {/* Hands */}
          <circle cx="5.5" cy="30" r="2.5" fill="#FFD9B3" />
          <circle cx="30.5" cy="30" r="2.5" fill="#FFD9B3" />

          {/* Head */}
          <circle cx="18" cy="12" r="9" fill="#FFD9B3" />
          {/* Hair */}
          <ellipse cx="18" cy="8" rx="9.5" ry="5" fill={agent.hairColor} />
          {/* Eyes */}
          <motion.g
            animate={isSitting ? { scaleY: [1, 0.1, 1] } : {}}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            style={{ transformOrigin: "18px 12px" }}
          >
            <circle cx="14" cy="12" r="1.5" fill="#1F2937" />
            <circle cx="22" cy="12" r="1.5" fill="#1F2937" />
            {/* Pupils */}
            <circle cx="14.5" cy="11.5" r="0.5" fill="white" />
            <circle cx="22.5" cy="11.5" r="0.5" fill="white" />
          </motion.g>
          {/* Mouth */}
          {isSitting ? (
            <ellipse cx="18" cy="15.5" rx="2" ry="1" fill="#E58E73" />
          ) : (
            <path d="M 16 15.5 Q 18 17 20 15.5" fill="none" stroke="#C07A63" strokeWidth="0.8" />
          )}

          {/* Working sparkle */}
          {isSitting && (
            <motion.g
              animate={{ opacity: [0, 1, 0], y: [0, -3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <text x="30" y="6" fontSize="8">✨</text>
            </motion.g>
          )}
        </svg>
      </div>
    </motion.div>
  );
}

function getPhaseLabel(phase: AnalysisPhase) {
  if (phase === "intent") return "질문 해석"
  if (phase === "catalog") return "카탈로그 탐색"
  if (phase === "exploration") return "데이터 검증"
  if (phase === "calculation") return "계산 수행"
  if (phase === "result") return "결과 생성"
  return "대기"
}

// ─── Desk furniture ──────────────────────────────────────────────────

function DeskFurniture({ desk, isActive }: { desk: DeskPos; isActive: boolean }) {
  return (
    <div
      className="absolute"
      style={{
        left: `${desk.x}%`,
        top: `${desk.y}%`,
        transform: "translate(-50%, -50%)",
        zIndex: Math.round(desk.y),
      }}
    >
      <div className="relative flex flex-col items-center">
        {/* Desk label plate */}
        <div className={`mb-1 rounded-md px-2 py-0.5 text-[9px] font-semibold transition-all duration-500 ${
          isActive
            ? "bg-primary/15 text-primary border border-primary/30 shadow-sm"
            : "bg-muted/60 text-muted-foreground/60 border border-transparent"
        }`}>
          {desk.icon} {desk.sublabel}
        </div>

        {/* Monitor */}
        <div className="relative mb-0.5">
          <div className={`h-8 w-12 rounded-sm border-2 transition-colors duration-500 ${
            isActive ? "border-slate-500 bg-slate-800" : "border-slate-300 bg-slate-200"
          }`}>
            {isActive && (
              <motion.div
                className="m-0.5 h-6 w-10 rounded-[1px] overflow-hidden"
                style={{ background: "#0f172a" }}
              >
                {/* Screen content animation */}
                <motion.div
                  className="h-full w-full"
                  animate={{
                    background: [
                      "linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)",
                      "linear-gradient(135deg, #1e3a5f 0%, #1a3550 50%, #0f172a 100%)",
                      "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                {/* Fake code lines */}
                <div className="absolute inset-1 flex flex-col gap-0.5">
                  <div className="h-0.5 w-6 rounded bg-green-400/40" />
                  <div className="h-0.5 w-8 rounded bg-blue-400/30" />
                  <div className="h-0.5 w-5 rounded bg-green-400/40" />
                </div>
              </motion.div>
            )}
          </div>
          {/* Monitor stand */}
          <div className="mx-auto h-2 w-2 bg-slate-400" />
          <div className="mx-auto h-1 w-5 rounded-sm bg-slate-400" />
        </div>

        {/* Desk surface */}
        <div className={`h-5 w-20 rounded-md shadow-sm transition-colors duration-500 ${
          isActive
            ? "bg-amber-700 border border-amber-800/50"
            : "bg-amber-800/50 border border-amber-900/20"
        }`}>
          {/* Items on desk */}
          <div className="flex items-center justify-between px-1.5 pt-0.5">
            <div className="h-2 w-2 rounded-full bg-red-400/40" /> {/* coffee mug */}
            <div className="h-1.5 w-4 rounded-sm bg-white/20" />   {/* papers */}
            <div className="h-2 w-1.5 rounded-sm bg-yellow-300/30" /> {/* sticky note */}
          </div>
        </div>

        {/* Chair */}
        <div className="mt-1">
          <div className={`h-5 w-8 rounded-t-lg transition-colors duration-500 ${
            isActive ? "bg-slate-500" : "bg-slate-400/50"
          }`} />
          <div className="mx-auto h-1 w-3 bg-slate-600/50 rounded-b" />
        </div>
      </div>
    </div>
  );
}

// ─── Pathways between desks ──────────────────────────────────────────

function Pathways() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-[1]" preserveAspectRatio="none">
      <defs>
        <pattern id="dots" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
          <circle cx="4" cy="4" r="0.8" fill="rgba(0,0,0,0.08)" />
        </pattern>
      </defs>
      {/* Dotted path connecting desks */}
      {DESKS.map((desk, i) => {
        const next = DESKS[i + 1];
        if (!next) return null;
        const mx = (desk.x + next.x) / 2;
        const my = Math.min(desk.y, next.y) - 8;
        return (
          <path
            key={desk.id}
            d={`M ${desk.x}% ${desk.y + 5}% Q ${mx}% ${my}% ${next.x}% ${next.y + 5}%`}
            stroke="rgba(0,0,0,0.06)"
            strokeWidth="2"
            strokeDasharray="4 4"
            fill="none"
          />
        );
      })}
    </svg>
  );
}

// ─── Data packet flying between desks ────────────────────────────────

function DataPacket({ from, to, active }: { from: DeskPos; to: DeskPos; active: boolean }) {
  if (!active) return null;
  return (
    <motion.div
      className="absolute z-[60] pointer-events-none"
      initial={{ left: `${from.x}%`, top: `${from.y}%`, opacity: 0, scale: 0 }}
      animate={{
        left: [`${from.x}%`, `${(from.x + to.x) / 2}%`, `${to.x}%`],
        top: [`${from.y}%`, `${Math.min(from.y, to.y) - 12}%`, `${to.y}%`],
        opacity: [0, 1, 0],
        scale: [0.5, 1.3, 0.5],
      }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
      style={{ transform: "translate(-50%, -50%)" }}
    >
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20 shadow-md border border-primary/30 text-sm">
        📋
      </div>
    </motion.div>
  );
}

// ─── Office environment ──────────────────────────────────────────────

function OfficeEnvironment() {
  return (
    <>
      {/* Floor */}
      <div className="absolute inset-0 bg-gradient-to-br from-stone-100 via-stone-50 to-amber-50/30" />
      {/* Floor tiles */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,1) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Walls */}
      <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-b from-stone-300 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-stone-200/50" />

      {/* Entrance */}
      <div className="absolute left-0 bottom-[15%] z-[5]">
        <div className="relative">
          <div className="h-16 w-3 rounded-r bg-amber-700 shadow-sm" />
          <div className="absolute top-1/2 -translate-y-1/2 left-4 bg-emerald-500/80 text-white text-[7px] font-bold px-1.5 py-0.5 rounded">
            IN →
          </div>
        </div>
      </div>

      {/* Exit */}
      <div className="absolute right-0 top-[15%] z-[5]">
        <div className="relative">
          <div className="h-16 w-3 rounded-l bg-amber-700 shadow-sm" />
          <div className="absolute top-1/2 -translate-y-1/2 right-4 bg-slate-500/80 text-white text-[7px] font-bold px-1.5 py-0.5 rounded">
            ← OUT
          </div>
        </div>
      </div>

      {/* Decorations */}
      <div className="absolute left-[7%] top-[10%] text-xl opacity-70 select-none">🪴</div>
      <div className="absolute right-[7%] top-[10%] text-xl opacity-70 select-none">🪴</div>
      <div className="absolute left-[7%] bottom-[10%] text-lg opacity-50 select-none">🚰</div>
      <div className="absolute right-[7%] bottom-[10%] text-lg opacity-50 select-none">☕</div>

      {/* Whiteboard */}
      <div className="absolute left-1/2 -translate-x-1/2 top-[4%] z-[2]">
        <div className="flex items-center gap-1.5 rounded-md bg-white border-2 border-gray-200 px-3 py-1.5 shadow-sm">
          <span className="text-[9px] font-semibold text-slate-500">📋 Data Analysis Pipeline</span>
          <div className="flex gap-0.5">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            <div className="h-1.5 w-1.5 rounded-full bg-green-400" />
            <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <div className="h-1.5 w-1.5 rounded-full bg-violet-400" />
          </div>
        </div>
      </div>

      {/* Rug / carpet area */}
      <div
        className="absolute left-[10%] top-[20%] right-[10%] bottom-[12%] rounded-2xl opacity-30"
        style={{ background: "radial-gradient(ellipse, rgba(180,160,130,0.3), transparent 70%)" }}
      />
    </>
  );
}

// ─── Main Component ──────────────────────────────────────────────────

interface AgentTownProps {
  phase: AnalysisPhase;
  progress: number;
  activeTask: string;
  taskPid: string;
  recentLogs: string[];
  query: string;
}

interface CharState {
  x: number;
  y: number;
  status: "idle" | "walking" | "sitting" | "done";
  dir: "left" | "right";
  bubble?: string;
  visible: boolean;
}

export function AgentTown({
  phase,
  progress,
  activeTask,
  taskPid,
  recentLogs,
  query,
}: AgentTownProps) {
  const [chars, setChars] = useState<Record<string, CharState>>(() => {
    const init: Record<string, CharState> = {};
    AGENTS.forEach((a) => {
      init[a.id] = { x: ENTRANCE.x, y: ENTRANCE.y, status: "idle", dir: "right", visible: false };
    });
    return init;
  });

  const [packets, setPackets] = useState<Record<string, boolean>>({});
  const [logs, setLogs] = useState<{ emoji: string; text: string; time: string }[]>([]);
  const tRef = useRef<NodeJS.Timeout[]>([]);
  const logRef = useRef<HTMLDivElement>(null);

  const addLog = useCallback((emoji: string, text: string) => {
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
    setLogs((p) => [...p.slice(-15), { emoji, text, time }]);
  }, []);

  useEffect(() => () => { tRef.current.forEach(clearTimeout); }, []);
  useEffect(() => { logRef.current?.scrollIntoView({ behavior: "smooth" }); }, [logs]);

  const sched = useCallback((fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    tRef.current.push(t as unknown as NodeJS.Timeout);
  }, []);

  // Active desk tracking for glow effect
  const [activeDesks, setActiveDesks] = useState<Set<string>>(new Set());

  useEffect(() => {
    tRef.current.forEach(clearTimeout);
    tRef.current = [];
    setPackets({});
    setActiveDesks(new Set());

    if (phase === "idle" || phase === "no-match") {
      const init: Record<string, CharState> = {};
      AGENTS.forEach((a) => {
        init[a.id] = { x: ENTRANCE.x, y: ENTRANCE.y, status: "idle", dir: "right", visible: false };
      });
      setChars(init);
      setLogs([]);
      return;
    }

    const order: AnalysisPhase[] = ["intent", "catalog", "exploration", "calculation", "result"];
    const pi = order.indexOf(phase);

    AGENTS.forEach((agent) => {
      const desk = DESKS.find((d) => d.id === agent.deskId)!;
      const isActive = agent.phases.includes(phase);
      const lastPI = Math.max(...agent.phases.map((p) => order.indexOf(p)));
      const firstPI = Math.min(...agent.phases.map((p) => order.indexOf(p)));

      if (isActive) {
        // Show & walk to desk
        setChars((p) => ({
          ...p,
          [agent.id]: { x: ENTRANCE.x, y: ENTRANCE.y, status: "walking", dir: "right", visible: true },
        }));
        addLog(agent.emoji, `${agent.name} 출근`);

        sched(() => {
          setChars((p) => ({
            ...p,
            [agent.id]: { ...p[agent.id], x: desk.x, y: desk.y + 10, status: "walking", dir: desk.x > 50 ? "right" : "right" },
          }));
        }, 100);

        sched(() => {
          setChars((p) => ({
            ...p,
            [agent.id]: { ...p[agent.id], status: "sitting" },
          }));
          setActiveDesks((s) => { const n = new Set(s); n.add(desk.id); return n; });
          addLog(agent.emoji, `${agent.name} 작업 시작`);
        }, 1600);

        // Tasks
        const tasks = agent.tasks[phase] || [];
        tasks.forEach((task, i) => {
          sched(() => {
            setChars((p) => ({
              ...p,
              [agent.id]: { ...p[agent.id], bubble: task },
            }));
            addLog(agent.emoji, task);
          }, 2200 + i * 900);
        });

      } else if (pi > lastPI) {
        // Done → walk out
        setActiveDesks((s) => { const n = new Set(s); n.delete(desk.id); return n; });

        sched(() => {
          setChars((p) => ({
            ...p,
            [agent.id]: { ...p[agent.id], status: "walking", dir: "right", x: EXIT.x, y: EXIT.y, bubble: undefined },
          }));
          addLog(agent.emoji, `${agent.name} 퇴근`);
        }, 200);

        sched(() => {
          setChars((p) => ({
            ...p,
            [agent.id]: { ...p[agent.id], status: "done", visible: false },
          }));
        }, 1800);

        // Packet handoff
        const idx = AGENTS.findIndex((a) => a.id === agent.id);
        const next = AGENTS[idx + 1];
        if (next && pi === lastPI + 1) {
          const nDesk = DESKS.find((d) => d.id === next.deskId)!;
          const key = `${desk.id}-${nDesk.id}`;
          setPackets((p) => ({ ...p, [key]: true }));
          sched(() => setPackets((p) => ({ ...p, [key]: false })), 1500);
        }
      }
      // else: not started yet, stay hidden
    });
  }, [phase, addLog, sched]);

  if (phase === "idle" || phase === "no-match") return null;

  return (
    <div className="flex flex-col h-full bg-stone-50">
      <div className="border-b bg-white/95 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Agent Ops Board
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {activeTask || "대기 중"}
            </p>
            <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
              {query}
            </p>
          </div>
          <div className="rounded-xl border bg-slate-50 px-3 py-2 text-right">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              PID
            </p>
            <p className="text-sm font-bold text-foreground">{taskPid || "대기"}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
            {getPhaseLabel(phase)}
          </div>
          <div className="flex-1 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-1.5 rounded-full bg-primary"
              animate={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[11px] font-medium text-muted-foreground">{progress}%</span>
        </div>
      </div>

      {/* Office viewport - fills the space */}
      <div className="flex-1 relative overflow-hidden min-h-0">
        <OfficeEnvironment />
        <Pathways />

        {/* Desks */}
        {DESKS.map((d) => (
          <DeskFurniture key={d.id} desk={d} isActive={activeDesks.has(d.id)} />
        ))}

        {/* Packets */}
        {DESKS.map((d, i) => {
          const next = DESKS[i + 1];
          if (!next) return null;
          return <DataPacket key={`${d.id}-${next.id}`} from={d} to={next} active={!!packets[`${d.id}-${next.id}`]} />;
        })}

        {/* Characters */}
        {AGENTS.map((a) => {
          const c = chars[a.id];
          if (!c.visible) return null;
          return (
            <Character
              key={a.id}
              agent={a}
              x={c.x}
              y={c.y}
              status={c.status}
              direction={c.dir}
              bubble={c.bubble}
            />
          );
        })}

        {/* Active agent count overlay */}
        <div className="absolute right-3 top-3 z-[30] space-y-2">
          <div className="flex items-center gap-1.5 rounded-lg border bg-white/80 px-2.5 py-1.5 text-[10px] font-medium text-muted-foreground shadow-sm backdrop-blur-sm">
            <motion.div
              className="h-2 w-2 rounded-full bg-green-400"
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            {Object.values(chars).filter((c) => c.status === "sitting").length}명 작업 중
          </div>
          <div className="rounded-xl border bg-white/85 p-2 shadow-sm backdrop-blur-sm">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Active Crew
            </p>
            <div className="mt-2 space-y-1.5">
              {AGENTS.filter((a) => a.phases.includes(phase)).map((agent) => (
                <div key={agent.id} className="flex items-center gap-2 text-[10px]">
                  <span className="text-xs">{agent.emoji}</span>
                  <span className="font-semibold text-foreground">{agent.name}</span>
                  <span className="text-muted-foreground">{agent.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Log - compact overlay at bottom */}
      <div className="border-t bg-white/90 backdrop-blur-sm px-4 py-2.5 max-h-28 overflow-auto shrink-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Activity</span>
          <div className="flex-1 h-px bg-border" />
        </div>
        <div className="space-y-0.5">
          {recentLogs.slice(-3).reverse().map((item, i) => (
            <motion.div
              key={`external-${i}-${item}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-[11px]"
            >
              <span className="text-[9px] text-primary font-semibold shrink-0">PID</span>
              <span className="text-foreground">{item}</span>
            </motion.div>
          ))}
          {logs.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-[11px]"
            >
              <span className="text-[9px] text-muted-foreground/40 font-mono shrink-0">{item.time}</span>
              <span className="shrink-0">{item.emoji}</span>
              <span className="text-muted-foreground">{item.text}</span>
            </motion.div>
          ))}
          <div ref={logRef} />
        </div>
      </div>
    </div>
  );
}
