/**
 * RingActor — a circular ring (solid or dashed).
 * Supports spinning, pulsing, and expanding animations via events.
 */

import { Container, Graphics } from "pixi.js";
import { registerActor, skinColor } from "../ActorFactory";
import type { ActorDefinition, ThemeDefinition } from "../../core/types";

registerActor(
  "ring",
  (def: ActorDefinition, theme: ThemeDefinition) => {
    const container = new Container();
    const radius = (def.data?.radius as number) ?? 100;
    const lineWidth = (def.data?.lineWidth as number) ?? 2;
    const dashed = (def.data?.dashed as boolean) ?? false;
    const color = skinColor(theme, "ring", "stroke");
    const colorNum = parseInt(color.replace("#", ""), 16);

    const glowColor = skinColor(theme, "ring", "glow", color);
    const glowNum = parseInt(glowColor.replace("#", ""), 16);

    // Soft glow behind the ring
    const glow = new Graphics();
    glow.circle(0, 0, radius);
    glow.stroke({ color: glowNum, width: lineWidth + 10, alpha: 0.06 });
    glow.circle(0, 0, radius);
    glow.stroke({ color: glowNum, width: lineWidth + 5, alpha: 0.10 });
    container.addChild(glow);

    const g = new Graphics();

    if (dashed) {
      // Draw dashed circle as small arcs
      const segments = 36;
      const gap = Math.PI / segments;
      for (let i = 0; i < segments; i++) {
        const startAngle = (i / segments) * Math.PI * 2;
        const endAngle = startAngle + gap;
        g.arc(0, 0, radius, startAngle, endAngle);
        g.stroke({ color: colorNum, width: lineWidth, alpha: 0.6 });
        g.moveTo(
          Math.cos(endAngle + gap) * radius,
          Math.sin(endAngle + gap) * radius
        );
      }
    } else {
      g.circle(0, 0, radius);
      g.stroke({ color: colorNum, width: lineWidth, alpha: 0.8 });
    }

    container.addChild(g);
    // Store for event access
    (container as unknown as Record<string, unknown>).__radius = radius;

    return container;
  }
);
