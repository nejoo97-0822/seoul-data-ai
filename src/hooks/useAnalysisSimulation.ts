"use client";

import { useState, useCallback, useRef } from "react";
import { matchScenario } from "@/lib/scenario-matcher";
import { getDatasetById } from "@/data/datasets";
import type { Scenario, ScenarioStep } from "@/data/scenarios";
import type { Dataset } from "@/data/datasets";

export type AnalysisPhase =
  | "idle"
  | "intent"
  | "catalog"
  | "exploration"
  | "calculation"
  | "result"
  | "no-match";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
}

export interface AnalysisState {
  phase: AnalysisPhase;
  currentStep: number;
  messages: ChatMessage[];
  scenario: Scenario | null;
  usedDatasets: Dataset[];
  progress: number;
  query: string;
  activeTask: string;
  taskPid: string;
  recentLogs: string[];
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let msgCounter = 0;
function createMessage(
  role: "user" | "assistant" | "system",
  content: string
): ChatMessage {
  return {
    id: `msg-${++msgCounter}`,
    role,
    content,
    timestamp: Date.now(),
  };
}

export function useAnalysisSimulation() {
  const [state, setState] = useState<AnalysisState>({
    phase: "idle",
    currentStep: -1,
    messages: [],
    scenario: null,
    usedDatasets: [],
    progress: 0,
    query: "",
    activeTask: "",
    taskPid: "",
    recentLogs: [],
  });

  const isRunning = useRef(false);

  const runAnalysis = useCallback(async (query: string) => {
    if (isRunning.current) return;
    isRunning.current = true;

    const scenario = matchScenario(query);

    // Add user message
    setState((prev) => ({
      ...prev,
      phase: "idle",
      query,
      messages: [...prev.messages, createMessage("user", query)],
      scenario: null,
      usedDatasets: [],
      progress: 0,
      currentStep: -1,
      activeTask: "TASK 생성",
      taskPid: "PID-2401",
      recentLogs: [`질문 접수: ${query}`],
    }));

    await delay(500);

    if (!scenario) {
      setState((prev) => ({
        ...prev,
        phase: "no-match",
        messages: [
          ...prev.messages,
          createMessage(
            "assistant",
            "입력하신 질문에 적합한 분석 시나리오를 찾지 못했습니다. 아래 추천 질문을 시도해보세요."
          ),
        ],
        recentLogs: [...prev.recentLogs, "시나리오 매칭 실패"],
      }));
      isRunning.current = false;
      return;
    }

    const usedDatasets = scenario.datasetIds
      .map((id) => getDatasetById(id))
      .filter(Boolean) as Dataset[];

    // Phase 1: Intent parsing
    setState((prev) => ({
      ...prev,
      phase: "intent",
      currentStep: 0,
      scenario,
      messages: [
        ...prev.messages,
        createMessage("system", "질문 의도를 분석하고 있습니다..."),
      ],
      activeTask: "질문 의도 해석",
      recentLogs: [...prev.recentLogs, "PM 에이전트가 질문 의도 분석 시작"],
    }));

    await delay(scenario.steps[0].duration);

    setState((prev) => ({
      ...prev,
      progress: 20,
      messages: [
        ...prev.messages,
        createMessage(
          "assistant",
          `**질문 의도 파악 완료**\n\n• 지역: ${scenario.intent.region}\n• 목적: ${scenario.intent.purpose}\n• 관점: ${scenario.intent.perspective}`
        ),
      ],
      recentLogs: [...prev.recentLogs, "질문 의도 구조화 완료"],
    }));

    await delay(400);

    // Phase 2: Catalog search
    setState((prev) => ({
      ...prev,
      phase: "catalog",
      currentStep: 1,
      messages: [
        ...prev.messages,
        createMessage("system", "내부 카탈로그에서 관련 데이터셋을 검색합니다..."),
      ],
      activeTask: "카탈로그 탐색",
      recentLogs: [...prev.recentLogs, "카탈로그 팀 출근", "검증된 데이터셋 탐색 시작"],
    }));

    // Add datasets one by one
    for (let i = 0; i < usedDatasets.length; i++) {
      await delay(400);
      setState((prev) => ({
        ...prev,
        usedDatasets: usedDatasets.slice(0, i + 1),
        progress: 20 + ((i + 1) / usedDatasets.length) * 20,
        recentLogs: [
          ...prev.recentLogs.slice(-5),
          `${usedDatasets[i].title} 후보 추가`,
        ],
      }));
    }

    setState((prev) => ({
      ...prev,
      messages: [
        ...prev.messages,
        createMessage(
          "assistant",
          `**${usedDatasets.length}개 데이터셋 확인**\n\n${usedDatasets.map((d) => `• ${d.title} (품질 ${d.qualityScore}점)`).join("\n")}`
        ),
      ],
      recentLogs: [...prev.recentLogs, "카탈로그 1차 탐색 종료"],
    }));

    await delay(400);

    // Phase 3: Exploration
    setState((prev) => ({
      ...prev,
      phase: "exploration",
      currentStep: 2,
      progress: 50,
      messages: [
        ...prev.messages,
        createMessage("system", "데이터 결합 가능성과 품질을 검증합니다..."),
      ],
      activeTask: "정합성 검증",
      recentLogs: [...prev.recentLogs, "Validator 에이전트가 데이터 검증 시작"],
    }));

    await delay(scenario.steps[2].duration);

    setState((prev) => ({
      ...prev,
      progress: 65,
      messages: [
        ...prev.messages,
        createMessage(
          "assistant",
          "**데이터 검증 완료**\n\n• 지역 단위 정합성 확인\n• 기준 시점 호환성 확인\n• 결합 키(자치구코드, 행정동코드) 매칭 완료"
        ),
      ],
      recentLogs: [...prev.recentLogs, "지역 단위·시점 검증 완료"],
    }));

    await delay(400);

    // Phase 4: Calculation
    setState((prev) => ({
      ...prev,
      phase: "calculation",
      currentStep: 3,
      messages: [
        ...prev.messages,
        createMessage("system", "지표별 점수를 계산하고 순위를 매기고 있습니다..."),
      ],
      activeTask: "Python / SQL 계산",
      recentLogs: [...prev.recentLogs, "계산 에이전트가 가중치 적용 시작"],
    }));

    // Animate progress
    for (let p = 65; p <= 90; p += 5) {
      await delay(scenario.steps[3].duration / 6);
      setState((prev) => ({ ...prev, progress: p }));
    }

    await delay(400);

    // Phase 5: Result
    setState((prev) => ({
      ...prev,
      phase: "result",
      currentStep: 4,
      progress: 100,
      messages: [
        ...prev.messages,
        createMessage(
          "assistant",
          `**${scenario.title} 분석 결과**\n\n아래에서 구별 비교 결과, 차트, 지도를 확인하세요. 모든 결과에는 사용 데이터 출처, 계산 기준, 주의사항이 함께 제공됩니다.`
        ),
      ],
      activeTask: "결과 리포트 생성",
      recentLogs: [...prev.recentLogs, "리포트 작성 완료", "TASK 종료, 결과 전달"],
    }));

    isRunning.current = false;
  }, []);

  const reset = useCallback(() => {
    isRunning.current = false;
    setState({
      phase: "idle",
      currentStep: -1,
      messages: [],
      scenario: null,
      usedDatasets: [],
      progress: 0,
      query: "",
      activeTask: "",
      taskPid: "",
      recentLogs: [],
    });
  }, []);

  return { state, runAnalysis, reset };
}
