/**
 * Orbital Data Station — Type Definitions
 * ════════════════════════════════════════
 * All types for the Phaser-based persistent world.
 */

/* ── Zone ─────────────────────────────── */
export type ZoneId = "dock" | "archive" | "gate" | "reactor" | "bridge";

export type ZoneState = "idle" | "active" | "processing" | "complete";

export interface ZoneDef {
  id: ZoneId;
  label: string;
  labelKo: string;
  cx: number;            // fraction 0-1
  cy: number;            // fraction 0-1
  w: number;             // px
  h: number;             // px
  accent: number;        // hex color
  accentCSS: string;     // CSS hex string
}

/* ── Agent ─────────────────────────────── */
export type AgentId = "operator" | "scout" | "analyst";

export type AgentAnim = "idle" | "walk" | "work" | "carry";

export interface AgentDef {
  id: AgentId;
  name: string;
  nameKo: string;
  color: number;         // hex
  startX: number;        // fraction
  startY: number;        // fraction
}

/* ── Cargo ─────────────────────────────── */
export type CargoState = "dormant" | "scanned" | "carried" | "gated" | "reacted" | "delivered";

export interface CargoDef {
  id: string;
  label: string;
  labelKo: string;
  homeZone: ZoneId;
  homeX: number;
  homeY: number;
}

/* ── Phase Commands ────────────────────── */
export type CmdType =
  | "zone-state"
  | "agent-walk"
  | "agent-work"
  | "agent-carry"
  | "agent-drop"
  | "cargo-state"
  | "cargo-move"
  | "spawn-card"
  | "reveal-card"
  | "effect";

export interface PhaseCmd {
  at: number;            // seconds from phase start
  type: CmdType;
  target: string;
  params: Record<string, unknown>;
}

export interface PhaseDef {
  id: string;
  label: string;
  labelKo: string;
  description: string;
  durationSec: number;
  commands: PhaseCmd[];
}

/* ── World Script ──────────────────────── */
export interface StationScript {
  id: string;
  name: string;
  zones: ZoneDef[];
  agents: AgentDef[];
  cargos: CargoDef[];
  phases: PhaseDef[];
}
