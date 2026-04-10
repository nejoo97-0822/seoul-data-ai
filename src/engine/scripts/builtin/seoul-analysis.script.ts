/**
 * Seoul Data AI — Analysis Scene Script
 * ══════════════════════════════════════
 * 7 scenes, 15.6 seconds total.
 * Theme: seoul-data-hub
 *
 * This declarative script drives the entire cinematic sequence.
 * Swap this file → different project animation.
 */

import type { SceneScript, SceneDefinition } from "../../core/types";

// ─── Scene 1: Spawn (2.0s) ──────────────────────────

const spawn: SceneDefinition = {
  id: "spawn",
  label: "의뢰 생성",
  description: "시민의 질문을 의뢰서로 접수하고 있어요",
  durationSec: 2.0,
  actors: [
    // BACKDROP: intake desk with city silhouette
    { id: "bg", type: "backdrop", position: { x: 0, y: 0 },
      data: { variant: "intake", accent: "#3B82F6" } },
    {
      id: "particles",
      type: "particleSwarm",
      position: { x: 0.5, y: 0.5 },
      data: { count: 20, radius: 160 },
    },
    {
      id: "questCard",
      type: "taskCard",
      position: { x: 0.5, y: 0.5 },
      data: {
        width: 280,
        height: 100,
        label: "Quest Order",
        number: "#SDA-2026",
        body: "",
      },
    },
    {
      id: "stampRipple",
      type: "ring",
      position: { x: 0.62, y: 0.42 },
      data: { radius: 40, lineWidth: 2 },
    },
    {
      id: "stamp",
      type: "glyph",
      position: { x: 0.62, y: 0.42 },
      data: { text: "APPROVED\n2026·04·10", variant: "stamp", size: 48 },
    },
  ],
  events: [
    { at: 0.0, duration: 0.3, action: "spawn", targetActorIds: ["bg"], params: { fromScale: 1.0 } },
    { at: 0.0, duration: 0.8, action: "converge", targetActorIds: ["particles"], easing: "easeOutCubic" },
    { at: 0.35, duration: 0.8, action: "spawn", targetActorIds: ["questCard"], easing: "easeOutCubic", params: { fromScale: 0.2 } },
    { at: 1.1, duration: 0.6, action: "stamp", targetActorIds: ["stamp"] },
    { at: 1.2, duration: 0.8, action: "pulse", targetActorIds: ["stampRipple"], params: { maxScale: 3.2 } },
    { at: 1.7, duration: 0.3, action: "move", targetActorIds: ["questCard"], easing: "easeInBack", params: { to: { x: -0.3, y: -0.2 }, scale: 0.5, alpha: 0, rotate: -18 } },
  ],
};

// ─── Scene 2: Intake (1.8s) ─────────────────────────

const intake: SceneDefinition = {
  id: "intake",
  label: "허브 접수",
  description: "의뢰서가 데이터 허브에 도착했어요",
  durationSec: 1.8,
  actors: [
    { id: "bg", type: "backdrop", position: { x: 0, y: 0 },
      data: { variant: "hub", accent: "#0EA5E9" } },
    {
      id: "conveyor",
      type: "beam",
      position: { x: 0.5, y: 0.55 },
      data: { orientation: "horizontal", beltWidth: 400 },
    },
    {
      id: "intakeCard",
      type: "taskCard",
      position: { x: 0.8, y: 0.35 },
      data: { width: 100, height: 50, label: "ORDER", number: "#SDA", body: "" },
    },
    {
      id: "arrivalPulse",
      type: "ring",
      position: { x: 0.2, y: 0.5 },
      data: { radius: 50, lineWidth: 2 },
    },
  ],
  events: [
    { at: 0.0, duration: 0.3, action: "spawn", targetActorIds: ["bg"], params: { fromScale: 1.0 } },
    { at: 0.0, duration: 0.3, action: "spawn", targetActorIds: ["conveyor"], params: { fromScale: 0.9 } },
    { at: 0.15, duration: 0.4, action: "spawn", targetActorIds: ["intakeCard"], easing: "easeOutCubic", params: { fromScale: 0.6 } },
    { at: 0.2, duration: 0.5, action: "move", targetActorIds: ["intakeCard"], easing: "easeOutQuad", params: { to: { x: 0.75, y: 0.52 } } },
    { at: 0.7, duration: 0.6, action: "move", targetActorIds: ["intakeCard"], easing: "easeInOutQuad", params: { to: { x: 0.2, y: 0.52 } } },
    { at: 1.3, duration: 0.3, action: "despawn", targetActorIds: ["intakeCard"] },
    { at: 1.3, duration: 0.5, action: "pulse", targetActorIds: ["arrivalPulse"], params: { maxScale: 2.5 } },
  ],
};

