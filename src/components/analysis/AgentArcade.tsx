"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Bot,
  CheckCircle2,
  ChevronRight,
  Database,
  Play,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

type NodeId = "intent" | "catalog" | "validation" | "calculation" | "report";
type AgentId = "pm" | "scout" | "validator" | "engineer" | "reporter";

interface FlowNode {
  id: NodeId;
  title: string;
  subtitle: string;
  x: number;
  y: number;
  accent: string;
  icon: string;
}

interface Agent {
  id: AgentId;
  name: string;
  role: string;
  accent: string;
}

interface StepDataset {
  name: string;
  quality: number;
  updatedAt: string;
}

interface Step {
  id: string;
  nodeId: NodeId;
  agentId: AgentId;
  title: string;
  detail: string;
  note: string;
  speech: string;
  datasets: StepDataset[];
}

const PRESETS = [
  "서울에서 야간 귀가가 비교적 안전한 지역을 분석해줘",
  "1인 가구가 생활하기 편한 서울 지역을 비교해줘",
  "공원, 병원, 교통 접근성이 좋은 지역을 찾아줘",
];

const FLOW_NODES: FlowNode[] = [
  {
    id: "intent",
    title: "질문 해석",
    subtitle: "지역, 목적, 비교 관점 파악",
    x: 8,
    y: 18,
    accent: "#6366f1",
    icon: "🧠",
  },
  {
    id: "catalog",
    title: "카탈로그 탐색",
    subtitle: "검증된 데이터셋 후보 수집",
    x: 31,
    y: 18,
    accent: "#0ea5e9",
    icon: "📚",
  },
  {
    id: "validation",
    title: "데이터 검증",
    subtitle: "단위·시점·조인 키 확인",
    x: 56,
    y: 18,
    accent: "#f59e0b",
    icon: "🧪",
  },
  {
    id: "calculation",
    title: "점수 계산",
    subtitle: "Python / SQL 계산",
    x: 21,
    y: 60,
    accent: "#ef4444",
    icon: "⚙️",
  },
  {
    id: "report",
    title: "결과 생성",
    subtitle: "리포트 / 지도 / 설명",
    x: 51,
    y: 60,
    accent: "#10b981",
    icon: "📊",
  },
];

const AGENTS: Agent[] = [
  { id: "pm", name: "아린", role: "질문 해석", accent: "#6366f1" },
  { id: "scout", name: "민준", role: "데이터 탐색", accent: "#0ea5e9" },
  { id: "validator", name: "서윤", role: "정합성 검증", accent: "#f59e0b" },
  { id: "engineer", name: "도현", role: "계산 수행", accent: "#ef4444" },
  { id: "reporter", name: "지우", role: "결과 설명", accent: "#10b981" },
];

function buildSteps(query: string): Step[] {
  return [
    {
      id: "intent",
      nodeId: "intent",
      agentId: "pm",
      title: "질문 의도 분석",
      detail: query,
      note: "질문에서 지역 범위, 비교 목적, 필요한 지표를 추출했습니다.",
      speech: "질문을 분석 시나리오로 변환할게요.",
      datasets: [{ name: "질문 의도 분류 모델", quality: 98, updatedAt: "실시간" }],
    },
    {
      id: "catalog",
      nodeId: "catalog",
      agentId: "scout",
      title: "관련 데이터셋 탐색",
      detail: "내부 카탈로그에서 관련 데이터셋을 우선 수집합니다.",
      note: "질문에 맞는 검증된 공개데이터 후보를 1차 확보했습니다.",
      speech: "카탈로그에서 연결 가능한 데이터셋을 찾는 중입니다.",
      datasets: [
        { name: "서울시 CCTV 현황", quality: 96, updatedAt: "2026.03" },
        { name: "서울 생활인구 데이터", quality: 88, updatedAt: "2026.01" },
        { name: "대중교통 접근성", quality: 92, updatedAt: "2026.03" },
      ],
    },
    {
      id: "validation",
      nodeId: "validation",
      agentId: "validator",
      title: "정합성 및 결합 검증",
      detail: "행정동 단위, 기준 시점, 결합 키를 확인합니다.",
      note: "비교 가능한 데이터만 남기고 지역 단위와 시점을 정렬했습니다.",
      speech: "단위와 시점이 맞지 않는 데이터는 제외할게요.",
      datasets: [
        { name: "행정동 매핑 테이블", quality: 99, updatedAt: "2026.03" },
        { name: "정합성 검증 룰셋", quality: 94, updatedAt: "자동 검증" },
      ],
    },
    {
      id: "calculation",
      nodeId: "calculation",
      agentId: "engineer",
      title: "가중치 계산 및 순위화",
      detail: "Python / SQL 계산으로 지표별 점수와 최종 순위를 산출합니다.",
      note: "시나리오별 가중치를 적용해 비교 점수와 순위를 계산했습니다.",
      speech: "계산 엔진 가동. 점수화와 순위 계산을 시작합니다.",
      datasets: [
        { name: "시나리오 가중치 세트", quality: 93, updatedAt: "2026.02" },
        { name: "동별 비교 점수", quality: 95, updatedAt: "방금 계산" },
      ],
    },
    {
      id: "report",
      nodeId: "report",
      agentId: "reporter",
      title: "결과 설명 및 시각화",
      detail: "지도, 순위, 해석 시 주의사항을 이해하기 쉽게 정리합니다.",
      note: "결과 카드, 지도 레이어, 설명 문구를 함께 준비했습니다.",
      speech: "이제 사용자가 이해할 수 있는 결과 화면으로 정리합니다.",
      datasets: [
        { name: "지도 시각화 레이어", quality: 91, updatedAt: "방금 생성" },
        { name: "설명 템플릿", quality: 96, updatedAt: "실시간" },
      ],
    },
  ];
}

