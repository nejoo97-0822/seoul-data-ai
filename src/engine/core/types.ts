/**
 * Agent Scene Engine — Core Types
 * ════════════════════════════════
 * Project-independent interfaces. Every concept in the engine
 * is described here. Swap Theme + Script = different project.
 */

// ─── Primitives ───────────────────────────────────────

export type Vec2 = { x: number; y: number };
export type Color = string; // hex "#3B82F6"

// ─── Theme ────────────────────────────────────────────

export interface ThemePalette {
  background: Color;
  surface: Color;
  primary: Color;
  secondary: Color;
  accent: Color;
  text: Color;
  textMuted: Color;
}

export interface ThemeDefinition {
  id: string;
  name: string;
  palette: ThemePalette;
  fontFamily: string;
  /** Per-scene accent colors */
  sceneAccents: Record<string, { accent: Color; accentSoft: Color }>;
  /** Actor type → visual overrides */
  actorSkins: Record<string, ActorSkin>;
  /** Stage background CSS */
  stageBackground: string;
  /** Stage grid */
  stageGrid: { size: number; color: Color; opacity: number };
}

export interface ActorSkin {
  fill?: Color;
  stroke?: Color;
  glow?: Color;
  glowStrength?: number;
}

// ─── Actor ────────────────────────────────────────────

export type ActorType =
  | "particleSwarm"
  | "ring"
  | "taskCard"
  | "resultCard"
  | "beam"
  | "glyph"
  | (string & {}); // extensible

export interface ActorDefinition {
  id: string;
  type: ActorType;
  /** Position normalized 0..1 within stage */
  position?: Vec2;
  /** Actor-specific data payload */
  data?: Record<string, unknown>;
  /** Size in stage pixels */
  size?: Vec2;
}

// ─── Zone (lightweight, no deep hierarchy) ────────────

export interface ZoneDefinition {
  id: string;
  type: string;
  bounds: { x: number; y: number; width: number; height: number };
  label?: string;
}

// ─── Event ────────────────────────────────────────────

export type EventAction =
  | "spawn"
  | "despawn"
  | "move"
  | "converge"
  | "orbit"
  | "pulse"
  | "filter"
  | "reveal"
  | "stamp"
  | "typewrite"
  | (string & {});

export type EasingName =
  | "linear"
  | "easeInQuad"
  | "easeOutQuad"
  | "easeInOutQuad"
  | "easeOutCubic"
  | "easeInOutCubic"
  | "easeOutBack"
  | "easeInBack";

export interface EventDefinition {
  /** Seconds from scene start */
  at: number;
  /** Duration in seconds */
  duration: number;
  action: EventAction;
  targetActorIds: string[];
  targetZoneId?: string;
  params?: Record<string, unknown>;
  easing?: EasingName;
}

// ─── Scene ────────────────────────────────────────────

export interface SceneDefinition {
  id: string;
  label: string;
  description: string;
  /** Total duration in seconds */
  durationSec: number;
  showTicker?: boolean;
  actors: ActorDefinition[];
  zones?: ZoneDefinition[];
  events: EventDefinition[];
}

// ─── Script (the full sequence) ───────────────────────

export interface SceneScript {
  id: string;
  name: string;
  themeId: string;
  scenes: SceneDefinition[];
}

// ─── Runtime types (engine internal) ──────────────────

export interface ActorInstance {
  definition: ActorDefinition;
  container: import("pixi.js").Container;
  state: Record<string, unknown>;
}

export type ScenePhase = "idle" | "playing" | "transition" | "completed";

// ═══════════════════════════════════════════════════════
// Persistent World Types (replaces scene vignettes)
// ═══════════════════════════════════════════════════════

// ─── Zone ─────────────────────────────────────────────

export type ZoneState = "idle" | "active" | "processing" | "complete";

export interface WorldZoneDefinition {
  id: string;
  label: string;
  labelKo: string;
  center: Vec2;       // normalized 0..1
  size: Vec2;         // pixel size
  accent: Color;
  accentSoft: Color;
}

// ─── Path ─────────────────────────────────────────────

export interface PathDefinition {
  id: string;
  from: string;
  to: string;
  waypoints: Vec2[];  // normalized positions
}

// ─── Agent ────────────────────────────────────────────

export type AgentAnimState = "idle" | "walking" | "working" | "carrying";

export interface AgentDefinition {
  id: string;
  name: string;
  color: Color;
  startPosition: Vec2;
}

// ─── Data Packet ──────────────────────────────────────

export type DataPacketVisualState = "dormant" | "found" | "carried" | "processing" | "combined" | "delivered";

export interface DataPacketDefinition {
  id: string;
  label: string;
  labelKo: string;
  homeZoneId: string;
  homePosition: Vec2;  // normalized, within catalog zone
}

// ─── Phase ────────────────────────────────────────────

export interface PhaseCommand {
  at: number;           // seconds from phase start
  type:
    | "zone-state"      // change zone visual state
    | "agent-walk"      // agent walks a path
    | "agent-work"      // agent plays work animation at zone
    | "agent-pickup"    // agent picks up data packet(s)
    | "agent-drop"      // agent drops data at zone
    | "data-state"      // change data packet visual state
    | "spawn-effect"    // spawn ring/pulse/particle at position
    | "zone-effect";    // play effect inside zone (scan beam, orbit, etc.)
  target: string;
  params?: Record<string, unknown>;
}

export interface PhaseDefinition {
  id: string;
  label: string;
  labelKo: string;
  description: string;
  durationSec: number;
  commands: PhaseCommand[];
}

// ─── World Script ─────────────────────────────────────

export interface WorldScript {
  id: string;
  name: string;
  themeId: string;
  zones: WorldZoneDefinition[];
  paths: PathDefinition[];
  agents: AgentDefinition[];
  dataPackets: DataPacketDefinition[];
  phases: PhaseDefinition[];
}