// ─── Scene 3: Discovery (3.0s) ──────────────────────
// "Archive scan field" — system scans the catalog, finds 4 relevant datasets,
// they float up, get selected, then exit toward the alignment stage.

const discovery: SceneDefinition = {
  id: "discovery",
  label: "데이터 탐색",
  description: "아카이브에서 관련 데이터를 찾고 있어요",
  durationSec: 3.0,
  showTicker: true,
  actors: [
    // BACKDROP: archive/scan field
    { id: "bg", type: "backdrop", position: { x: 0, y: 0 },
      data: { variant: "archive", accent: "#10B981" } },

    // === THE ZONE: data archive room ===
    {
      id: "archive",
      type: "archiveZone",
      position: { x: 0.5, y: 0.52 },
      data: { width: 480, height: 280, rows: 5, cols: 8, label: "DATA CATALOG" },
    },

    // === SCAN BEAM: sweeps the archive ===
    {
      id: "scanBeam",
      type: "beam",
      position: { x: 0.12, y: 0.52 },
      data: { orientation: "vertical", height: 280, width: 3 },
    },

    // === DATA NODES: 4 found + 2 decoys ===
    // Nodes are positioned INSIDE the archive grid
    { id: "node1", type: "dataNode", position: { x: 0.28, y: 0.45 },
      data: { label: "어린이집", size: 9, floatY: -45 } },
    { id: "node2", type: "dataNode", position: { x: 0.43, y: 0.55 },
      data: { label: "공원 현황", size: 9, floatY: -40 } },
    { id: "decoy1", type: "dataNode", position: { x: 0.52, y: 0.42 },
      data: { label: "", size: 7, floatY: -15 } },
    { id: "node3", type: "dataNode", position: { x: 0.60, y: 0.50 },
      data: { label: "소아과 의원", size: 9, floatY: -42 } },
    { id: "decoy2", type: "dataNode", position: { x: 0.67, y: 0.60 },
      data: { label: "", size: 7, floatY: -12 } },
    { id: "node4", type: "dataNode", position: { x: 0.74, y: 0.48 },
      data: { label: "안전지수", size: 9, floatY: -38 } },

    // === SELECTION PULSES: confirm "found" ===
    { id: "selPulse1", type: "ring", position: { x: 0.28, y: 0.45 }, data: { radius: 20, lineWidth: 2 } },
    { id: "selPulse2", type: "ring", position: { x: 0.43, y: 0.55 }, data: { radius: 20, lineWidth: 2 } },
    { id: "selPulse3", type: "ring", position: { x: 0.60, y: 0.50 }, data: { radius: 20, lineWidth: 2 } },
    { id: "selPulse4", type: "ring", position: { x: 0.74, y: 0.48 }, data: { radius: 20, lineWidth: 2 } },

    // === COLLECTION RING: gathering point ===
    { id: "collectRing", type: "ring", position: { x: 0.5, y: 0.28 }, data: { radius: 60, lineWidth: 1.5, dashed: true } },
  ],
  events: [
    // --- Phase 0: Backdrop ---
    { at: 0.0, duration: 0.3, action: "spawn", targetActorIds: ["bg"], params: { fromScale: 1.0 } },
    // --- Phase 1: Archive zone materializes ---
    { at: 0.0, duration: 0.5, action: "spawn", targetActorIds: ["archive"], easing: "easeOutCubic", params: { fromScale: 0.92 } },

    // Data nodes appear as dormant dots inside archive
    { at: 0.15, duration: 0.2, action: "spawn", targetActorIds: ["node1", "node2", "node3", "node4", "decoy1", "decoy2"], params: { fromScale: 0.5 } },

    // --- Phase 2: Scan beam sweeps (left → right) ---
    { at: 0.3, duration: 0.3, action: "spawn", targetActorIds: ["scanBeam"], params: { fromScale: 0.8 } },
    { at: 0.3, duration: 1.4, action: "move", targetActorIds: ["scanBeam"], easing: "easeInOutQuad",
      params: { to: { x: 0.88, y: 0.52 } } },

    // --- Phase 3: Nodes activate as scan passes them (staggered) ---
    // Node 1 — scan hits at ~0.5s
    { at: 0.55, duration: 0.6, action: "highlight", targetActorIds: ["node1"], easing: "easeOutCubic" },
    { at: 0.65, duration: 0.5, action: "pulse", targetActorIds: ["selPulse1"], params: { maxScale: 2.5 } },

    // Node 2 — scan hits at ~0.7s
    { at: 0.75, duration: 0.6, action: "highlight", targetActorIds: ["node2"], easing: "easeOutCubic" },
    { at: 0.85, duration: 0.5, action: "pulse", targetActorIds: ["selPulse2"], params: { maxScale: 2.5 } },

    // Decoy 1 — scan hits, brief flash then dim
    { at: 0.9, duration: 0.5, action: "dim", targetActorIds: ["decoy1"] },

    // Node 3 — scan hits at ~1.0s
    { at: 1.05, duration: 0.6, action: "highlight", targetActorIds: ["node3"], easing: "easeOutCubic" },
    { at: 1.15, duration: 0.5, action: "pulse", targetActorIds: ["selPulse3"], params: { maxScale: 2.5 } },

    // Decoy 2 — flash and dim
    { at: 1.2, duration: 0.5, action: "dim", targetActorIds: ["decoy2"] },

    // Node 4 — scan hits at ~1.3s
    { at: 1.35, duration: 0.6, action: "highlight", targetActorIds: ["node4"], easing: "easeOutCubic" },
    { at: 1.45, duration: 0.5, action: "pulse", targetActorIds: ["selPulse4"], params: { maxScale: 2.5 } },

    // --- Phase 4: Scan beam fades out ---
    { at: 1.7, duration: 0.3, action: "despawn", targetActorIds: ["scanBeam"] },
    { at: 1.7, duration: 0.3, action: "despawn", targetActorIds: ["decoy1", "decoy2"] },

    // --- Phase 5: Collection ring appears, found nodes converge ---
    { at: 1.9, duration: 0.4, action: "spawn", targetActorIds: ["collectRing"], easing: "easeOutCubic", params: { fromScale: 0.5 } },
    { at: 1.9, duration: 0.4, action: "orbit", targetActorIds: ["collectRing"], params: { speed: 0.6, direction: 1 } },

    // Found nodes move to collection orbit
    { at: 2.0, duration: 0.5, action: "move", targetActorIds: ["node1"], easing: "easeInOutCubic",
      params: { to: { x: 0.40, y: 0.26 }, scale: 0.7 } },
    { at: 2.1, duration: 0.5, action: "move", targetActorIds: ["node2"], easing: "easeInOutCubic",
      params: { to: { x: 0.50, y: 0.24 }, scale: 0.7 } },
    { at: 2.15, duration: 0.5, action: "move", targetActorIds: ["node3"], easing: "easeInOutCubic",
      params: { to: { x: 0.56, y: 0.26 }, scale: 0.7 } },
    { at: 2.2, duration: 0.5, action: "move", targetActorIds: ["node4"], easing: "easeInOutCubic",
      params: { to: { x: 0.64, y: 0.25 }, scale: 0.7 } },

    // --- Phase 6: Archive dims, collected data exits ---
    { at: 2.3, duration: 0.5, action: "despawn", targetActorIds: ["archive"] },
    { at: 2.6, duration: 0.4, action: "despawn", targetActorIds: ["collectRing", "node1", "node2", "node3", "node4"] },
  ],
};

