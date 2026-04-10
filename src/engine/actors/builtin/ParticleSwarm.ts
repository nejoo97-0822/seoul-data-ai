/**
 * ParticleSwarm — a group of glowing circles with soft halos.
 * Supports converge (inward) and bloom (outward) patterns.
 * Individual particles are children of the container.
 */

import { Container, Graphics } from "pixi.js";
import { registerActor, skinColor } from "../ActorFactory";
import type { ActorDefinition, ThemeDefinition } from "../../core/types";

function seededRandom(i: number, salt: number): number {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

registerActor(
  "particleSwarm",
  (def: ActorDefinition, theme: ThemeDefinition, stageW: number, stageH: number) => {
    const container = new Container();
    const count = (def.data?.count as number) ?? 18;
    const radius = (def.data?.radius as number) ?? 160;
    const color = skinColor(theme, "particleSwarm", "fill");
    const colorNum = parseInt(color.replace("#", ""), 16);
    const glowColor = skinColor(theme, "particleSwarm", "glow", color);
    const glowNum = parseInt(glowColor.replace("#", ""), 16);

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + seededRandom(i, 1) * 0.4;
      const dist = radius + seededRandom(i, 2) * (radius * 0.5);
      const size = 2.5 + seededRandom(i, 3) * 4;

      const g = new Graphics();

      // Outer glow halo (soft, large)
      g.circle(0, 0, size * 3);
      g.fill({ color: glowNum, alpha: 0.06 });
      // Mid glow
      g.circle(0, 0, size * 1.8);
      g.fill({ color: glowNum, alpha: 0.12 });
      // Core dot (bright)
      g.circle(0, 0, size);
      g.fill({ color: colorNum, alpha: 0.92 });
      // Bright center (white)
      g.circle(0, 0, size * 0.4);
      g.fill({ color: 0xffffff, alpha: 0.5 });

      // Store home position for converge/bloom animations
      g.x = Math.cos(angle) * dist;
      g.y = Math.sin(angle) * dist;
      (g as unknown as Record<string, number>).__homeX = g.x;
      (g as unknown as Record<string, number>).__homeY = g.y;
      (g as unknown as Record<string, number>).__size = size;

      container.addChild(g);
    }

    return container;
  }
);
