/**
 * ActorFactory — creates PixiJS containers from actor definitions.
 *
 * Each actor type has a builtin renderer. The factory applies
 * theme skins on top.
 */

import type { Container } from "pixi.js";
import type {
  ActorDefinition,
  ActorInstance,
  ThemeDefinition,
  Color,
} from "../core/types";

export type ActorRenderer = (
  def: ActorDefinition,
  theme: ThemeDefinition,
  stageW: number,
  stageH: number
) => Container;

const renderers = new Map<string, ActorRenderer>();

export function registerActor(type: string, renderer: ActorRenderer) {
  renderers.set(type, renderer);
}

export function createActor(
  def: ActorDefinition,
  theme: ThemeDefinition,
  stageW: number,
  stageH: number
): ActorInstance {
  const renderer = renderers.get(def.type);
  if (!renderer) {
    throw new Error(`No renderer for actor type: "${def.type}"`);
  }
  const container = renderer(def, theme, stageW, stageH);

  // Position
  if (def.position) {
    container.x = def.position.x * stageW;
    container.y = def.position.y * stageH;
  }

  // Start invisible — "spawn" event will reveal
  container.alpha = 0;

  return {
    definition: def,
    container,
    state: {},
  };
}

/** Helper: resolve actor skin color with fallback to palette */
export function skinColor(
  theme: ThemeDefinition,
  actorType: string,
  field: keyof import("../core/types").ActorSkin,
  fallback?: Color
): string {
  return (
    (theme.actorSkins[actorType]?.[field] as string) ??
    fallback ??
    theme.palette.primary
  );
}