// ─── Scene 4: Alignment (2.5s) ──────────────────────
// "Calibration chamber" — raw data enters scattered and misaligned,
// the system normalizes units/timing/keys, then snaps them into formation.

const alignment: SceneDefinition = {
  id: "alignment",
  label: "정합화",
  description: "데이터를 비교 가능한 형태로 정돈하고 있어요",
  durationSec: 2.5,
  showTicker: true,
  actors: [
    // BACKDROP: calibration / alignment guides
    { id: "bg", type: "backdrop", position: { x: 0, y: 0 },
      data: { variant: "calibrate", accent: "#F59E0B" } },

    // === CALIBRATION ZONE ===
    {
      id: "calibZone",
      type: "archiveZone",
      position: { x: 0.5, y: 0.5 },
      data: { width: 420, height: 160, rows: 2, cols: 6, label: "CALIBRATION FIELD" },
    },

    // === DATA NODES: arrive scattered, will be aligned ===
    { id: "dat1", type: "dataNode", position: { x: 0.15, y: 0.35 },
      data: { label: "어린이집", size: 10, floatY: 0 } },
    { id: "dat2", type: "dataNode", position: { x: 0.35, y: 0.72 },
      data: { label: "공원", size: 10, floatY: 0 } },
    { id: "dat3", type: "dataNode", position: { x: 0.65, y: 0.30 },
      data: { label: "소아과", size: 10, floatY: 0 } },
    { id: "dat4", type: "dataNode", position: { x: 0.88, y: 0.62 },
      data: { label: "안전지수", size: 10, floatY: 0 } },

    // === ALIGNMENT BEAM ===
    {
      id: "alignBeam",
      type: "beam",
      position: { x: 0.05, y: 0.5 },
      data: { orientation: "vertical", height: 200, width: 3 },
    },

    // === PROCESS TAGS: calibration steps ===
    { id: "tag1", type: "glyph", position: { x: 0.30, y: 0.28 }, data: { text: "단위 정합", size: 22 } },
    { id: "tag2", type: "glyph", position: { x: 0.50, y: 0.25 }, data: { text: "시점 맞춤", size: 22 } },
    { id: "tag3", type: "glyph", position: { x: 0.70, y: 0.28 }, data: { text: "키 매칭", size: 22 } },

    // === SNAP PULSES ===
    { id: "snap1", type: "ring", position: { x: 0.30, y: 0.50 }, data: { radius: 25, lineWidth: 2 } },
    { id: "snap2", type: "ring", position: { x: 0.43, y: 0.50 }, data: { radius: 25, lineWidth: 2 } },
    { id: "snap3", type: "ring", position: { x: 0.57, y: 0.50 }, data: { radius: 25, lineWidth: 2 } },
    { id: "snap4", type: "ring", position: { x: 0.70, y: 0.50 }, data: { radius: 25, lineWidth: 2 } },
  ],
  events: [
    // --- Phase 0: Backdrop ---
    { at: 0.0, duration: 0.3, action: "spawn", targetActorIds: ["bg"], params: { fromScale: 1.0 } },
    // --- Phase 1: Calibration zone appears ---
    { at: 0.0, duration: 0.4, action: "spawn", targetActorIds: ["calibZone"], easing: "easeOutCubic", params: { fromScale: 0.9 } },

    // --- Phase 2: Data nodes arrive from scattered positions (highlight to activate) ---
    { at: 0.1, duration: 0.3, action: "spawn", targetActorIds: ["dat1"], params: { fromScale: 0.4 } },
    { at: 0.1, duration: 0.5, action: "highlight", targetActorIds: ["dat1"], easing: "easeOutCubic" },
    { at: 0.2, duration: 0.3, action: "spawn", targetActorIds: ["dat2"], params: { fromScale: 0.4 } },
    { at: 0.2, duration: 0.5, action: "highlight", targetActorIds: ["dat2"], easing: "easeOutCubic" },
    { at: 0.3, duration: 0.3, action: "spawn", targetActorIds: ["dat3"], params: { fromScale: 0.4 } },
    { at: 0.3, duration: 0.5, action: "highlight", targetActorIds: ["dat3"], easing: "easeOutCubic" },
    { at: 0.4, duration: 0.3, action: "spawn", targetActorIds: ["dat4"], params: { fromScale: 0.4 } },
    { at: 0.4, duration: 0.5, action: "highlight", targetActorIds: ["dat4"], easing: "easeOutCubic" },

    // --- Phase 3: Alignment beam sweeps across ---
    { at: 0.6, duration: 0.3, action: "spawn", targetActorIds: ["alignBeam"], params: { fromScale: 0.8 } },
    { at: 0.6, duration: 0.8, action: "move", targetActorIds: ["alignBeam"], easing: "easeInOutQuad",
      params: { to: { x: 0.95, y: 0.5 } } },

    // --- Phase 4: Process tags appear (calibration steps) ---
    { at: 0.9, duration: 0.35, action: "spawn", targetActorIds: ["tag1"], easing: "easeOutBack", params: { fromScale: 0.3 } },
    { at: 1.05, duration: 0.35, action: "spawn", targetActorIds: ["tag2"], easing: "easeOutBack", params: { fromScale: 0.3 } },
    { at: 1.2, duration: 0.35, action: "spawn", targetActorIds: ["tag3"], easing: "easeOutBack", params: { fromScale: 0.3 } },

    // --- Phase 5: Nodes snap into aligned row inside the zone ---
    { at: 1.3, duration: 0.4, action: "move", targetActorIds: ["dat1"], easing: "easeOutBack",
      params: { to: { x: 0.30, y: 0.50 }, scale: 0.85 } },
    { at: 1.3, duration: 0.4, action: "pulse", targetActorIds: ["snap1"], params: { maxScale: 2.0 } },

    { at: 1.4, duration: 0.4, action: "move", targetActorIds: ["dat2"], easing: "easeOutBack",
      params: { to: { x: 0.43, y: 0.50 }, scale: 0.85 } },
    { at: 1.4, duration: 0.4, action: "pulse", targetActorIds: ["snap2"], params: { maxScale: 2.0 } },

    { at: 1.5, duration: 0.4, action: "move", targetActorIds: ["dat3"], easing: "easeOutBack",
      params: { to: { x: 0.57, y: 0.50 }, scale: 0.85 } },
    { at: 1.5, duration: 0.4, action: "pulse", targetActorIds: ["snap3"], params: { maxScale: 2.0 } },

    { at: 1.6, duration: 0.4, action: "move", targetActorIds: ["dat4"], easing: "easeOutBack",
      params: { to: { x: 0.70, y: 0.50 }, scale: 0.85 } },
    { at: 1.6, duration: 0.4, action: "pulse", targetActorIds: ["snap4"], params: { maxScale: 2.0 } },

    // --- Phase 6: Beam fades, tags fade, nodes compress to center ---
    { at: 1.8, duration: 0.3, action: "despawn", targetActorIds: ["alignBeam"] },
    { at: 1.9, duration: 0.3, action: "despawn", targetActorIds: ["tag1", "tag2", "tag3"] },

    { at: 2.0, duration: 0.3, action: "move", targetActorIds: ["dat1"], easing: "easeInOutCubic",
      params: { to: { x: 0.44, y: 0.50 }, scale: 0.5 } },
    { at: 2.0, duration: 0.3, action: "move", targetActorIds: ["dat2"], easing: "easeInOutCubic",
      params: { to: { x: 0.48, y: 0.50 }, scale: 0.5 } },
    { at: 2.0, duration: 0.3, action: "move", targetActorIds: ["dat3"], easing: "easeInOutCubic",
      params: { to: { x: 0.52, y: 0.50 }, scale: 0.5 } },
    { at: 2.0, duration: 0.3, action: "move", targetActorIds: ["dat4"], easing: "easeInOutCubic",
      params: { to: { x: 0.56, y: 0.50 }, scale: 0.5 } },

    { at: 2.2, duration: 0.3, action: "despawn", targetActorIds: ["calibZone", "dat1", "dat2", "dat3", "dat4"] },
  ],
};

