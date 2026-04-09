"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Send,
  Bot,
  User,
  Loader2,
  CheckCircle2,
  Circle,
  Database,
  AlertTriangle,
  Info,
  ChevronRight,
  BarChart3,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAnalysisSimulation } from "@/hooks/useAnalysisSimulation";
import type { AnalysisPhase, ChatMessage } from "@/hooks/useAnalysisSimulation";
import { AgentWorkflow } from "@/components/analysis/AgentWorkflow";
import { recommendedQuestions } from "@/data/scenarios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

function AnalysisContent() {
  const searchParams = useSearchParams();
  const [input, setInput] = useState("");
  const { state, runAnalysis, reset } = useAnalysisSimulation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasAutoRun = useRef(false);

  const initialQuery = searchParams.get("q");

  useEffect(() => {
    if (initialQuery && !hasAutoRun.current) {
      hasAutoRun.current = true;
      runAnalysis(initialQuery);
    }
  }, [initialQuery, runAnalysis]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.messages]);

  const handleSubmit = () => {
    if (!input.trim()) return;
    runAnalysis(input.trim());
    setInput("");
  };

  const phaseSteps: { phase: AnalysisPhase; label: string }[] = [
    { phase: "intent", label: "의도 파악" },
    { phase: "catalog", label: "카탈로그 탐색" },
    { phase: "exploration", label: "데이터 검증" },
    { phase: "calculation", label: "분석 수행" },
    { phase: "result", label: "결과 생성" },
  ];

  const currentPhaseIdx = phaseSteps.findIndex(
    (s) => s.phase === state.phase
  );

  const scenario = state.scenario;
  const result = scenario?.result;

  // Radar chart data
  const radarData =
    result && result.rankings[0]
      ? result.radarCategories.map((cat) => {
          const top3 = result.rankings.slice(0, 3);
          const entry: Record<string, string | number> = { category: cat };
          top3.forEach((r) => {
            entry[r.name] = r.dimensions[cat] || 0;
          });
          return entry;
        })
      : [];

  // Bar chart data
  const barData = result
    ? result.rankings.map((r) => ({
        name: r.name,
        score: r.totalScore,
      }))
    : [];

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col lg:flex-row">
      {/* Left Panel - Chat */}
      <div className="flex flex-1 flex-col border-r lg:max-w-[480px] min-h-0 overflow-hidden">
        {/* Step indicators */}
        {state.phase !== "idle" && state.phase !== "no-match" && (
          <div className="border-b px-4 py-3 overflow-x-auto">
            <div className="flex items-center gap-1.5 mb-2 whitespace-nowrap">
              {phaseSteps.map((step, i) => {
                const isActive = step.phase === state.phase;
                const isDone = currentPhaseIdx > i;
                return (
                  <div key={step.phase} className="flex items-center gap-1.5 shrink-0">
                    {i > 0 && (
                      <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/30" />
                    )}
                    <div
                      className={`flex items-center gap-1 text-xs font-medium whitespace-nowrap ${
                        isDone
                          ? "text-seoul-600"
                          : isActive
                            ? "text-primary"
                            : "text-muted-foreground/50"
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      ) : isActive ? (
                        <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
                      ) : (
                        <Circle className="h-3.5 w-3.5 shrink-0" />
                      )}
                      <span>{step.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <Progress value={state.progress} className="h-1" />
          </div>
        )}

        {/* Used datasets */}
        {state.usedDatasets.length > 0 && (
          <div className="border-b px-4 py-2.5">
            <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
              <Database className="h-3 w-3" />
              사용 데이터셋
            </p>
            <div className="flex flex-wrap gap-1.5">
              <AnimatePresence>
                {state.usedDatasets.map((ds) => (
                  <motion.div
                    key={ds.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Badge
                      variant="secondary"
                      className={`text-[10px] ${ds.categoryColor}`}
                    >
                      {ds.title}
                    </Badge>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Messages */}
        <ScrollArea className="flex-1 px-4 py-4">
          {state.messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Bot className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">
                서울 데이터 AI
              </p>
              <p className="text-xs text-muted-foreground max-w-xs">
                서울시 공공데이터를 기반으로 질문에 답합니다.
                아래에 자유롭게 질문을 입력하세요.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {recommendedQuestions.slice(0, 4).map((q) => (
                  <button
                    key={q.text}
                    onClick={() => {
                      setInput(q.text);
                      runAnalysis(q.text);
                    }}
                    className="rounded-lg border px-3 py-2 text-xs text-muted-foreground hover:bg-muted transition-colors text-left"
                  >
                    {q.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {state.messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}

            {state.phase === "no-match" && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm text-amber-800 mb-3">
                  추천 질문을 시도해보세요:
                </p>
                <div className="space-y-2">
                  {recommendedQuestions.slice(0, 4).map((q) => (
                    <button
                      key={q.text}
                      onClick={() => runAnalysis(q.text)}
                      className="block w-full text-left rounded-md bg-white px-3 py-2 text-sm text-foreground hover:bg-amber-50 border border-amber-200 transition-colors"
                    >
                      {q.text}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>

        {/* Input */}
        <div className="border-t p-4">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="궁금한 것을 질문해보세요..."
              disabled={
                state.phase !== "idle" &&
                state.phase !== "result" &&
                state.phase !== "no-match"
              }
              className="h-11 w-full rounded-xl border bg-white pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
            />
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={
                !input.trim() ||
                (state.phase !== "idle" &&
                  state.phase !== "result" &&
                  state.phase !== "no-match")
              }
              className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg p-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Right Panel - Visualization */}
      <div className="flex-1 min-h-0 overflow-auto bg-muted/20">
        {state.phase === "result" && result ? (
          <div className="p-6">
            <Tabs defaultValue="ranking">
              <TabsList className="mb-4">
                <TabsTrigger value="ranking">순위 비교</TabsTrigger>
                <TabsTrigger value="radar">레이더 차트</TabsTrigger>
                <TabsTrigger value="bar">막대 차트</TabsTrigger>
                <TabsTrigger value="sources">데이터 출처</TabsTrigger>
              </TabsList>

              <TabsContent value="ranking">
                <div className="rounded-lg border bg-card">
                  <div className="border-b px-4 py-3">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-amber-500" />
                      {scenario?.title} — 구별 순위
                    </h3>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[60px]">순위</TableHead>
                        <TableHead>자치구</TableHead>
                        <TableHead className="w-[100px]">종합 점수</TableHead>
                        {result.radarCategories.map((cat) => (
                          <TableHead key={cat} className="text-xs w-[80px]">
                            {cat}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.rankings.map((r) => (
                        <TableRow key={r.name}>
                          <TableCell>
                            <span
                              className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                                r.rank <= 3
                                  ? "bg-seoul-100 text-seoul-700"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {r.rank}
                            </span>
                          </TableCell>
                          <TableCell className="font-medium">
                            {r.name}
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-seoul-600">
                              {r.totalScore}
                            </span>
                          </TableCell>
                          {result.radarCategories.map((cat) => (
                            <TableCell
                              key={cat}
                              className="text-xs text-muted-foreground"
                            >
                              {r.dimensions[cat]}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="radar">
                <div className="rounded-lg border bg-card p-4">
                  <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-seoul-500" />
                    상위 3개 구 지표 비교
                  </h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis
                        dataKey="category"
                        tick={{ fontSize: 11 }}
                      />
                      <PolarRadiusAxis
                        angle={90}
                        domain={[0, 100]}
                        tick={{ fontSize: 10 }}
                      />
                      {result.rankings.slice(0, 3).map((r, i) => (
                        <Radar
                          key={r.name}
                          name={r.name}
                          dataKey={r.name}
                          stroke={
                            ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)"][i]
                          }
                          fill={
                            ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)"][i]
                          }
                          fillOpacity={0.15}
                          strokeWidth={2}
                        />
                      ))}
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                  <div className="mt-2 flex justify-center gap-4">
                    {result.rankings.slice(0, 3).map((r, i) => (
                      <div
                        key={r.name}
                        className="flex items-center gap-1.5 text-xs"
                      >
                        <div
                          className="h-2.5 w-2.5 rounded-full"
                          style={{
                            backgroundColor: [
                              "var(--color-chart-1)",
                              "var(--color-chart-2)",
                              "var(--color-chart-3)",
                            ][i],
                          }}
                        />
                        {r.name}
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="bar">
                <div className="rounded-lg border bg-card p-4">
                  <h3 className="text-sm font-semibold mb-4">
                    종합 점수 비교
                  </h3>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={barData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fontSize: 11 }}
                        width={60}
                      />
                      <Tooltip />
                      <Bar
                        dataKey="score"
                        fill="var(--color-chart-1)"
                        radius={[0, 4, 4, 0]}
                        barSize={24}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="sources">
                <div className="space-y-4">
                  {/* Methodology */}
                  <div className="rounded-lg border bg-card p-4">
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
                      <Info className="h-4 w-4 text-seoul-500" />
                      분석 방법론
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          평가 기준
                        </p>
                        <ul className="space-y-1">
                          {result.methodology.criteria.map((c, i) => (
                            <li
                              key={i}
                              className="text-sm text-foreground flex items-start gap-2"
                            >
                              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-seoul-400" />
                              {c}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          가중치
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(result.methodology.weights).map(
                            ([key, val]) => (
                              <Badge
                                key={key}
                                variant="outline"
                                className="text-xs"
                              >
                                {key}: {(val * 100).toFixed(0)}%
                              </Badge>
                            )
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          기준 시점
                        </p>
                        <p className="text-sm text-foreground">
                          {result.methodology.timePeriod}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Datasets used */}
                  <div className="rounded-lg border bg-card p-4">
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
                      <Database className="h-4 w-4 text-seoul-500" />
                      사용 데이터셋
                    </h3>
                    <div className="space-y-2">
                      {state.usedDatasets.map((ds) => (
                        <div
                          key={ds.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-foreground">{ds.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {ds.source} · {ds.updateDate}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Limitations */}
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5 text-amber-800">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      해석 시 주의사항
                    </h3>
                    <ul className="space-y-1.5">
                      {result.methodology.limitations.map((l, i) => (
                        <li
                          key={i}
                          className="text-sm text-amber-800 flex items-start gap-2"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                          {l}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : state.phase !== "idle" && state.phase !== "no-match" ? (
          <AgentWorkflow
            phase={state.phase}
            progress={state.progress}
            usedDatasets={state.usedDatasets}
            query={state.query}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center max-w-sm">
              <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground/20" />
              <p className="mt-4 text-sm text-muted-foreground">
                질문을 입력하면 분석 결과가 여기에 표시됩니다
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  if (message.role === "system") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2 text-xs text-muted-foreground"
      >
        <Loader2 className="h-3 w-3 animate-spin" />
        {message.content}
      </motion.div>
    );
  }

  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : ""}`}
    >
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
          isUser ? "bg-foreground" : "bg-seoul-100"
        }`}
      >
        {isUser ? (
          <User className="h-3.5 w-3.5 text-background" />
        ) : (
          <Bot className="h-3.5 w-3.5 text-seoul-600" />
        )}
      </div>
      <div
        className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-foreground text-background"
            : "bg-card border text-foreground"
        }`}
      >
        {message.content.split("\n").map((line, i) => (
          <p key={i} className={i > 0 ? "mt-1" : ""}>
            {line.startsWith("**") && line.endsWith("**") ? (
              <strong className="font-semibold">
                {line.replace(/\*\*/g, "")}
              </strong>
            ) : line.startsWith("• ") ? (
              <span className="flex items-start gap-1.5">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-current opacity-40" />
                {line.slice(2)}
              </span>
            ) : (
              line
            )}
          </p>
        ))}
      </div>
    </motion.div>
  );
}

export default function AnalysisPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100vh-64px)] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <AnalysisContent />
    </Suspense>
  );
}
