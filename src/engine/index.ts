/**
 * Agent Scene Engine — Public API
 */

// Core (legacy scene engine)
export { SceneEngine } from "./core/SceneEngine";
export type {
  SceneScript,
  SceneDefinition,
  ThemeDefinition,
  ActorDefinition,
  EventDefinition,
  ActorType,
  EventAction,
  Vec2,
  Color,
} from "./core/types";

// Core (persistent world engine)
export { WorldEngine } from "./core/WorldEngine";
export type { WorldScript, PhaseDefinition, PhaseCommand } from "./core/types";

// Theme
export { EngineThemeProvider, useEngineTheme } from "./themes/ThemeProvider";
export { seoulDataHubTheme } from "./themes/builtin/seoul-data-hub";

// Scripts
export { seoulAnalysisScript } from "./scripts/builtin/seoul-analysis.script";
export { seoulWorldScript } from "./scripts/builtin/seoul-world.script";