// ─── Scene 5: Compute (3.2s) — THE WOW MOMENT ──────

const compute: SceneDefinition = {
  id: "compute",
  label: "분석 엔진",
  description: "분석 코어가 지표를 결합하고 있어요",
  durationSec: 3.2,
  showTicker: true,
  actors: [
    // BACKDROP: reactor core / energy field
    { id: "bg", type: "backdrop", position: { x: 0, y: 0 },
      data: { variant: "reactor", accent: "#8B5CF6" } },
    { id: "outerRing", type: "ring", position: { x: 0.5, y: 0.5 }, data: { radius: 140, lineWidth: 2, dashed: true } },
    { id: "middleRing", type: "ring", position: { x: 0.5, y: 0.5 }, data: { radius: 105, lineWidth: 2.5 } },
    { id: "innerRing", type: "ring", position: { x: 0.5, y: 0.5 }, data: { radius: 72, lineWidth: 1.5, dashed: true } },
    { id: "coreParticles", type: "particleSwarm", position: { x: 0.5, y: 0.5 }, data: { count: 42, radius: 220 } },
    { id: "coreOrb", type: "glyph", position: { x: 0.5, y: 0.5 }, data: { text: "∑", variant: "badge", size: 56 } },
    { id: "glyph1", type: "glyph", position: { x: 0.5, y: 0.5 }, data: { text: "Σ", size: 26 } },
    { id: "glyph2", type: "glyph", position: { x: 0.5, y: 0.5 }, data: { text: "Π", size: 26 } },
    { id: "glyph3", type: "glyph", position: { x: 0.5, y: 0.5 }, data: { text: "λ", size: 26 } },
    { id: "glyph4", type: "glyph", position: { x: 0.5, y: 0.5 }, data: { text: "σ", size: 26 } },
    { id: "pulsRing1", type: "ring", position: { x: 0.5, y: 0.5 }, data: { radius: 50, lineWidth: 2 } },
    { id: "pulsRing2", type: "ring", position: { x: 0.5, y: 0.5 }, data: { radius: 50, lineWidth: 2 } },
    { id: "pulsRing3", type: "ring", position: { x: 0.5, y: 0.5 }, data: { radius: 50, lineWidth: 2 } },
    { id: "coreFlare", type: "ring", position: { x: 0.5, y: 0.5 }, data: { radius: 60, lineWidth: 4 } },
  ],
  events: [
    { at: 0.0, duration: 0.3, action: "spawn", targetActorIds: ["bg"], params: { fromScale: 1.0 } },
    // Rings fade in & spin
    { at: 0.0, duration: 0.5, action: "spawn", targetActorIds: ["outerRing", "middleRing", "innerRing"], params: { fromScale: 0.8 } },
    { at: 0.0, duration: 3.2, action: "orbit", targetActorIds: ["outerRing"], params: { speed: 0.5, direction: -1 } },
    { at: 0.0, duration: 3.2, action: "orbit", targetActorIds: ["middleRing"], params: { speed: 0.8, direction: 1 } },
    { at: 0.0, duration: 3.2, action: "orbit", targetActorIds: ["innerRing"], params: { speed: 1.3, direction: -1 } },
    // Particles converge
    { at: 0.3, duration: 1.5, action: "converge", targetActorIds: ["coreParticles"], easing: "easeInOutCubic" },
    // Core orb appears
    { at: 0.4, duration: 0.6, action: "spawn", targetActorIds: ["coreOrb"], easing: "easeOutCubic", params: { fromScale: 0.3 } },
    // Orbiting glyphs
    { at: 0.2, duration: 3.0, action: "orbit", targetActorIds: ["glyph1"], params: { speed: 1.0, direction: 1, orbitRadius: 120 } },
    { at: 0.2, duration: 3.0, action: "spawn", targetActorIds: ["glyph1"], params: { fromScale: 0.5 } },
    { at: 0.4, duration: 2.8, action: "orbit", targetActorIds: ["glyph2"], params: { speed: 0.85, direction: -1, orbitRadius: 130 } },
    { at: 0.4, duration: 0.3, action: "spawn", targetActorIds: ["glyph2"], params: { fromScale: 0.5 } },
    { at: 0.6, duration: 2.6, action: "orbit", targetActorIds: ["glyph3"], params: { speed: 0.7, direction: 1, orbitRadius: 115 } },
    { at: 0.6, duration: 0.3, action: "spawn", targetActorIds: ["glyph3"], params: { fromScale: 0.5 } },
    { at: 0.8, duration: 2.4, action: "orbit", targetActorIds: ["glyph4"], params: { speed: 0.95, direction: -1, orbitRadius: 125 } },
    { at: 0.8, duration: 0.3, action: "spawn", targetActorIds: ["glyph4"], params: { fromScale: 0.5 } },
    // Expanding energy pulses
    { at: 0.8, duration: 1.2, action: "pulse", targetActorIds: ["pulsRing1"], params: { maxScale: 3.0, startScale: 0.5 } },
    { at: 1.4, duration: 1.2, action: "pulse", targetActorIds: ["pulsRing2"], params: { maxScale: 3.0, startScale: 0.5 } },
    { at: 2.0, duration: 1.2, action: "pulse", targetActorIds: ["pulsRing3"], params: { maxScale: 3.0, startScale: 0.5 } },
    // Core crescendo
    { at: 1.8, duration: 0.8, action: "move", targetActorIds: ["coreOrb"], params: { scale: 1.35 } },
    // Core flare
    { at: 2.6, duration: 0.4, action: "pulse", targetActorIds: ["coreFlare"], params: { maxScale: 4.0, startScale: 0.6 } },
    // Core collapse
    { at: 3.0, duration: 0.2, action: "move", targetActorIds: ["coreOrb"], easing: "easeInQuad", params: { scale: 0.1, alpha: 0 } },
  ],
};