function getNode(id: NodeId) {
  return FLOW_NODES.find((node) => node.id === id)!;
}

function getAgent(id: AgentId) {
  return AGENTS.find((agent) => agent.id === id)!;
}

function blockShade(hex: string, opacity = 0.18) {
  const normalized = hex.replace("#", "");
  const r = parseInt(normalized.substring(0, 2), 16);
  const g = parseInt(normalized.substring(2, 4), 16);
  const b = parseInt(normalized.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

function PhaseRail({ activeIndex }: { activeIndex: number }) {
  const stepLabels = [
    "의도 파악",
    "카탈로그 탐색",
    "데이터 검증",
    "분석 수행",
    "결과 생성",
  ];

  return (
    <div className="mt-6 flex flex-wrap items-center gap-2">
      {stepLabels.map((label, index) => (
        <div key={label} className="flex items-center gap-2">
          {index > 0 ? (
            <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
          ) : null}
          <div
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              index < activeIndex
                ? "bg-seoul-100 text-seoul-700"
                : index === activeIndex
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}

function PathLayer({ activeIndex }: { activeIndex: number }) {
  const routes: [NodeId, NodeId][] = [
    ["intent", "catalog"],
    ["catalog", "validation"],
    ["validation", "calculation"],
    ["calculation", "report"],
  ];

  return (
    <svg className="absolute inset-0 h-full w-full">
      {routes.map(([fromId, toId], index) => {
        const from = getNode(fromId);
        const to = getNode(toId);
        const active = index < activeIndex;
        return (
          <path
            key={`${fromId}-${toId}`}
            d={`M ${from.x + 16}% ${from.y + 10}% C ${from.x + 24}% ${from.y + 10}%, ${to.x - 6}% ${to.y + 10}%, ${to.x}% ${to.y + 10}%`}
            fill="none"
            stroke={active ? "rgba(37,99,235,0.9)" : "rgba(148,163,184,0.25)"}
            strokeWidth={active ? 5 : 3}
            strokeDasharray={active ? "0" : "10 12"}
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

function IsoPlatform({
  x,
  y,
  width,
  depth,
  height,
  color,
  glow,
  active,
  children,
}: {
  x: number;
  y: number;
  width: number;
  depth: number;
  height: number;
  color: string;
  glow: string;
  active: boolean;
  children?: ReactNode;
}) {
  const top = `${x}% ${y}%, ${x + width}% ${y}%, ${x + width + depth}% ${y + depth}%, ${x + depth}% ${y + depth}%`;
  const side = `${x + width}% ${y}%, ${x + width + depth}% ${y + depth}%, ${x + width + depth}% ${y + depth + height}%, ${x + width}% ${y + height}%`;
  const front = `${x + depth}% ${y + depth}%, ${x + width + depth}% ${y + depth}%, ${x + width + depth}% ${y + depth + height}%, ${x + depth}% ${y + depth + height}%`;

  return (
    <div className="absolute inset-0">
      <svg className="absolute inset-0 h-full w-full overflow-visible">
        <polygon
          points={top}
          fill={color}
          opacity={0.95}
          stroke="rgba(255,255,255,0.7)"
          strokeWidth="1"
          style={{
            filter: active ? `drop-shadow(0 0 18px ${glow})` : undefined,
          }}
        />
        <polygon points={side} fill="rgba(15,23,42,0.18)" />
        <polygon points={front} fill="rgba(15,23,42,0.12)" />
      </svg>
      {children}
    </div>
  );
}

function StationBlock({
  node,
  active,
  completed,
}: {
  node: FlowNode;
  active: boolean;
  completed: boolean;
}) {
  return (
    <div className="absolute inset-0">
      <IsoPlatform
        x={node.x}
        y={node.y}
        width={14}
        depth={4}
        height={8}
        color={blockShade(node.accent, active ? 0.3 : 0.2)}
        glow={blockShade(node.accent, 0.55)}
        active={active}
      >
        <div
          className="absolute"
          style={{
            left: `${node.x + 1.6}%`,
            top: `${node.y - 2.2}%`,
            width: "180px",
          }}
        >
          <div
            className={`rounded-[22px] border bg-white p-4 shadow-sm transition-all ${
              active
                ? "border-primary/30 shadow-lg ring-4 ring-primary/10"
                : completed
                  ? "border-seoul-200"
                  : "border-border"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-2xl text-lg"
                  style={{
                    backgroundColor: blockShade(node.accent, 0.18),
                    color: node.accent,
                  }}
                >
                  {node.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{node.title}</p>
                  <p className="text-[11px] text-muted-foreground">{node.subtitle}</p>
                </div>
              </div>
              {active ? (
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  진행 중
                </Badge>
              ) : completed ? (
                <Badge variant="secondary" className="bg-seoul-100 text-seoul-700">
                  완료
                </Badge>
              ) : (
                <Badge variant="secondary">대기</Badge>
              )}
            </div>
          </div>
        </div>
      </IsoPlatform>
    </div>
  );
}

function BlockAgent({
  agent,
  x,
  y,
  active,
  speech,
}: {
  agent: Agent;
  x: number;
  y: number;
  active: boolean;
  speech?: string;
}) {
  return (
    <motion.div
      className="absolute z-30"
      animate={{ left: `${x}%`, top: `${y}%` }}
      transition={{ duration: 1.0, ease: "easeInOut" }}
      style={{ transform: "translate(-50%, -50%)" }}
    >
      <div className="flex flex-col items-center">
        <AnimatePresence>
          {active && speech ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mb-2 max-w-[220px] rounded-2xl border bg-white px-3 py-2 text-center text-[11px] font-medium text-foreground shadow-lg"
            >
              {speech}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="rounded-full bg-foreground px-2 py-1 text-[10px] font-semibold text-background shadow">
          {agent.name}
        </div>
        <div className={`mt-1 ${active ? "drop-shadow-[0_0_18px_rgba(37,99,235,0.28)]" : ""}`}>
          <div className="relative h-16 w-14">
            <div className="absolute bottom-0 left-1/2 h-2 w-10 -translate-x-1/2 rounded-full bg-black/10" />
            <div
              className="absolute left-1/2 top-2 h-6 w-6 -translate-x-1/2 rounded-md border-2 border-white/70"
              style={{ backgroundColor: blockShade(agent.accent, 0.32) }}
            />
            <div className="absolute left-1/2 top-7 h-7 w-8 -translate-x-1/2 rounded-sm bg-slate-800" />
            <div
              className="absolute left-[22%] top-7 h-7 w-3 rounded-sm"
              style={{ backgroundColor: agent.accent }}
            />
            <div
              className="absolute right-[22%] top-7 h-7 w-3 rounded-sm"
              style={{ backgroundColor: agent.accent }}
            />
            <div className="absolute bottom-2 left-[30%] h-4 w-2 rounded-sm bg-slate-700" />
            <div className="absolute bottom-2 right-[30%] h-4 w-2 rounded-sm bg-slate-700" />
          </div>
        </div>
        <div className="mt-1 rounded-full bg-white px-2 py-0.5 text-[10px] text-muted-foreground shadow-sm">
          {agent.role}
        </div>
      </div>
    </motion.div>
  );
}

function CubePacket({
  from,
  to,
  active,
}: {
  from: FlowNode;
  to: FlowNode;
  active: boolean;
}) {
  if (!active) return null;
  return (
    <motion.div
      className="absolute z-20"
      initial={{
        left: `${from.x + 10}%`,
        top: `${from.y + 18}%`,
        opacity: 0,
        scale: 0.75,
      }}
      animate={{
        left: [`${from.x + 10}%`, `${(from.x + to.x) / 2 + 8}%`, `${to.x + 2}%`],
        top: [`${from.y + 18}%`, `${Math.min(from.y, to.y) + 12}%`, `${to.y + 18}%`],
        opacity: [0, 1, 0],
        scale: [0.75, 1.05, 0.75],
      }}
      transition={{ duration: 1.15, ease: "easeInOut" }}
      style={{ transform: "translate(-50%, -50%)" }}
    >
      <div className="relative h-8 w-8 rotate-45 rounded-[6px] border border-primary/20 bg-primary/10 shadow-md">
        <div className="absolute inset-1 rounded-[4px] bg-primary/15" />
      </div>
    </motion.div>
  );
}

export function AgentArcade() {
  const [query, setQuery] = useState(PRESETS[0]);
  const [running, setRunning] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const steps = useMemo(() => buildSteps(query), [query]);
  const current = steps[activeIndex];
  const currentNode = getNode(current.nodeId);
  const progress = Math.round(((activeIndex + 1) / steps.length) * 100);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev >= steps.length - 1 ? 0 : prev + 1));
    }, 2000);
    return () => window.clearInterval(timer);
  }, [running, steps.length]);

  const logs = steps.slice(0, activeIndex + 1).reverse();
  const previousNode =
    activeIndex > 0 ? getNode(steps[activeIndex - 1].nodeId) : currentNode;

  const agentPositions = AGENTS.map((agent, index) => {
    const owned =
      [...steps.slice(0, activeIndex + 1)]
        .reverse()
        .find((step) => step.agentId === agent.id) ?? steps[0];
    const node = getNode(owned.nodeId);
    return {
      agent,
      node,
      x: node.x + (index % 2 === 0 ? 9 : 15),
      y: node.y + (index > 1 ? 34 : 30),
      active: current.agentId === agent.id,
      speech: current.agentId === agent.id ? current.speech : "",
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-seoul-50 via-white to-muted/20">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="rounded-3xl border bg-white shadow-sm">
          <div className="border-b px-6 py-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 text-sm font-medium">
                  <Sparkles className="h-3.5 w-3.5" />
                  Agent Canvas Demo
                </Badge>
                <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  블록형 에이전트가 분석 파이프라인을 수행하는 화면
                </h1>
                <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
                  기존 서비스 톤은 유지하면서, 에이전트가 블록 캐릭터처럼
                  스테이션을 오가며 질문 해석, 데이터 탐색, 검증, 계산, 결과 생성
                  단계를 수행하는 장면을 보여줍니다.
                </p>
              </div>

              <div className="rounded-2xl border bg-muted/40 px-4 py-3 text-right">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Analysis PID
                </p>
                <p className="mt-1 text-2xl font-bold text-foreground">PID-2401</p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 lg:flex-row">
              <div className="flex-1">
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="h-12 rounded-2xl bg-white px-4"
                  placeholder="예: 서울에서 야간 귀가가 비교적 안전한 지역을 분석해줘"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setActiveIndex(0);
                    setRunning(true);
                  }}
                  className="h-12 rounded-2xl px-5"
                >
                  <Play className="size-4" />
                  실행
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setRunning(false);
                    setActiveIndex(0);
                  }}
                  className="h-12 rounded-2xl px-4"
                >
                  <RefreshCw className="size-4" />
                </Button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => {
                    setQuery(preset);
                    setActiveIndex(0);
                    setRunning(true);
                  }}
                  className="rounded-full border border-border bg-white px-4 py-2 text-sm text-foreground transition hover:border-primary/30 hover:bg-seoul-50"
                >
                  {preset}
                </button>
              ))}
            </div>

            <PhaseRail activeIndex={activeIndex} />
          </div>

          <div className="grid gap-6 p-6 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-3xl border bg-muted/20 p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-seoul-700">Block Agent Canvas</p>
                  <p className="text-xs text-muted-foreground">
                    블록형 station과 캐릭터로 단계별 작업을 시각화합니다
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
                  <span className="size-2 rounded-full bg-emerald-400" />
                  {agentPositions.filter((item) => item.active).length}명 작업 중
                </div>
              </div>

              <div className="relative h-[650px] overflow-hidden rounded-[28px] border bg-[radial-gradient(ellipse_at_top,_var(--color-seoul-50)_0%,_white_55%)]">
                <div
                  className="absolute inset-0 opacity-[0.52]"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(148,163,184,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.12) 1px, transparent 1px)",
                    backgroundSize: "36px 36px",
                  }}
                />

                <PathLayer activeIndex={activeIndex} />

                {FLOW_NODES.map((node, index) => (
                  <StationBlock
                    key={node.id}
                    node={node}
                    active={node.id === current.nodeId}
                    completed={index < activeIndex}
                  />
                ))}

                <CubePacket from={previousNode} to={currentNode} active={activeIndex > 0} />

                {agentPositions.map((item) => (
                  <BlockAgent
                    key={item.agent.id}
                    agent={item.agent}
                    x={item.x}
                    y={item.y}
                    active={item.active}
                    speech={item.speech}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-3xl border bg-card p-5">
                <div className="flex items-center gap-2 text-sm font-medium text-seoul-700">
                  <WandSparkles className="h-4 w-4" />
                  현재 작업
                </div>
                <h2 className="mt-3 text-2xl font-semibold text-foreground">
                  {current.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {current.detail}
                </p>

                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
                    <span>진행률</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <div className="mt-5 rounded-2xl border bg-muted/30 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-seoul-700">
                    <Bot className="h-4 w-4" />
                    System Note
                  </div>
                  <p className="mt-2 text-sm leading-6 text-foreground">
                    {current.note}
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border bg-card p-5">
                <div className="flex items-center gap-2 text-sm font-medium text-seoul-700">
                  <Activity className="h-4 w-4" />
                  활성 에이전트
                </div>
                <div className="mt-4 space-y-3">
                  {agentPositions.map((item) => (
                    <div
                      key={item.agent.id}
                      className={`rounded-2xl border px-4 py-3 ${
                        item.active
                          ? "border-primary/20 bg-primary/5"
                          : "border-border bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-10 w-10 items-center justify-center rounded-2xl"
                            style={{
                              backgroundColor: blockShade(item.agent.accent, 0.16),
                            }}
                          >
                            <div className="h-4 w-4 rounded-sm bg-slate-800" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {item.agent.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.agent.role}
                            </p>
                          </div>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          <p>{item.node.title}</p>
                          <p>{item.active ? "작업 중" : "대기"}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border bg-card p-5">
                <div className="flex items-center gap-2 text-sm font-medium text-seoul-700">
                  <ShieldCheck className="h-4 w-4" />
                  사용 데이터셋
                </div>
                <div className="mt-4 space-y-3">
                  {current.datasets.map((dataset) => (
                    <div
                      key={dataset.name}
                      className="rounded-2xl border bg-muted/20 px-4 py-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-foreground">
                          {dataset.name}
                        </p>
                        <Badge variant="secondary">품질 {dataset.quality}</Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {dataset.updatedAt}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border bg-card p-5">
                <div className="flex items-center gap-2 text-sm font-medium text-seoul-700">
                  <Database className="h-4 w-4" />
                  Trace Notes
                </div>
                <div className="mt-4 space-y-3">
                  {logs.map((step, index) => (
                    <motion.div
                      key={`${step.id}-${index}`}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="rounded-2xl border bg-muted/20 px-4 py-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-foreground">
                          {step.title}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          {getAgent(step.agentId).name}
                          <Search className="h-3 w-3" />
                          {getNode(step.nodeId).title}
                        </div>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {step.note}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t bg-muted/20 px-6 py-5">
            <div className="flex items-center gap-2 text-sm font-medium text-seoul-700">
              <CheckCircle2 className="h-4 w-4" />
              Activity Feed
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {logs.map((step, index) => (
                <motion.div
                  key={`feed-${step.id}-${index}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border bg-white px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">
                      {step.title}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {getAgent(step.agentId).name}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {step.note}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
