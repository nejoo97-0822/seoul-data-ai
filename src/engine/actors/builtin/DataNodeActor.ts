/**
 * DataNodeActor — a data entity that can be "found" by a scan.
 *
 * Starts as a small dormant dot. When activated (via events),
 * it glows, floats, and reveals a label. Represents a dataset
 * in the archive being discovered.
 */

import { Container, Graphics, Text } from "pixi.js";
import { registerActor, skinColor } from "../ActorFactory";
import type { ActorDefinition, ThemeDefinition } from "../../core/types";

registerActor(
  "dataNode",
  (def: ActorDefinition, theme: ThemeDefinition) => {
    const container = new Container();
    const label = (def.data?.label as string) ?? "";
    const size = (def.data?.size as number) ?? 8;
    const variant = (def.data?.variant as string) ?? "dormant"; // dormant | found | decoy
    const color = skinColor(theme, "glyph", "stroke");
    const colorNum = parseInt(color.replace("#", ""), 16);

    // --- Dormant state: just a dim dot ---
    const dormantDot = new Graphics();
    dormantDot.circle(0, 0, size * 0.5);
    dormantDot.fill({ color: colorNum, alpha: 0.2 });
    dormantDot.label = "dormant";
    container.addChild(dormantDot);

    // --- Found state: glowing orb with label (starts hidden) ---
    const foundGroup = new Container();
    foundGroup.alpha = 0;
    foundGroup.label = "found";

    // Outer glow
    const glow3 = new Graphics();
    glow3.circle(0, 0, size * 3.5);
    glow3.fill({ color: colorNum, alpha: 0.04 });
    foundGroup.addChild(glow3);

    const glow2 = new Graphics();
    glow2.circle(0, 0, size * 2.2);
    glow2.fill({ color: colorNum, alpha: 0.08 });
    foundGroup.addChild(glow2);

    const glow1 = new Graphics();
    glow1.circle(0, 0, size * 1.4);
    glow1.fill({ color: colorNum, alpha: 0.15 });
    foundGroup.addChild(glow1);

    // Core orb
    const core = new Graphics();
    core.circle(0, 0, size);
    core.fill({ color: colorNum, alpha: 0.9 });
    foundGroup.addChild(core);

    // White center
    const center = new Graphics();
    center.circle(0, 0, size * 0.35);
    center.fill({ color: 0xffffff, alpha: 0.7 });
    foundGroup.addChild(center);

    // Label text (below the orb)
    if (label) {
      const labelBg = new Graphics();
      const textMetrics = { w: label.length * 7.5 + 16, h: 20 };
      labelBg.roundRect(-textMetrics.w / 2, size * 2, textMetrics.w, textMetrics.h, 4);
      labelBg.fill({ color: 0xffffff, alpha: 0.85 });
      labelBg.stroke({ color: colorNum, width: 1, alpha: 0.25 });
      foundGroup.addChild(labelBg);

      const t = new Text({
        text: label,
        style: {
          fontFamily: theme.fontFamily,
          fontSize: 9,
          fontWeight: "600",
          fill: color,
          letterSpacing: 0.3,
        },
      });
      t.anchor.set(0.5, 0);
      t.y = size * 2 + 4;
      foundGroup.addChild(t);
    }

    container.addChild(foundGroup);

    // Store references for event handlers
    (container as unknown as Record<string, unknown>).__dormantDot = dormantDot;
    (container as unknown as Record<string, unknown>).__foundGroup = foundGroup;

    return container;
  }
);