// ─── Scene 6: Assembly (2.2s) ───────────────────────

const assembly: SceneDefinition = {
  id: "assembly",
  label: "리포트 조립",
  description: "결과 리포트를 조립하고 있어요",
  durationSec: 2.2,
  actors: [
    // BACKDROP: assembly bay
    { id: "bg", type: "backdrop", position: { x: 0, y: 0 },
      data: { variant: "assembly", accent: "#EC4899" } },
    { id: "dossier", type: "resultCard", position: { x: 0.5, y: 0.5 }, data: { width: 340, height: 200, label: "Analysis Report", body: "" } },
    { id: "rankPiece", type: "taskCard", position: { x: -0.1, y: 0.4 }, data: { width: 120, height: 70, label: "Ranking", body: "성동구 92\n강동구 89" } },
    { id: "chartPiece", type: "taskCard", position: { x: 0.5, y: -0.1 }, data: { width: 120, height: 70, label: "Chart", body: "지표 비교" } },
    { id: "mapPiece", type: "taskCard", position: { x: 1.1, y: 0.4 }, data: { width: 120, height: 70, label: "Seoul Map", body: "25개 구" } },
    { id: "snapPing1", type: "ring", position: { x: 0.3, y: 0.4 }, data: { radius: 40, lineWidth: 2 } },
    { id: "snapPing2", type: "ring", position: { x: 0.5, y: 0.35 }, data: { radius: 40, lineWidth: 2 } },
    { id: "snapPing3", type: "ring", position: { x: 0.7, y: 0.4 }, data: { radius: 40, lineWidth: 2 } },
  ],
  events: [
    { at: 0.0, duration: 0.3, action: "spawn", targetActorIds: ["bg"], params: { fromScale: 1.0 } },
    // Dossier frame
    { at: 0.0, duration: 0.5, action: "spawn", targetActorIds: ["dossier"], easing: "easeOutCubic", params: { fromScale: 0.9 } },
    // Pieces fly in
    { at: 0.3, duration: 0.5, action: "spawn", targetActorIds: ["rankPiece"], params: { fromScale: 0.7 } },
    { at: 0.3, duration: 0.5, action: "move", targetActorIds: ["rankPiece"], easing: "easeOutCubic", params: { to: { x: 0.3, y: 0.4 } } },
    { at: 0.75, duration: 0.4, action: "pulse", targetActorIds: ["snapPing1"], params: { maxScale: 2.0 } },
    { at: 0.6, duration: 0.5, action: "spawn", targetActorIds: ["chartPiece"], params: { fromScale: 0.7 } },
    { at: 0.6, duration: 0.5, action: "move", targetActorIds: ["chartPiece"], easing: "easeOutBack", params: { to: { x: 0.5, y: 0.38 } } },
    { at: 1.05, duration: 0.4, action: "pulse", targetActorIds: ["snapPing2"], params: { maxScale: 2.0 } },
    { at: 0.9, duration: 0.5, action: "spawn", targetActorIds: ["mapPiece"], params: { fromScale: 0.7 } },
    { at: 0.9, duration: 0.5, action: "move", targetActorIds: ["mapPiece"], easing: "easeOutCubic", params: { to: { x: 0.7, y: 0.4 } } },
    { at: 1.35, duration: 0.4, action: "pulse", targetActorIds: ["snapPing3"], params: { maxScale: 2.0 } },
    // Lift off
    { at: 1.9, duration: 0.3, action: "move", targetActorIds: ["dossier"], params: { to: { x: 0.5, y: 0.45 }, scale: 1.05 } },
  ],
};

