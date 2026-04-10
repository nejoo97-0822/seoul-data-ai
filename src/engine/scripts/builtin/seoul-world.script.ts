/**
 * Seoul Data AI — Persistent World Script
 * ════════════════════════════════════════
 * One world, 5 zones, 1 agent, 4 data packets, 5 phases.
 * Everything happens in the same space — no scene cuts.
 */

import type { WorldScript } from "../../core/types";

export const seoulWorldScript: WorldScript = {
  id: "seoul-world",
  name: "Seoul Data AI World",
  themeId: "seoul-data-hub",

  // ─── Fixed Zones (always visible) ───────────────────
  zones: [
    {
      id: "intake",
      label: "INTAKE",
      labelKo: "접수",
      center: { x: 0.13, y: 0.30 },
      size: { x: 120, y: 90 },
      accent: "#0EA5E9",
      accentSoft: "#E0F2FE",
    },
    {
      id: "catalog",
      label: "CATALOG",
      labelKo: "탐색",
      center: { x: 0.38, y: 0.30 },
      size: { x: 160, y: 110 },
      accent: "#10B981",
      accentSoft: "#D1FAE5",
    },
    {
      id: "calibration",
      label: "CALIBRATION",
      labelKo: "정합",
      center: { x: 0.65, y: 0.30 },
      size: { x: 130, y: 90 },
      accent: "#F59E0B",
      accentSoft: "#FEF3C7",
    },
    {
      id: "reactor",
      label: "REACTOR",
      labelKo: "분석",
      center: { x: 0.38, y: 0.74 },
      size: { x: 140, y: 120 },
      accent: "#8B5CF6",
      accentSoft: "#EDE9FE",
    },
    {
      id: "report",
      label: "REPORT",
      labelKo: "리포트",
      center: { x: 0.75, y: 0.74 },
      size: { x: 130, y: 100 },
      accent: "#F43F5E",
      accentSoft: "#FFE4E6",
    },
  ],

  // ─── Conveyor Paths ─────────────────────────────────
  paths: [
    {
      id: "intake→catalog",
      from: "intake",
      to: "catalog",
      waypoints: [
        { x: 0.20, y: 0.30 },
        { x: 0.30, y: 0.30 },
      ],
    },
    {
      id: "catalog→calibration",
      from: "catalog",
      to: "calibration",
      waypoints: [
        { x: 0.46, y: 0.30 },
        { x: 0.58, y: 0.30 },
      ],
    },
    {
      id: "calibration→reactor",
      from: "calibration",
      to: "reactor",
      waypoints: [
        { x: 0.65, y: 0.38 },
        { x: 0.65, y: 0.52 },
        { x: 0.50, y: 0.62 },
        { x: 0.38, y: 0.66 },
      ],
    },
    {
      id: "reactor→report",
      from: "reactor",
      to: "report",
      waypoints: [
        { x: 0.46, y: 0.74 },
        { x: 0.58, y: 0.74 },
        { x: 0.68, y: 0.74 },
      ],
    },
  ],

  // ─── Agent ──────────────────────────────────────────
  agents: [
    {
      id: "agent-1",
      name: "분석봇",
      color: "#3B82F6",
      startPosition: { x: 0.05, y: 0.30 },
    },
  ],

  // ─── Data Packets (live in catalog zone) ────────────
  dataPackets: [
    { id: "dp-nursery",  label: "Nursery",   labelKo: "어린이집",   homeZoneId: "catalog", homePosition: { x: 0.30, y: 0.24 } },
    { id: "dp-park",     label: "Parks",     labelKo: "공원",      homeZoneId: "catalog", homePosition: { x: 0.36, y: 0.28 } },
    { id: "dp-clinic",   label: "Clinics",   labelKo: "소아과",    homeZoneId: "catalog", homePosition: { x: 0.42, y: 0.24 } },
    { id: "dp-safety",   label: "Safety",    labelKo: "안전지수",   homeZoneId: "catalog", homePosition: { x: 0.36, y: 0.34 } },
  ],

  // ─── 5 Phases (same world, state progression) ──────
  phases: [
    // ── Phase 1: Query Intake (3.0s) ──
    {
      id: "query-intake",
      label: "Query Intake",
      labelKo: "의뢰 접수",
      description: "시민의 질문이 접수되고 있어요",
      durationSec: 3.0,
      commands: [
        // Zone activates
        { at: 0.0, type: "zone-state", target: "intake", params: { state: "active" } },
        // Agent walks to intake
        { at: 0.2, type: "agent-walk", target: "agent-1", params: { toZone: "intake" } },
        // Zone shows processing (query materializing)
        { at: 1.0, type: "zone-state", target: "intake", params: { state: "processing" } },
        { at: 1.0, type: "zone-effect", target: "intake", params: { effect: "stamp" } },
        // Agent arrives, does work animation
        { at: 1.5, type: "agent-work", target: "agent-1", params: { duration: 0.8 } },
        // Agent picks up query
        { at: 2.3, type: "agent-pickup", target: "agent-1", params: { item: "query" } },
        // Zone goes complete
        { at: 2.5, type: "zone-state", target: "intake", params: { state: "complete" } },
      ],
    },

    // ── Phase 2: Data Search (4.0s) ──
    {
      id: "data-search",
      label: "Data Search",
      labelKo: "데이터 탐색",
      description: "아카이브에서 관련 데이터를 찾고 있어요",
      durationSec: 4.0,
      commands: [
        // Agent walks to catalog
        { at: 0.0, type: "agent-walk", target: "agent-1", params: { pathId: "intake→catalog" } },
        // Catalog activates
        { at: 0.3, type: "zone-state", target: "catalog", params: { state: "active" } },
        // Agent arrives, starts working
        { at: 1.2, type: "agent-work", target: "agent-1", params: { duration: 1.5 } },
        // Scan effect inside catalog
        { at: 1.3, type: "zone-effect", target: "catalog", params: { effect: "scan" } },
        // Data packets found one by one
        { at: 1.5, type: "data-state", target: "dp-nursery", params: { state: "found" } },
        { at: 1.8, type: "data-state", target: "dp-park", params: { state: "found" } },
        { at: 2.1, type: "data-state", target: "dp-clinic", params: { state: "found" } },
        { at: 2.5, type: "data-state", target: "dp-safety", params: { state: "found" } },
        // Zone processing
        { at: 2.0, type: "zone-state", target: "catalog", params: { state: "processing" } },
        // Agent picks up data
        { at: 3.0, type: "agent-pickup", target: "agent-1", params: { items: ["dp-nursery", "dp-park", "dp-clinic", "dp-safety"] } },
        { at: 3.0, type: "data-state", target: "dp-nursery", params: { state: "carried" } },
        { at: 3.0, type: "data-state", target: "dp-park", params: { state: "carried" } },
        { at: 3.0, type: "data-state", target: "dp-clinic", params: { state: "carried" } },
        { at: 3.0, type: "data-state", target: "dp-safety", params: { state: "carried" } },
        // Zone complete
        { at: 3.2, type: "zone-state", target: "catalog", params: { state: "complete" } },
      ],
    },

    // ── Phase 3: Calibration (3.5s) ──
    {
      id: "calibration",
      label: "Calibration",
      labelKo: "데이터 정합",
      description: "데이터를 비교 가능한 형태로 정돈하고 있어요",
      durationSec: 3.5,
      commands: [
        // Agent walks to calibration
        { at: 0.0, type: "agent-walk", target: "agent-1", params: { pathId: "catalog→calibration" } },
        // Zone activates
        { at: 0.3, type: "zone-state", target: "calibration", params: { state: "active" } },
        // Agent drops data at calibration
        { at: 1.0, type: "agent-drop", target: "agent-1", params: { zoneId: "calibration" } },
        { at: 1.0, type: "data-state", target: "dp-nursery", params: { state: "processing" } },
        { at: 1.0, type: "data-state", target: "dp-park", params: { state: "processing" } },
        { at: 1.0, type: "data-state", target: "dp-clinic", params: { state: "processing" } },
        { at: 1.0, type: "data-state", target: "dp-safety", params: { state: "processing" } },
        // Agent works
        { at: 1.2, type: "agent-work", target: "agent-1", params: { duration: 1.5 } },
        // Calibration effect
        { at: 1.2, type: "zone-effect", target: "calibration", params: { effect: "align" } },
        // Zone processing
        { at: 1.5, type: "zone-state", target: "calibration", params: { state: "processing" } },
        // Agent picks up calibrated data
        { at: 2.7, type: "agent-pickup", target: "agent-1", params: { items: ["dp-nursery", "dp-park", "dp-clinic", "dp-safety"] } },
        { at: 2.7, type: "data-state", target: "dp-nursery", params: { state: "carried" } },
        { at: 2.7, type: "data-state", target: "dp-park", params: { state: "carried" } },
        { at: 2.7, type: "data-state", target: "dp-clinic", params: { state: "carried" } },
        { at: 2.7, type: "data-state", target: "dp-safety", params: { state: "carried" } },
        // Zone complete
        { at: 3.0, type: "zone-state", target: "calibration", params: { state: "complete" } },
      ],
    },

    // ── Phase 4: Analysis (4.0s) ──
    {
      id: "analysis",
      label: "Analysis",
      labelKo: "분석 엔진",
      description: "분석 코어가 지표를 결합하고 있어요",
      durationSec: 4.0,
      commands: [
        // Agent walks to reactor
        { at: 0.0, type: "agent-walk", target: "agent-1", params: { pathId: "calibration→reactor" } },
        // Reactor activates
        { at: 0.5, type: "zone-state", target: "reactor", params: { state: "active" } },
        // Agent drops data at reactor
        { at: 1.5, type: "agent-drop", target: "agent-1", params: { zoneId: "reactor" } },
        { at: 1.5, type: "data-state", target: "dp-nursery", params: { state: "processing" } },
        { at: 1.5, type: "data-state", target: "dp-park", params: { state: "processing" } },
        { at: 1.5, type: "data-state", target: "dp-clinic", params: { state: "processing" } },
        { at: 1.5, type: "data-state", target: "dp-safety", params: { state: "processing" } },
        // Reactor processing effects
        { at: 1.5, type: "zone-state", target: "reactor", params: { state: "processing" } },
        { at: 1.5, type: "zone-effect", target: "reactor", params: { effect: "orbit" } },
        // Agent works
        { at: 1.7, type: "agent-work", target: "agent-1", params: { duration: 1.5 } },
        // Data combines
        { at: 3.0, type: "data-state", target: "dp-nursery", params: { state: "combined" } },
        { at: 3.0, type: "data-state", target: "dp-park", params: { state: "combined" } },
        { at: 3.0, type: "data-state", target: "dp-clinic", params: { state: "combined" } },
        { at: 3.0, type: "data-state", target: "dp-safety", params: { state: "combined" } },
        // Agent picks up result
        { at: 3.2, type: "agent-pickup", target: "agent-1", params: { item: "result" } },
        // Reactor complete
        { at: 3.5, type: "zone-state", target: "reactor", params: { state: "complete" } },
      ],
    },

    // ── Phase 5: Report (3.0s) ──
    {
      id: "report-delivery",
      label: "Report",
      labelKo: "분석 완료",
      description: "분석이 끝났어요. 결과를 확인해보세요",
      durationSec: 3.0,
      commands: [
        // Agent walks to report
        { at: 0.0, type: "agent-walk", target: "agent-1", params: { pathId: "reactor→report" } },
        // Report activates
        { at: 0.3, type: "zone-state", target: "report", params: { state: "active" } },
        // Agent drops result
        { at: 1.2, type: "agent-drop", target: "agent-1", params: { zoneId: "report" } },
        // Report processing
        { at: 1.2, type: "zone-state", target: "report", params: { state: "processing" } },
        { at: 1.2, type: "zone-effect", target: "report", params: { effect: "assemble" } },
        // Agent works
        { at: 1.3, type: "agent-work", target: "agent-1", params: { duration: 0.8 } },
        // All data delivered
        { at: 2.0, type: "data-state", target: "dp-nursery", params: { state: "delivered" } },
        { at: 2.0, type: "data-state", target: "dp-park", params: { state: "delivered" } },
        { at: 2.0, type: "data-state", target: "dp-clinic", params: { state: "delivered" } },
        { at: 2.0, type: "data-state", target: "dp-safety", params: { state: "delivered" } },
        // Report complete
        { at: 2.2, type: "zone-state", target: "report", params: { state: "complete" } },
        // Celebration effect
        { at: 2.2, type: "zone-effect", target: "report", params: { effect: "complete" } },
      ],
    },
  ],
};
