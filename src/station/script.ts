/**
 * Orbital Data Station — World Script
 * ════════════════════════════════════
 * 5 zones, 3 agents, 4 cargo pods, 7 phases.
 * ONE persistent world, NO scene cuts.
 */

import type { StationScript } from "./types";

export const stationScript: StationScript = {
  id: "orbital-station",
  name: "Orbital Data Station",

  /* ── Zones ──────────────────────────── */
  zones: [
    {
      id: "dock",
      label: "DOCK",
      labelKo: "도킹",
      cx: 0.12, cy: 0.35,
      w: 120, h: 90,
      accent: 0x06b6d4,       // cyan
      accentCSS: "#06b6d4",
    },
    {
      id: "archive",
      label: "ARCHIVE BAY",
      labelKo: "아카이브",
      cx: 0.36, cy: 0.24,
      w: 160, h: 110,
      accent: 0x10b981,       // emerald
      accentCSS: "#10b981",
    },
    {
      id: "gate",
      label: "ALIGNMENT GATE",
      labelKo: "정렬 게이트",
      cx: 0.62, cy: 0.32,
      w: 130, h: 85,
      accent: 0xf59e0b,       // amber
      accentCSS: "#f59e0b",
    },
    {
      id: "reactor",
      label: "REACTOR CORE",
      labelKo: "리액터",
      cx: 0.45, cy: 0.65,
      w: 140, h: 110,
      accent: 0x8b5cf6,       // violet
      accentCSS: "#8b5cf6",
    },
    {
      id: "bridge",
      label: "REPORT BRIDGE",
      labelKo: "리포트 브릿지",
      cx: 0.80, cy: 0.58,
      w: 120, h: 95,
      accent: 0xf43f5e,       // rose
      accentCSS: "#f43f5e",
    },
  ],

  /* ── Agents ─────────────────────────── */
  agents: [
    {
      id: "operator",
      name: "Operator",
      nameKo: "운영관",
      color: 0x06b6d4,
      startX: 0.06, startY: 0.50,
    },
    {
      id: "scout",
      name: "Scout",
      nameKo: "탐색관",
      color: 0x10b981,
      startX: 0.28, startY: 0.38,
    },
    {
      id: "analyst",
      name: "Analyst",
      nameKo: "분석관",
      color: 0x8b5cf6,
      startX: 0.50, startY: 0.80,
    },
  ],

  /* ── Cargo Pods ─────────────────────── */
  cargos: [
    { id: "cargo-nursery",  label: "Nurseries",  labelKo: "어린이집",  homeZone: "archive", homeX: 0.29, homeY: 0.24 },
    { id: "cargo-park",     label: "Parks",       labelKo: "공원",     homeZone: "archive", homeX: 0.33, homeY: 0.22 },
    { id: "cargo-clinic",   label: "Clinics",     labelKo: "소아과",   homeZone: "archive", homeX: 0.37, homeY: 0.24 },
    { id: "cargo-safety",   label: "Safety",      labelKo: "안전지수", homeZone: "archive", homeX: 0.41, homeY: 0.22 },
  ],

  /* ── Phases (~22s total loop) ───────── */
  phases: [
    // ── Phase 1: Docking (3.0s) ──
    {
      id: "docking",
      label: "Docking",
      labelKo: "의뢰 도킹",
      description: "시민의 질문이 정거장에 도착합니다",
      durationSec: 3.0,
      commands: [
        { at: 0.0, type: "zone-state",   target: "dock",     params: { state: "active" } },
        { at: 0.2, type: "spawn-card",   target: "request",  params: { x: -0.05, y: 0.42, label: "강남구 보육환경\n분석 요청" } },
        { at: 0.3, type: "agent-walk",   target: "operator", params: { toX: 0.10, toY: 0.42 } },
        { at: 1.0, type: "zone-state",   target: "dock",     params: { state: "processing" } },
        { at: 1.2, type: "effect",       target: "dock",     params: { fx: "docking-arm" } },
        { at: 1.5, type: "agent-work",   target: "operator", params: { duration: 0.8 } },
        { at: 2.3, type: "agent-carry",  target: "operator", params: { item: "request-card" } },
        { at: 2.5, type: "zone-state",   target: "dock",     params: { state: "complete" } },
      ],
    },

    // ── Phase 2: Handoff to Scout (2.0s) ──
    {
      id: "handoff",
      label: "Handoff",
      labelKo: "이관",
      description: "운영관이 요청을 탐색관에게 전달합니다",
      durationSec: 2.0,
      commands: [
        { at: 0.0, type: "agent-walk",  target: "operator", params: { toX: 0.22, toY: 0.36 } },
        { at: 0.0, type: "agent-walk",  target: "scout",    params: { toX: 0.22, toY: 0.36 } },
        { at: 1.0, type: "agent-drop",  target: "operator", params: {} },
        { at: 1.1, type: "agent-carry", target: "scout",    params: { item: "request-card" } },
        { at: 1.3, type: "effect",      target: "handoff",  params: { fx: "flash", x: 0.22, y: 0.36 } },
      ],
    },

    // ── Phase 3: Archive Scan (4.0s) ──
    {
      id: "archive-scan",
      label: "Archive Scan",
      labelKo: "아카이브 스캔",
      description: "탐색관이 아카이브에서 데이터를 찾고 있습니다",
      durationSec: 4.0,
      commands: [
        { at: 0.0, type: "agent-walk",   target: "scout",   params: { toX: 0.35, toY: 0.28 } },
        { at: 0.3, type: "zone-state",   target: "archive", params: { state: "active" } },
        { at: 0.8, type: "agent-drop",   target: "scout",   params: {} },
        { at: 0.9, type: "agent-work",   target: "scout",   params: { duration: 2.0 } },
        { at: 1.0, type: "effect",       target: "archive", params: { fx: "scan-beam" } },
        // Cargo pods light up one by one
        { at: 1.2, type: "cargo-state",  target: "cargo-nursery", params: { state: "scanned" } },
        { at: 1.6, type: "cargo-state",  target: "cargo-park",    params: { state: "scanned" } },
        { at: 2.0, type: "cargo-state",  target: "cargo-clinic",  params: { state: "scanned" } },
        { at: 2.4, type: "cargo-state",  target: "cargo-safety",  params: { state: "scanned" } },
        { at: 2.8, type: "zone-state",   target: "archive",       params: { state: "processing" } },
        // Scout picks them up
        { at: 3.0, type: "agent-carry",  target: "scout",         params: { item: "cargo-bundle", count: 4 } },
        { at: 3.0, type: "cargo-state",  target: "cargo-nursery", params: { state: "carried" } },
        { at: 3.0, type: "cargo-state",  target: "cargo-park",    params: { state: "carried" } },
        { at: 3.0, type: "cargo-state",  target: "cargo-clinic",  params: { state: "carried" } },
        { at: 3.0, type: "cargo-state",  target: "cargo-safety",  params: { state: "carried" } },
        { at: 3.3, type: "zone-state",   target: "archive",       params: { state: "complete" } },
      ],
    },

    // ── Phase 4: Alignment Gate (3.0s) ──
    {
      id: "alignment",
      label: "Alignment",
      labelKo: "데이터 정렬",
      description: "데이터가 게이트를 통과하며 정합됩니다",
      durationSec: 3.0,
      commands: [
        { at: 0.0, type: "agent-walk",   target: "scout",          params: { toX: 0.62, toY: 0.38 } },
        { at: 0.3, type: "zone-state",   target: "gate",           params: { state: "active" } },
        { at: 1.0, type: "agent-drop",   target: "scout",          params: {} },
        { at: 1.0, type: "cargo-state",  target: "cargo-nursery",  params: { state: "gated" } },
        { at: 1.0, type: "cargo-state",  target: "cargo-park",     params: { state: "gated" } },
        { at: 1.0, type: "cargo-state",  target: "cargo-clinic",   params: { state: "gated" } },
        { at: 1.0, type: "cargo-state",  target: "cargo-safety",   params: { state: "gated" } },
        { at: 1.0, type: "zone-state",   target: "gate",           params: { state: "processing" } },
        { at: 1.0, type: "effect",       target: "gate",           params: { fx: "align-pulse" } },
        { at: 2.2, type: "zone-state",   target: "gate",           params: { state: "complete" } },
        { at: 2.3, type: "cargo-move",   target: "all",            params: { toX: 0.45, toY: 0.68 } },
      ],
    },

    // ── Phase 5: Reactor Core (4.0s) ──
    {
      id: "reactor",
      label: "Reactor Core",
      labelKo: "분석 연산",
      description: "리액터 코어가 데이터를 결합 분석합니다",
      durationSec: 4.0,
      commands: [
        { at: 0.0, type: "agent-walk",   target: "analyst",        params: { toX: 0.45, toY: 0.68 } },
        { at: 0.3, type: "zone-state",   target: "reactor",        params: { state: "active" } },
        { at: 0.8, type: "cargo-state",  target: "cargo-nursery",  params: { state: "reacted" } },
        { at: 0.8, type: "cargo-state",  target: "cargo-park",     params: { state: "reacted" } },
        { at: 0.8, type: "cargo-state",  target: "cargo-clinic",   params: { state: "reacted" } },
        { at: 0.8, type: "cargo-state",  target: "cargo-safety",   params: { state: "reacted" } },
        { at: 1.0, type: "zone-state",   target: "reactor",        params: { state: "processing" } },
        { at: 1.0, type: "effect",       target: "reactor",        params: { fx: "reactor-spin" } },
        { at: 1.2, type: "agent-work",   target: "analyst",        params: { duration: 2.0 } },
        { at: 3.0, type: "effect",       target: "reactor",        params: { fx: "reactor-burst" } },
        { at: 3.2, type: "agent-carry",  target: "analyst",        params: { item: "result" } },
        { at: 3.5, type: "zone-state",   target: "reactor",        params: { state: "complete" } },
      ],
    },

    // ── Phase 6: Report Assembly (3.5s) ──
    {
      id: "report-assembly",
      label: "Report Assembly",
      labelKo: "결과 조립",
      description: "분석관이 최종 리포트를 브릿지로 전달합니다",
      durationSec: 3.5,
      commands: [
        { at: 0.0, type: "agent-walk",   target: "analyst", params: { toX: 0.82, toY: 0.56 } },
        { at: 0.3, type: "zone-state",   target: "bridge",  params: { state: "active" } },
        { at: 1.2, type: "agent-drop",   target: "analyst", params: {} },
        { at: 1.2, type: "zone-state",   target: "bridge",  params: { state: "processing" } },
        { at: 1.3, type: "agent-work",   target: "analyst", params: { duration: 1.2 } },
        { at: 1.4, type: "effect",       target: "bridge",  params: { fx: "assemble" } },
        { at: 2.5, type: "spawn-card",   target: "result",  params: { x: 0.82, y: 0.48, label: "강남구 보육환경\n분석 결과" } },
        { at: 2.8, type: "zone-state",   target: "bridge",  params: { state: "complete" } },
      ],
    },

    // ── Phase 7: Reveal (2.5s) ──
    {
      id: "reveal",
      label: "Result Reveal",
      labelKo: "결과 공개",
      description: "분석이 완료되었습니다!",
      durationSec: 2.5,
      commands: [
        { at: 0.0, type: "reveal-card",  target: "result",  params: {} },
        { at: 0.3, type: "effect",       target: "bridge",  params: { fx: "celebration" } },
        { at: 0.5, type: "cargo-state",  target: "cargo-nursery",  params: { state: "delivered" } },
        { at: 0.5, type: "cargo-state",  target: "cargo-park",     params: { state: "delivered" } },
        { at: 0.5, type: "cargo-state",  target: "cargo-clinic",   params: { state: "delivered" } },
        { at: 0.5, type: "cargo-state",  target: "cargo-safety",   params: { state: "delivered" } },
      ],
    },
  ],
};