// ─── Scene 7: Reveal (1.8s) ─────────────────────────

const revealScene: SceneDefinition = {
  id: "reveal",
  label: "분석 완료",
  description: "분석이 끝났어요. 결과를 확인해보세요",
  durationSec: 1.8,
  actors: [
    // BACKDROP: presentation stage / spotlight
    { id: "bg", type: "backdrop", position: { x: 0, y: 0 },
      data: { variant: "stage", accent: "#F43F5E" } },
    { id: "dossierFinal", type: "resultCard", position: { x: 0.5, y: 0.52 }, data: { width: 320, height: 160, label: "Analysis Complete", body: "" } },
    { id: "shockwave1", type: "ring", position: { x: 0.5, y: 0.52 }, data: { radius: 120, lineWidth: 3 } },
    { id: "shockwave2", type: "ring", position: { x: 0.5, y: 0.52 }, data: { radius: 150, lineWidth: 2 } },
    { id: "bloomParticles", type: "particleSwarm", position: { x: 0.5, y: 0.52 }, data: { count: 40, radius: 220 } },
    { id: "completeBadge", type: "glyph", position: { x: 0.5, y: 0.52 }, data: { text: "✓", variant: "badge", size: 64 } },
  ],
  events: [
    { at: 0.0, duration: 0.3, action: "spawn", targetActorIds: ["bg"], params: { fromScale: 1.0 } },
    // Dossier floats in
    { at: 0.0, duration: 0.6, action: "reveal", targetActorIds: ["dossierFinal"], easing: "easeOutCubic" },
    // Shockwaves — expand from card center
    { at: 0.5, duration: 0.8, action: "pulse", targetActorIds: ["shockwave1"], params: { maxScale: 2.5 } },
    { at: 0.65, duration: 0.8, action: "pulse", targetActorIds: ["shockwave2"], params: { maxScale: 3.0 } },
    // Particle bloom (reverse converge)
    { at: 0.55, duration: 0.9, action: "spawn", targetActorIds: ["bloomParticles"], params: { fromScale: 0.3 } },
    { at: 0.7, duration: 1.1, action: "despawn", targetActorIds: ["bloomParticles"] },
    // Complete badge — centered on card
    { at: 0.8, duration: 0.5, action: "spawn", targetActorIds: ["completeBadge"], easing: "easeOutBack", params: { fromScale: 0.3 } },
  ],
};

// ─── Full Script ────────────────────────────────────

export const seoulAnalysisScript: SceneScript = {
  id: "seoul-analysis",
  name: "Seoul Data AI Analysis",
  themeId: "seoul-data-hub",
  scenes: [spawn, intake, discovery, alignment, compute, assembly, revealScene],
};
